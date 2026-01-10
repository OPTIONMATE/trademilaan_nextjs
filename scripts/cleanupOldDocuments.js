/**
 * Migration script to remove old file buffers from documents
 * This cleans up documents that were stored with the old schema that had 'data' field
 * Run this once: node scripts/cleanupOldDocuments.js
 */

import mongoose from "mongoose";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../.env") });

async function cleanup() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI not defined in .env file");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB...");

    // Get the Document model
    const Document = mongoose.model("Document");

    // Find documents that still have the 'data' field
    const documentsWithData = await Document.find({ data: { $exists: true } });
    console.log(`Found ${documentsWithData.length} documents with old 'data' field`);

    if (documentsWithData.length > 0) {
      // Calculate space to be freed
      let spaceFreed = 0;
      documentsWithData.forEach((doc) => {
        if (doc.data && Buffer.isBuffer(doc.data)) {
          spaceFreed += doc.data.length;
        }
      });

      // Remove the 'data' field from all documents
      const result = await Document.updateMany(
        { data: { $exists: true } },
        { $unset: { data: "" } }
      );

      console.log(`\n✅ Cleanup complete!`);
      console.log(`   📊 Documents updated: ${result.modifiedCount}`);
      console.log(`   💾 Space freed: ~${(spaceFreed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   📝 All files are now stored only in Cloudinary\n`);
    } else {
      console.log("✅ No old documents found. Database is clean!");
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Cleanup failed:", error.message);
    process.exit(1);
  }
}

cleanup();
