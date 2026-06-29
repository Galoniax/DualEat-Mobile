import { CommunityTag } from "@/interface/global";
import { CommunityDTO } from "@/interface/global.dto";
import { getTags } from "@/services/category.api";
import { globalToast as toast } from "@/utils/toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GroupedTags {
  title: string;
  category_id: number;
  data: CommunityTag[];
}

interface StepProps {
  community: CommunityDTO;
  setCommunity: React.Dispatch<React.SetStateAction<CommunityDTO>>;
}

export default function StepOne({ community, setCommunity }: StepProps) {
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

    staleTime: 30 * 60 * 1000,
  });

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

  return (
    <View className="flex-col flex-1 px-5 py-4 gap-y-6">
      <Text className="font-outfit-bold text-[22px] text-text-3">
        ¿De qué se trata tu comunidad?
      </Text>
      <Text className="font-outfit-light text-[16px] text-text-5 leading-7">
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
              <Text className="font-outfit-bold text-[16px] text-text-3 mb-3">
                {item.title}
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {item.data.map((tag) => {
                  const isSelected = community.tags.includes(tag.id);

                  return (
                    <TouchableOpacity
                      key={tag.id}
                      onPress={() => {
                        if (community.tags.length >= 3 && !isSelected) {
                          toast.error(
                            "Error",
                            "Solo se pueden seleccionar 3 categorías",
                          );
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
                        className={`font-outfit-light text-[14px] ${
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
  );
}
