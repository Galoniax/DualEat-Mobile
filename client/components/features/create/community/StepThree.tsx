import { CommunityDTO, UploadableFile } from "@/interface/global.dto";
import { pickMedia } from "@/utils/media";
import { Entypo } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface StepProps {
  community: CommunityDTO;
  setCommunity: React.Dispatch<React.SetStateAction<CommunityDTO>>;
}

export default function StepThree({ community, setCommunity }: StepProps) {
  const handlePickImage = async (type: "image_url" | "banner_url") => {
    const images = await pickMedia({
      mediaType: "Images",
      allowsEditing: true,
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });

    if (images.length > 0) {
      setCommunity((prev) => ({
        ...prev,
        [type]: images[0],
      }));
    }
  };

  return (
    <View className="flex-col flex-1 px-5 py-4 gap-y-6">
      <Text className="font-dosis-bold text-[22px] text-text-3">
        Personaliza tu comunidad
      </Text>
      <Text className="font-dosis-regular text-[16px] text-text-5 leading-7">
        Agrega una imagen y un banner para tu comunidad así los usuarios podrán
        identificarte mejor
      </Text>

      <View className="flex-col gap-y-6">
        <View className="p-2 border border-gray-200 rounded-lg">
          {community.banner_url ? (
            <Image
              source={{ uri: (community.banner_url as UploadableFile).uri }}
              className="w-full h-16 rounded-t-[20px]"
            />
          ) : (
            <View className="w-full h-16 bg-gray-200 rounded-t-[20px] flex items-center justify-center" />
          )}

          <View className="w-full flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => handlePickImage("banner_url")}
              className="flex-1 py-3 px-2 gap-x-4 items-center flex-row "
            >
              <Entypo name="image" size={18} color="#2F2F2F" />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-dosis-regular text-[14px] text-text-3"
              >
                {(community.banner_url as UploadableFile).name || "Agregar banner"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-2 border border-gray-200 rounded-lg flex-row gap-x-4">
          {community.image_url ? (
            <Image
              source={{ uri: (community.image_url as UploadableFile).uri }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <View className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center" />
          )}

          <View className="w-full flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => handlePickImage("image_url")}
              className="flex-1 py-3 px-2 gap-x-4 items-center flex-row "
            >
              <Entypo name="image" size={18} color="#2F2F2F" />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="font-dosis-regular text-[14px] max-w-[50%] text-text-3"
              >
                {(community.image_url as UploadableFile).name || "Agregar icono de la comunidad"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
