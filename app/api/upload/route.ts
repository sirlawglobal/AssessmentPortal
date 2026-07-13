import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const hasCloudinary =
      process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET);

    if (hasCloudinary) {
      if (!process.env.CLOUDINARY_URL) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        });
      } else {
        cloudinary.config({ secure: true });
      }

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "assessment_portal_uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(error);
            }
            if (!result || !result.secure_url) {
              return reject(new Error("No secure_url returned from Cloudinary"));
            }
            resolve(result.secure_url);
          }
        );

        uploadStream.end(buffer);
      });

      return NextResponse.json({ url: secureUrl, provider: "cloudinary" });
    }

    // Fallback to local disk storage when Cloudinary keys aren't set
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${originalName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url, provider: "local" });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
