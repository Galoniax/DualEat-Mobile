import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo } from "@expo/vector-icons";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

import { usePostById } from "@/hooks/api/post/usePost";

import PostCard from "@/components/features/post/PostCard";

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams();
  const router = useRouter();

  // Hook: Obtener Post
  const {
    data: post,
    isFetching,
    isError,
    isLoading,
    refetch,
  } = usePostById(post_id as string);

  if (isError) {
    return (
      <ErrorView
        title="Post no encontrado"
        message="El post que estás buscando no existe o ha sido eliminado."
        onAction={() => router.back()}
        actionLabel="Volver"
      />
    );
  }

  return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-bg-semi-white"
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between w-full px-5 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 flex items-center justify-center"
          >
            <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
          </TouchableOpacity>
          <Text className="font-dosis-bold text-[16px] text-text-3">Post</Text>
          <Entypo name="share" size={18} color="#2F2F2F" />
        </View>

        {isLoading ? (
          <View className="flex-1 mt-10 items-center justify-center">
            <ActivityIndicator size={32} color="#3578e4" />
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && !isLoading}
                onRefresh={refetch}
                colors={["#e5a657"]}
              />
            }
          >
            {post && <PostCard post={post} type="POST" />}
          </ScrollView>
        )}
      </SafeAreaView>
  );
}
