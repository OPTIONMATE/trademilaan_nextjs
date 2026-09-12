// Targeted isolation tests for the Priority 1 OTP architecture fix.
//
// Runs the OTP service (src/app/lib/otpService.js) against an ISOLATED,
// throwaway test database so production data is never touched. The test DB is
// dropped before disconnect. No emails are ever sent.
//
// Usage: node test-otp-isolation.mjs
import "dotenv/config";
import mongoose from "mongoose";

const TEST_DB_NAME = "trademilaan_otp_test";

let failures = [];
function assert(cond, msg) {
  if (cond) {
    console.log("  PASS:", msg);
  } else {
    failures.push(msg);
    console.error("  FAIL:", msg);
  }
}

// Set an isolated DB name BEFORE importing db.js (db.js reads env at import).
process.env.DB_NAME = TEST_DB_NAME;

if (!process.env.MONGO_URI) {
  console.log("SKIP: MONGO_URI not set — cannot run DB-backed OTP tests.");
  process.exit(0);
}

const { default: connectDB } = await import("./src/app/lib/db.js");
const { default: OTP } = await import("./src/app/lib/models/OTP.js");
const {
  issueOTP,
  verifyOTP,
  findLatestPendingOTP,
  removePendingOTPs,
  OTP_PURPOSES,
} = await import("./src/app/lib/otpService.js");

const REG = OTP_PURPOSES.REGISTRATION;
const ADMIN = OTP_PURPOSES.ADMIN_SIGNUP;
const BUY = OTP_PURPOSES.BUY_VERIFICATION;

const oid = () => new mongoose.Types.ObjectId();

async function pendingCount(userId, purpose) {
  return OTP.countDocuments({ userId, purpose, status: "pending" });
}

