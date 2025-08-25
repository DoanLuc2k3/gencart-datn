// Cloudinary configuration helper for frontend usage.
// Ensure you define VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET in .env.local
// Never expose API secret in a Vite-exposed variable.

export function getCloudinaryConfig() {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const unsignedPreset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
  if (!cloudName) throw new Error("Missing VITE_CLOUDINARY_CLOUD_NAME");
  if (!unsignedPreset)
    throw new Error("Missing VITE_CLOUDINARY_UNSIGNED_PRESET");
  return { cloudName, unsignedPreset };
}

export async function uploadImageToCloudinary(file) {
  const { cloudName, unsignedPreset } = getCloudinaryConfig();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", unsignedPreset);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || "Cloudinary upload failed");
  }
  return json; // includes secure_url, public_id, etc.
}
