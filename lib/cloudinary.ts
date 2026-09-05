import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Cloudinary environment variables are not configured");
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export async function uploadDocumentToCloudinary(
  file: File,
  companyId: string,
  employeeId: string,
  title: string,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const publicId = `${companyId}/${employeeId}/${Date.now()}-${safeTitle || "document"}`;

  return new Promise<string>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: "nexahr/documents",
        public_id: publicId,
        resource_type: "auto",
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("Cloudinary did not return a file URL"));
          return;
        }
        resolve(result.secure_url);
      },
    );

    upload.end(buffer);
  });
}
