import { getCloudinary, publicIdFromUrl } from "../../lib/cloudinary";
import { ApiError } from "../../utils/ApiError";

export function createUploadSignature() {
  const { client, config, folder } = getCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder };
  const signature = client.utils.api_sign_request(params, config.api_secret as string);

  return {
    cloudName: config.cloud_name,
    apiKey: config.api_key,
    timestamp,
    folder,
    signature,
  };
}

export async function destroyUpload(url: string) {
  const publicId = publicIdFromUrl(url);
  if (!publicId) {
    throw ApiError.badRequest("Not a Cloudinary image URL");
  }

  const { client } = getCloudinary();
  await client.uploader.destroy(publicId);
  return { publicId };
}
