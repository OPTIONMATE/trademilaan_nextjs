import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a PDF file to Cloudinary
 * PDFs must be uploaded as "raw" resource type
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @param {string} filename - Original filename with .pdf extension
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, publicId: string, secureUrl: string}>}
 */
export async function uploadToCloudinary(
  fileBuffer,
  filename,
  folder = "trademilaan/documents"
) {
  return new Promise((resolve, reject) => {
    const publicId = filename.replace(/\.[^/.]+$/, ""); // Remove extension

    console.log("Uploading to Cloudinary:", {
      filename,
      publicId,
      folder,
      bufferSize: fileBuffer.length,
    });

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "raw", // ✅ PDFs MUST be "raw"
        public_id: publicId,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        type: "upload",
        tags: ["pdf", "agreement"],
      },
      (error, result) => {
        if (error) {
          console.error("Upload stream error:", error);
          reject(error);
        } else {
          console.log("Cloudinary upload success:", {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: result.resource_type,
          });

          // ✅ IMPORTANT: For raw files, add ?dl=1 to force download with extension
          const downloadUrl = `${result.secure_url}?dl=1`;

          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            downloadUrl: downloadUrl,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFromCloudinary(publicId) {
  try {
    console.log("Deleting from Cloudinary:", publicId);

    // ✅ For PDFs, must use resource_type: "raw"
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });

    console.log("Successfully deleted:", publicId, result);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
}

export default cloudinary;