try {
  await connectDB();

  // Fresh, empty OTP collection + build indexes (incl. the partial unique one).
  await OTP.collection.drop().catch(() => {});
  await OTP.syncIndexes();

  // --- T1: basic issue + hashing + format -------------------------------
  console.log("\nT1: issue & storage");
  const userA = oid();
  const regA1 = await issueOTP({ userId: userA, email: "A@Example.COM", purpose: REG, ttlMinutes: 10 });
  assert(/^\d{6}$/.test(regA1), "REGISTRATION OTP is a 6-digit string");
  const storedA = await OTP.findOne({ userId: userA, purpose: REG, status: "pending" });
  assert(storedA && storedA.otpHash.startsWith("$2"), "stored OTP is a bcrypt hash (not plaintext)");
  assert(storedA && storedA.otpHash !== regA1, "hash differs from plaintext OTP");
  assert(storedA && storedA.email === "a@example.com", "email is normalized to lowercase");
  assert(storedA && storedA.status === "pending" && storedA.attempts === 0, "status=pending, attempts=0");
  assert(storedA && storedA.expiresAt.getTime() > Date.now() + 9 * 60 * 1000, "expiry ~10 min in future");

  // --- T2: purpose isolation (registration vs buy) ----------------------
  console.log("\nT2: purpose isolation (Test A/C)");
  const buyA = await issueOTP({ userId: userA, email: "a@example.com", purpose: BUY, ttlMinutes: 5 });
  assert((await pendingCount(userA, REG)) === 1, "still exactly 1 pending REGISTRATION after issuing BUY");
  assert((await pendingCount(userA, BUY)) === 1, "exactly 1 pending BUY");
  assert((await pendingCount(userA, ADMIN)) === 0, "no pending ADMIN created by accident");
  assert((await verifyOTP({ userId: userA, purpose: REG, otp: regA1 })).valid, "REGISTRATION code still valid after BUY issued");
  assert((await verifyOTP({ userId: userA, purpose: BUY, otp: buyA })).valid, "BUY code valid");

  // --- T3: single use (Test F) ------------------------------------------
  console.log("\nT3: single use");
  const userB = oid();
  const regB = await issueOTP({ userId: userB, email: "b@example.com", purpose: REG, ttlMinutes: 10 });
  // one wrong attempt first (attempts -> 1)
  let r = await verifyOTP({ userId: userB, purpose: REG, otp: "000000" });
  assert(r.reason === "mismatch", "wrong code -> mismatch");
  assert((await OTP.findOne({ userId: userB, purpose: REG, status: "pending" })).attempts === 1, "attempt counter incremented on wrong code");
  r = await verifyOTP({ userId: userB, purpose: REG, otp: regB });
  assert(r.valid, "correct code verifies after one wrong attempt");
  r = await verifyOTP({ userId: userB, purpose: REG, otp: regB });
  assert(!r.valid, "reusing the same code fails (single use)");

  // --- T4: resend invalidates old registration OTP (Test B) --------------
  console.log("\nT4: resend (latest wins)");
  const userC = oid();
  const regC1 = await issueOTP({ userId: userC, email: "c@example.com", purpose: REG, ttlMinutes: 10 });
  const regC2 = await issueOTP({ userId: userC, email: "c@example.com", purpose: REG, ttlMinutes: 10 });
  assert(regC1 !== regC2, "new code differs from old");
  assert((await pendingCount(userC, REG)) === 1, "only one pending REGISTRATION after resend");
  assert(!(await verifyOTP({ userId: userC, purpose: REG, otp: regC1 })).valid, "old registration code is now invalid");
  assert((await verifyOTP({ userId: userC, purpose: REG, otp: regC2 })).valid, "new registration code works");

  // --- T5: admin + registration isolation (Test D) ----------------------
  console.log("\nT5: admin + registration isolation");
  const userD = oid();
  const adminD = await issueOTP({ userId: userD, email: "d@example.com", purpose: ADMIN, ttlMinutes: 5 });
  const regD = await issueOTP({ userId: userD, email: "d@example.com", purpose: REG, ttlMinutes: 10 });
  assert((await pendingCount(userD, ADMIN)) === 1 && (await pendingCount(userD, REG)) === 1, "admin & registration coexist (one pending each)");
  assert((await verifyOTP({ userId: userD, purpose: ADMIN, otp: adminD })).valid, "admin code valid after registration issued");
  assert((await verifyOTP({ userId: userD, purpose: REG, otp: regD })).valid, "registration code valid after admin issued");

  // --- T6: concurrency — multiple simultaneous issues (Test E) ----------
  console.log("\nT6: concurrent issuance (one active OTP)");
  const userE = oid();
  const issued = await Promise.all([
    issueOTP({ userId: userE, email: "e@example.com", purpose: REG, ttlMinutes: 10 }),
    issueOTP({ userId: userE, email: "e@example.com", purpose: REG, ttlMinutes: 10 }),
    issueOTP({ userId: userE, email: "e@example.com", purpose: REG, ttlMinutes: 10 }),
  ]);
  assert((await pendingCount(userE, REG)) === 1, "exactly one pending REGISTRATION after 3 concurrent issues");
  const results = await Promise.all(
    issued.map((code) => verifyOTP({ userId: userE, purpose: REG, otp: code }))
  );
  assert(results.filter((r) => r.valid).length === 1, "exactly one of the concurrently issued codes verifies");

  // --- T7: expiry (Test K equivalent) -----------------------------------
  console.log("\nT7: expiry");
  const userF = oid();
  const buyF = await issueOTP({ userId: userF, email: "f@example.com", purpose: BUY, ttlMinutes: 5 });
  await OTP.updateOne(
    { userId: userF, purpose: BUY, status: "pending" },
    { $set: { expiresAt: new Date(Date.now() - 1000) } }
  );
  let rf = await verifyOTP({ userId: userF, purpose: BUY, otp: buyF });
  assert(rf.reason === "expired" && !rf.valid, "expired OTP rejected with reason=expired");

  // --- T8: attempts exceeded --------------------------------------------
  console.log("\nT8: attempts exceeded");
  const userG = oid();
  await issueOTP({ userId: userG, email: "g@example.com", purpose: REG, ttlMinutes: 10 });
  let lastReason = "";
  for (let i = 0; i < 6; i++) {
    const rr = await verifyOTP({ userId: userG, purpose: REG, otp: "000000" });
    lastReason = rr.reason;
  }
  assert(lastReason === "attempts_exceeded", "6th wrong attempt blocked (reason=attempts_exceeded)");

  // --- T9: user isolation (registration code does not cross users) ------
  console.log("\nT9: user isolation");
  const userH = oid();
  const userI = oid();
  const regH = await issueOTP({ userId: userH, email: "h@example.com", purpose: REG, ttlMinutes: 10 });
  const ri = await verifyOTP({ userId: userI, purpose: REG, otp: regH });
  assert(!ri.valid && ri.reason === "not_found", "user H's code is not found for user I (not_found)");

  // --- T10: validation of the service API --------------------------------
  console.log("\nT10: service input validation");
  let threw = false;
  try { await issueOTP({ userId: userA, email: "x@example.com", purpose: "NOPE", ttlMinutes: 5 }); } catch { threw = true; }
  assert(threw, "unknown purpose throws");
  threw = false;
  try { await issueOTP({ email: "y@example.com", purpose: REG, ttlMinutes: 5 }); } catch { threw = true; }
  assert(threw, "missing userId throws");
  assert((await findLatestPendingOTP({ userId: userH, purpose: REG })) !== null, "findLatestPendingOTP returns a record");
  assert((await removePendingOTPs({ userId: oid(), purpose: REG })) === undefined, "removePendingOTPs is safe on no-op");

  console.log("\n=============================");
  if (failures.length) {
    console.error(`${failures.length} assertion(s) FAILED:`);
    failures.forEach((f) => console.error(" - " + f));
  } else {
    console.log("ALL OTP ISOLATION TESTS PASSED");
  }
  console.log("=============================");
} catch (err) {
  console.error("TEST ERROR:", err && err.stack ? err.stack : String(err));
  failures.push("unexpected error: " + (err && err.message ? err.message : String(err)));
} finally {
  try {
    await mongoose.connection.dropDatabase().catch(() => {});
  } catch {}
  try {
    await mongoose.disconnect();
  } catch {}
}

process.exit(failures.length ? 1 : 0);

