import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

function configured() {
  if (env.CLOUDINARY_URL) return true;
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

export function getCloudinary() {
  if (!configured()) {
    throw ApiError.serviceUnavailable(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }

  if (env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
  } else {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw ApiError.serviceUnavailable("Cloudinary is not configured.");
  }

  return { client: cloudinary, config, folder: env.CLOUDINARY_FOLDER };
}

export function publicIdFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const marker = pathname.indexOf("/upload/");
    if (marker === -1) return null;
    const rest = pathname.slice(marker + "/upload/".length).replace(/^v\d+\//, "");
    return rest.replace(/\.[a-z0-9]+$/i, "") || null;
  } catch {
    return null;
  }
}
