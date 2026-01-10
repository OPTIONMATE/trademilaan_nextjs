import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINNARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} filename - Original filename
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<{url: string, publicId: string, secureUrl: string}>}
 */
export async function uploadToCloudinary(fileBuffer, filename, folder = "trademilaan/documents") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "raw", // For PDF and other non-image files
        public_id: filename.replace(/\.[^/.]+$/, ""), // Remove extension
        overwrite: true,
        use_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
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
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
}

export default cloudinary;
