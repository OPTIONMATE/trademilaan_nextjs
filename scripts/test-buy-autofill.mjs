/**
 * Unit tests for the profile prefill helpers used by the service-purchase
 * "Complete Your Details" step (components/buy/BuyDetailsForm.jsx).
 *
 * These helpers decide what an existing user record contributes as the *initial*
 * form values (and what it must not contribute). Run:
 *
 *   node scripts/test-buy-autofill.mjs
 */
const { profileValueFromUserRecord, sanitizeProfileInput } = await import(
  "../src/app/lib/profileFields.js"
);

let failures = 0;

function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${
      ok ? "" : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    }`,
  );
}

console.log("\n# Stored user record -> form control values\n");

check(
  "fullName is trimmed",
  profileValueFromUserRecord("fullName", "  Harsha Vardhan  "),
  "Harsha Vardhan",
);
check("email is passed through", profileValueFromUserRecord("email", "a@b.com"), "a@b.com");
check(
  "phone with country prefix keeps the last 10 digits",
  profileValueFromUserRecord("phone", "+91 98765 43210"),
  "9876543210",
);
check("plain 10-digit phone is unchanged", profileValueFromUserRecord("phone", "9876543210"), "9876543210");
check(
  "PAN is upper-cased and whitespace-stripped",
  profileValueFromUserRecord("panNumber", " abcde1234f "),
  "ABCDE1234F",
);
check("ISO dob maps onto <input type=date>", profileValueFromUserRecord("dob", "2005-05-14T00:00:00.000Z"), "2005-05-14");
check("plain dob is unchanged", profileValueFromUserRecord("dob", "2005-05-14"), "2005-05-14");
check("unparseable dob falls back to empty", profileValueFromUserRecord("dob", "not-a-date"), "");
check("lowercase gender is canonicalised", profileValueFromUserRecord("gender", "male"), "Male");
check("mixed-case gender is canonicalised", profileValueFromUserRecord("gender", " FEMALE "), "Female");
check("unknown gender falls back to empty", profileValueFromUserRecord("gender", "xyz"), "");
check("state passes through", profileValueFromUserRecord("state", "Telangana"), "Telangana");
check("missing values stay empty (no crash)", profileValueFromUserRecord("phone", undefined), "");
check("null values stay empty", profileValueFromUserRecord("panNumber", null), "");
check("extraneous fields are readable", profileValueFromUserRecord("riskProfile", 42), "42");

console.log("\n# User typing sanitisation\n");

check(
  "typing a phone keeps the first 10 digits",
  sanitizeProfileInput("phone", "+91 98765-43210"),
  "9198765432",
);
check("typing PAN upper-cases and strips spaces", sanitizeProfileInput("panNumber", "abc de1234f"), "ABCDE1234F");
check("typing a name is untouched", sanitizeProfileInput("fullName", "Harsha V"), "Harsha V");

console.log("\n# Prefill overlay semantics (as used by BuyDetailsForm)\n");

const EMPTY_FORM = { fullName: "", dob: "", gender: "", state: "", email: "", phone: "", panNumber: "" };
const prefilled = { fullName: "Harsha", email: "a@b.com" };
const withEdits = (edits) => ({ ...EMPTY_FORM, ...prefilled, ...edits });

check("record values become the initial values", withEdits({}).fullName, "Harsha");
check("an empty form keeps untouched fields empty", withEdits({}).state, "");
check("a typed value wins over the record", withEdits({ fullName: "Someone else" }).fullName, "Someone else");
check("clearing a prefilled field sticks", withEdits({ fullName: "" }).fullName, "");
check("clearing one field leaves the others prefilled", withEdits({ fullName: "" }).email, "a@b.com");

console.log(
  failures === 0
    ? "\nAll checks passed.\n"
    : `\n${failures} check(s) failed.\n`,
);

process.exit(failures === 0 ? 0 : 1);
