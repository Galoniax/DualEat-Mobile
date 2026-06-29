import { TagCategory } from "@/interface/global";
import { getTagCategories } from "@/services/category.api";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const headerHeight = useHeaderHeight();

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getTagCategories();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener categorías");
      }
      return response.data as TagCategory[];
    },

    staleTime: 1000 * 60 * 30,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{ paddingTop: headerHeight }}
      className="flex-1 bg-bg-semi-white"
    >
      <View className="flex-col gap-y-4 px-6 mt-4">
        <Text className="text-text-3 font-outfit-bold text-[16px]">
          Explora comunidades por tema
        </Text>
        <FlatList
          data={data}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity className="flex-1 flex-shrink items-center justify-center py-2 rounded-full border border-gray-300">
              <Text className="text-text-5 font-outfit-light text-[13px]">
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </SafeAreaView>
  );
}
