import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JSX, useMemo, useState } from "react";
import { CommunityDTO } from "@/interface/global.dto";
import { useRouter } from "expo-router";
import { Entypo, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/services/category.api";
import { CommunityTag } from "@/interface/global";
import { pickMedia } from "@/utils/media";

interface GroupedTags {
  title: string;
  category_id: number;
  data: CommunityTag[];
}

export default function CreateCommunityScreen() {
  const router = useRouter();
  const [step, setStep] = useState(3);

  const [community, setCommunity] = useState<CommunityDTO>({
    name: "",
    description: "",
    image_url: {
      uri: "",
      name: "",
      type: "",
    },
    banner_url: {
      uri: "",
      name: "",
      type: "",
    },
    tags: [] as number[],
  });

  const { data: tags, isLoading } = useQuery({
    queryKey: ["categories", "tags"],
    queryFn: async () => {
      const response = await getTags();
      if (!response?.success || !response?.data) {
        throw new Error("Error en la respuesta del post");
      }
      return response.data as CommunityTag[];
    },

    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: step === 1,

    staleTime: 30 * 60 * 1000,
  });

  const handleNext = () => {
    if (step !== 3) setStep((prev) => prev + 1);

    if (step === 3) {
      console.log(community);
    }
  };

  const handleBack = () => {
    if (step !== 1) setStep((prev) => prev - 1);
    if (step === 1) router.back();
  };

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

  const groupTagsByCategory = (tags: CommunityTag[]) => {
    const agrupado = tags.reduce(
      (index, tag) => {
        const categoria = tag.category.name;

        if (!index[categoria]) {
          index[categoria] = {
            title: categoria,
            category_id: tag.category.id,
            data: [],
          };
        }
        index[categoria].data.push(tag);

        return index;
      },
      {} as Record<string, GroupedTags>,
    );

    return Object.values(agrupado);
  };

  const sections = useMemo(
    () => (tags ? groupTagsByCategory(tags) : []),
    [tags],
  );

  const variables: Record<number, JSX.Element> = {
    1: (
      <View className="flex-col flex-1 px-5 py-4 gap-y-6">
        <Text className="font-dosis-bold text-[22px] text-text-3">
          ¿De qué se trata tu comunidad?
        </Text>
        <Text className="font-dosis-regular text-[16px] text-text-5 leading-7">
          Selecciona las categorías principales de tu comunidad para que los
          usuarios puedan identificar de qué se trata
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size={30} color="#e5a657" />
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item) => item.category_id.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }: { item: GroupedTags }) => (
              <View className="w-full mb-6">
                <Text className="font-dosis-bold text-[16px] text-text-3 mb-3">
                  {item.title}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  {item.data.map((tag) => {
                    const isSelected = community.tags.includes(tag.id);

                    return (
                      <TouchableOpacity
                        key={tag.id}
                        onPress={() => {
                          // TODO: Toast
                          if (community.tags.length >= 3 && !isSelected) {
                            return;
                          }
                          setCommunity((prev: CommunityDTO) => {
                            if (isSelected) {
                              return {
                                ...prev,
                                tags: prev.tags.filter((t) => t !== tag.id),
                              };
                            }

                            return {
                              ...prev,
                              tags: [...prev.tags, tag.id],
                            };
                          });
                        }}
                        className={`px-4 py-1.5 rounded-full border ${
                          isSelected
                            ? "bg-bg-yellow border-bg-semi-white"
                            : " border-gray-200"
                        }`}
                      >
                        <Text
                          className={`font-dosis-regular text-[14px] ${
                            isSelected ? "text-white" : "text-text-4"
                          }`}
                        >
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          />
        )}
      </View>
    ),

    2: (
      <View className="flex-col flex-1 px-5 py-4 gap-y-6">
        <Text className="font-dosis-bold text-[22px] text-text-3">
          Cuéntanos sobre tu comunidad
        </Text>
        <Text className="font-dosis-regular text-[16px] text-text-5 leading-7">
          Danos un nombre y una descripción para tu comunidad. Cuanto más
          detallada sea la descripción, mejor podrán entender los usuarios de
          qué se trata tu comunidad.
        </Text>

        <View className="flex-col gap-y-6">
          {/** Input nombre de la comunidad  */}
          <View className="flex-row items-center gap-x-2">
            <TextInput
              value={community.name}
              maxLength={21}
              onChangeText={(text) =>
                setCommunity({ ...community, name: text })
              }
              enterKeyHint="next"
              placeholder="Nombre de la comunidad"
              placeholderTextColor={"#4A4947"}
              className="font-dosis-regular flex-1 text-[16px] text-text-3 border border-gray-200 rounded-lg px-4 py-3"
            />

            <Text
              className={`font-dosis-regular text-[12px] ${community.name.length > 21 ? "text-text-6" : "text-text-5"}`}
            >
              {21 - community.name.length}
            </Text>
          </View>

          {/** Input descripción de la comunidad */}
          <View className="flex-row items-center gap-x-2">
            <TextInput
              value={community.description}
              maxLength={500}
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) =>
                setCommunity({ ...community, description: text })
              }
              enterKeyHint="next"
              placeholder="Descripción"
              placeholderTextColor={"#4A4947"}
              className="font-dosis-regular flex-1 text-[16px] text-text-3 border border-gray-200 rounded-lg px-4 py-3"
            />
            <Text
              className={`font-dosis-regular text-[12px] ${community.description.length > 500 ? "text-text-6" : "text-text-5"}`}
            >
              {500 - community.description.length}
            </Text>
          </View>
        </View>
      </View>
    ),

    3: (
      <View className="flex-col flex-1 px-5 py-4 gap-y-6">
        <Text className="font-dosis-bold text-[22px] text-text-3">
          Personaliza tu comunidad
        </Text>
        <Text className="font-dosis-regular text-[16px] text-text-5 leading-7">
          Agrega una imagen y un banner para tu comunidad así los usuarios
          podrán identificarte mejor
        </Text>

        <View className="flex-col gap-y-4">
          <View className="p-2 border border-gray-200 rounded-lg">
            {community.banner_url?.uri ? (
              <Image
                source={{ uri: community.banner_url.uri || "" }}
                className="w-full h-32 rounded-lg"
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
                <Text className="font-dosis-regular text-[14px] text-text-3">
                  Agregar banner
                </Text>
              </TouchableOpacity>

              <Entypo
                className={`${
                  community.banner_url?.uri
                    ? "opacity-100"
                    : "opacity-0"
                }`}
                name="cross"
                size={20}
                color="707070"
              />
            </View>
          </View>

          <View className="p-2 border border-gray-200 rounded-lg flex-row gap-x-4">
            {community.image_url?.uri ? (
              <Image
                source={{ uri: community.image_url.uri || "" }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <View className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center" />
            )}

            <View className="w-full flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => handlePickImage("image_url")}
                className="flex-1 py-3 px-2 gap-x-4 items-center flex-row justify-start"
              >
                <Entypo name="image" size={18} color="#2F2F2F" />
                <Text className="font-dosis-regular text-[14px] text-text-3">
                  Agregar ícono de la comunidad
                </Text>
              </TouchableOpacity>

              <Entypo
                className={`${community.image_url?.uri ? "opacity-100" : "opacity-0"}`}
                name="cross"
                size={20}
                color="707070"
              />
            </View>
          </View>
        </View>

        {/* Imange */}
        <TouchableOpacity
          onPress={() => handlePickImage("image_url")}
          className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center"
        >
          <Text className="font-dosis-regular text-[16px] text-text-3">
            Agregar imagen
          </Text>
        </TouchableOpacity>
      </View>
    ),
  };

  console.log("Community:", JSON.stringify(community, null, 2));

  return (
    <SafeAreaView
      edges={["bottom", "left", "top", "right"]}
      className="flex-1 bg-bg-semi-white "
    >
      <View className="flex-row items-center justify-between w-full px-5 py-4">
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={handleBack}
            className="h-10 w-10 flex items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="#2F2F2F" />
          </TouchableOpacity>
          <Text className="font-dosis-bold text-[16px] text-text-3">{`${step} de 3`}</Text>
        </View>

        <TouchableOpacity
          disabled={
            community.tags.length < 3 ||
            (step === 2 &&
              (community.name.length < 1 || community.description.length < 10))
          }
          className="bg-bg-gray py-2 px-4 rounded-full"
          onPress={handleNext}
        >
          <Text
            className={`font-dosis-bold text-[16px] ${community.tags.length < 3 || community.name.length < 1 || community.description.length < 10 ? "text-text-6" : "text-text-5"}`}
          >
            {step !== 3 ? "Siguiente" : "Crear comunidad"}
          </Text>
        </TouchableOpacity>
      </View>

      {variables[step]}
    </SafeAreaView>
  );
}
