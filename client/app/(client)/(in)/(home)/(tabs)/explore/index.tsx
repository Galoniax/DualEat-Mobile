import { ROUTES } from "@/constants/constants";
import { TagCategory } from "@/interface/global";
import { getTagCategories } from "@/services/category.api";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const headerHeight = useHeaderHeight();
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await getTagCategories();
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
        <Text className="text-text-3 font-dosis-bold text-[16px]">
          Explora comunidades por tema
        </Text>
        <FlatList
          data={data}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ gap: 12, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: ROUTES.USER.EXPLORE_CATEGORY,
                  params: {
                    category_id: item.id,
                    category_slug: item.slug,
                  },
                });
              }}
              className="flex-1 flex-shrink items-center justify-center py-2 rounded-full border border-gray-300"
            >
              <Text className="text-text-5 font-dosis-regular text-[13px]">
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
