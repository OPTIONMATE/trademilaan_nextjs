/**
 * Shared profile field normalization helpers.
 *
 * Safe for both server (route handlers) and client (React components) use —
 * this module must not import any Node-only modules.
 *
 * The rest of the app stores:
 *   - `gender` as "Male" | "Female" | "Other"
 *     (see components/buy/BuyDetailsForm.jsx and components/EditProfileModal.jsx)
 *   - `dob` as a `yyyy-MM-dd` string
 *     (schema: lib/models/User.js declares `dob: { type: String }`)
 *
 * Keeping those two fields in their canonical format is what allows the
 * profile page and the Edit Profile form controls to render saved values back
 * (a lowercase "male" never matches the <select> options, and a raw
 * `Date#toString()` value is rejected by <input type="date">).
 */

const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  other: "Other",
};

/**
 * Normalizes a gender value to its canonical label.
 * Accepts any casing/whitespace ("male", " MALE ", "Male").
 * @param {unknown} value
 * @returns {"Male"|"Female"|"Other"|null} null when the value is not recognised
 */
export function normalizeGender(value) {
  if (value === undefined || value === null) return null;
  const key = String(value).trim().toLowerCase();
  return GENDER_LABELS[key] || null;
}

/**
 * Normalizes a date-of-birth value to a `yyyy-MM-dd` string.
 * Handles ISO strings ("2005-05-14T00:00:00.000Z"), plain dates ("2005-05-14")
 * and legacy values previously stored via `Date#toString()`.
 * @param {unknown} value
 * @returns {string|null} null when the value cannot be parsed as a date
 */
export function normalizeDob(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  const yyyy = String(date.getUTCFullYear()).padStart(4, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
