import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(
  fileBuffer,
  filename,
  folder = "trademilaan/documents"
) {
  return new Promise((resolve, reject) => {
    const baseName = filename.replace(/\.[^/.]+$/, "");
    const publicId = `${folder}/${baseName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        overwrite: true,
        unique_filename: false,
        use_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary RAW upload error:", error);
          return reject(error);
        }

        const cloud = process.env.CLOUDINARY_CLOUD_NAME;

       const downloadUrl = `https://res.cloudinary.com/${cloud}/raw/upload/fl_attachment/${baseName}.pdf/${result.public_id}.pdf`;


        resolve({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          downloadUrl,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
}

export default cloudinary;
