import { UploadableFile } from "@/interface/global.dto";
import { globalToast as toast } from "@/utils/toast";
import * as ImagePicker from "expo-image-picker";

const MAX_IMAGE_SIZE_MB = 3;
const MAX_VIDEO_SIZE_MB = 20;

const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/mov", "video/avi"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

export interface PickMediaOptions {
  mediaType?: "Images" | "Videos" | "All";
  allowsMultipleSelection?: boolean;
  allowsEditing?: boolean;
  selectionLimit?: number;
}

let isPicking = false;

// --- 1. OBTENER IMAGEN O VIDEO DE LA GALERÍA ---
// ===================================
export const pickMedia = async ({
  mediaType = "Images",
  allowsMultipleSelection = false,
  allowsEditing = false,
  selectionLimit = 1,
}: PickMediaOptions = {}): Promise<UploadableFile[]> => {
  if (isPicking) {
    return [];
  }

  isPicking = true;

  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permisos denegados", "Se necesitan permisos para acceder a la galería");
      return [];
    }

    let expoMediaTypes: ("images" | "videos")[] = ["images"];

    if (mediaType === "Videos") expoMediaTypes = ["videos"];
    if (mediaType === "All") expoMediaTypes = ["images", "videos"];

    let result;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: expoMediaTypes,
        allowsMultipleSelection,
        allowsEditing: allowsMultipleSelection ? false : allowsEditing,
        quality: 1,
        selectionLimit,
      });
    } catch (error) {
      console.error("Error al abrir la galería:", error);
      toast.error(
        "Error al abrir galería",
        "Intenta de nuevo. Si el error persiste, reinicia la app.",
      );
      return [];
    }

    if (!result || result.canceled || !result.assets || result.assets.length === 0) {
      return [];
    }

    const validMedia: UploadableFile[] = [];

    for (const asset of result.assets) {
      const isVideo = asset.type === "video";

      const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
      const validTypes = isVideo ? VIDEO_TYPES : IMAGE_TYPES;

      if (asset.fileSize && asset.fileSize > maxSize) {
        toast.error(
          "Tamaño excedido",
          `El archivo seleccionado excede el tamaño máximo permitido de ${isVideo ? "20MB" : "3MB"}.`,
        );
        continue;
      }

      const fileExtension = asset.uri.split(".").pop()?.toLowerCase();
      const mimeType = asset.mimeType || `${asset.type}/${fileExtension}`;

      if (!validTypes.includes(mimeType)) {
        toast.error(
          "Formato no válido",
          `El archivo seleccionado no es un ${isVideo ? "video" : "imagen"}.`,
        );
        continue;
      }

      const fileName =
        asset.fileName ||
        `${asset.type}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

      validMedia.push({
        uri: asset.uri,
        type: mimeType,
        name: fileName,
      });
    }

    return validMedia;
  } finally {
    isPicking = false;
  }
};

// --- 2. OBTENER TIPO DE MEDIA DESDE UNA URL ---
// ===================================
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
    gif: "image/gif",
    webp: "image/webp",
    webm: "video/webm",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
  };

  const mimeType = mimeTypes[ext.toLowerCase()];

  if (!mimeType) return null;

  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.startsWith("image/")) return "image";

  return null;
};
  
export const getMimeType = (type: string) => {
  const mimeTypes: Record<string, string> = {
    "image/jpeg": "image",
    "image/png": "image",
    "image/gif": "image",
    "image/webp": "image",
    "video/webm": "video",
    "image/svg+xml": "image",
    "video/mp4": "video",
    "audio/mpeg": "audio",
    "audio/wav": "audio",
    "audio/ogg": "audio",
  };

  return mimeTypes[type] || "image";
};