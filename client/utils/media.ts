import { UploadableFile } from "@/interface/global.dto";
import * as ImagePicker from "expo-image-picker";

const MAX_IMAGE_SIZE_MB = 3;
const MAX_VIDEO_SIZE_MB = 30;

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

export const pickMedia = async ({
  mediaType = "Images",
  allowsMultipleSelection = false,
  allowsEditing = false,
  selectionLimit = 1,
}: PickMediaOptions = {}): Promise<UploadableFile[]> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    console.log("Permiso de galería denegado");
    return [];
  }

  let expoMediaTypes: ("images" | "videos")[] = ["images"];

  if (mediaType === "Videos") expoMediaTypes = ["videos"];
  if (mediaType === "All") expoMediaTypes = ["images", "videos"];

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: expoMediaTypes,
    allowsMultipleSelection,
    allowsEditing: allowsMultipleSelection ? false : allowsEditing,
    quality: 1,
    selectionLimit,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return [];
  }

  const validMedia: UploadableFile[] = [];

  for (const asset of result.assets) {
    const isVideo = asset.type === "video";

    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    const validTypes = isVideo ? VIDEO_TYPES : IMAGE_TYPES;

    if (asset.fileSize && asset.fileSize > maxSize) {
      console.log(
        `${isVideo ? "Video" : "Imagen"} omitida por exceder tamaño: ${asset.uri}`,
      );
      continue;
    }

    const fileExtension = asset.uri.split(".").pop()?.toLowerCase();
    const mimeType = asset.mimeType || `${asset.type}/${fileExtension}`;

    if (!validTypes.includes(mimeType)) {
      console.log(
        `Archivo omitido por formato no válido (${mimeType}): ${asset.uri}`,
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
};
