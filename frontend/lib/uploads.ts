import { api } from "@/lib/api";

export interface UploadSignature {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function isCloudinaryUrl(url: string): boolean {
  return /res\.cloudinary\.com/.test(url);
}

export async function uploadProductImage(file: File, token: string): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or GIF image");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Each image must be 8 MB or smaller");
  }

  const sign = await api<UploadSignature>("/admin/uploads/signature", { method: "POST", token });
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("signature", sign.signature);
  body.append("folder", sign.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };
  if (!response.ok || !payload.secure_url) {
    throw new Error(payload.error?.message ?? "Cloudinary upload failed");
  }
  return payload.secure_url;
}

export async function destroyProductImage(url: string, token: string): Promise<void> {
  if (!isCloudinaryUrl(url)) return;
  await api("/admin/uploads/destroy", { method: "POST", token, body: { url } });
}
