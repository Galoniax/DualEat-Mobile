import { ROUTES } from "@/constants/constants";
import { CommunityTag, TagCategory } from "@/interface/global";
import { getTagCategories, getTagsByCategoryId } from "@/services/category.api";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CategoryScreen() {
  const router = useRouter();
  const { category_id } = useLocalSearchParams();

  const { data } = useQuery({
    queryKey: ["tags-by-category", category_id],
    queryFn: async () => {
      const response = await getTagsByCategoryId(Number(category_id));
      return response.data as CommunityTag[];
    },

    staleTime: 1000 * 60 * 30,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  console.log(JSON.stringify(data, null, 2));

  const category = data?.[0].category;

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-bg-semi-white"
    >
      <View className="flex-row">
        <TouchableOpacity>
          <Text>Back</Text>
        </TouchableOpacity>
        <Text>{category?.name}</Text>
      </View>

      <View className="flex-col gap-y-4 px-6 mt-4"></View>
    </SafeAreaView>
  );
}
