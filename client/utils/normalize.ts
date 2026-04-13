// Normalizar texto
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Capitalizar
export const capitalize = (text: string) => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Obtener tipo de archivo desde la URL
export const getMimeTypeFromUrl = (url: string): string | null => {
  if (!url) return null;

  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    return null;
  }

  const ext = pathname.split(".").pop()?.toLowerCase();
  if (!ext) return null;

  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    webm: "video/webm",
    svg: "image/svg+xml",
    mp4: "video/mp4",
  };

  const mimeType = mimeTypes[ext.toLowerCase()];

  if (!mimeType) return null;

  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("image/")) return "image";

  return null;
};