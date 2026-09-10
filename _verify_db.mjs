// Temp verification script — connects read-only and prints the selected DB name only.
// Never prints credentials. Deleted after verification.
import "dotenv/config";
import mongoose from "mongoose";

const uriVars = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => /^(MONGO_URI|DB_NAME)$/.test(k))
);
console.log("DB_NAME =", uriVars.DB_NAME);
console.log("MONGO_URI present =", Boolean(uriVars.MONGO_URI), "(value hidden)");

if (!uriVars.MONGO_URI || !uriVars.DB_NAME) {
  console.error("Missing env; cannot verify connection.");
  process.exit(2);
}

try {
  const { default: connectDB } = await import("./src/app/lib/db.js");
  const conn = await connectDB();
  console.log("connected readyState =", conn.connection.readyState);

  // Report effective DB name via multiple Mongoose properties (no secrets printed).
  const info = {
    "mongoose.connection.name": mongoose.connection.name,
    "mongoose.connection.db.getName()": mongoose.connection.db.getName(),
    "mongoose.connections[0].name": mongoose.connections[0].name,
    "mongoose.connections[0].db.getName()": mongoose.connections[0].db.getName(),
  };
  for (const [k, v] of Object.entries(info)) console.log(`${k} = ${v}`);

  await mongoose.disconnect();
  console.log("DONE");
  process.exit(0);
} catch (e) {
  console.error("VERIFY_FAILED:", e && e.message ? e.message : String(e));
  process.exit(1);
}