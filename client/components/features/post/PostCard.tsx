import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import type { Post, PostComment } from "@/interface/global";

import { useAuth } from "@/context/auth/AuthContext";
import { useRouter } from "expo-router";

import { AntDesign } from "@expo/vector-icons";
import PostImagesCarousel from "./PostImagesCarousel";

import { ROUTES } from "@/constants/constants";
import PostActions from "./PostActions";
import RecipeCard from "../recipe/RecipeCard";
import { getShortTimeAgo } from "@/utils/date";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import CommentItem from "./CommentItem";
import { useComment } from "@/hooks/api/post/usePost";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

interface PostCardProps {
  post: Post;
  type: "POST" | "HOME" | "COMMUNITY";
}

const systemFonts = [...defaultSystemFonts, "Dosis-Regular", "Dosis-Bold"];

const PostCard: React.FC<PostCardProps> = ({
  post,
  type = "HOME",
}: PostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const bottomSheetRef = useRef<BottomSheetModal | null>(null);
  const snapPoints = useMemo(() => ["95%"], []);

  const [shouldFetch, setShouldFetch] = useState(false);

  // Hook: Obtener Comentarios
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError: isErrorComments,
    isLoading,
  } = useComment(post.id as string, shouldFetch);

  const handleOpenModal = () => {
    setShouldFetch(true);
    bottomSheetRef.current?.present();
  };

  const comments = useMemo(() => {
    return (
      commentsData?.pages
        .flatMap((page) => page?.data || [])
        .filter((comment): comment is PostComment => Boolean(comment)) || []
    );
  }, [commentsData]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // NAVIGATORS
  const handleNavigateCommunity = () => {
    router.push({
      pathname: ROUTES.USER.COMMUNITY,
      params: {
        community_slug: post.community?.slug || "",
      },
    });
  };

  const handleNavigate = (isPost: boolean) => {
    if (isPost) {
      router.push({
        pathname: ROUTES.USER.POST,
        params: {
          community_slug: post.community?.slug || "",
          post_id: post.id || "",
          post_slug: post.slug || "",
        },
      });
    } else {
      router.push({
        pathname: ROUTES.USER.RECIPE,
        params: {
          community_slug: post.community?.slug || "",
          recipe_id: post.recipe?.id || "",
          recipe_slug: post.recipe?.slug || "",
        },
      });
    }
  };

  const TextHTML = {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: "Dosis-Regular",
    color: "#4A4947",
  };

  const styles = {
    strong: {
      fontFamily: "Dosis-Bold",
    },
    u: {
      textDecorationLine: "underline" as const,
    },
    ul: {
      marginLeft: 12,
      marginBottom: 12,
    },
    li: {
      marginLeft: 12,
    },
    p: {
      fontFamily: "Dosis-Regular",
      marginBottom: 12,
    },
  };

  const variables = {
    HOME: (
      <View className="flex-row items-center gap-x-2.5">
        <Image
          source={{
            uri:
              post.community?.image_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
          }}
          className="w-7 h-7 rounded-full"
          resizeMode="cover"
        />

        <TouchableOpacity
          onPress={handleNavigateCommunity}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-[13px] font-dosis-bold text-text-5 tracking-tight">
            c/{post.community?.name}
          </Text>
        </TouchableOpacity>

        <Text className="text-[12px] font-dosis-regular text-text-6">
          • {getShortTimeAgo(post.created_at)}
        </Text>
      </View>
    ),
    COMMUNITY: (
      <View className="flex-row items-center gap-x-2.5">
        <Image
          source={{
            uri:
              post.user?.avatar_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
          }}
          className="w-7 h-7 rounded-full"
          resizeMode="cover"
        />

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-[13px] font-dosis-bold text-text-5 tracking-tight">
            {post.user?.name}
          </Text>
        </TouchableOpacity>

        <Text className="text-[12px] font-dosis-regular text-text-6">
          • {getShortTimeAgo(post.created_at)}
        </Text>
      </View>
    ),
    POST: (
      <View className="flex-row items-center gap-2.5">
        <Image
          source={{
            uri:
              post.user?.avatar_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
          }}
          className="w-8 h-8 rounded-full"
          resizeMode="cover"
        />
        <View className="flex-col gap-0.5">
          <TouchableOpacity
            onPress={handleNavigateCommunity}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-[12.5px] font-dosis-bold text-text-3">
              c/{post.community?.name}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-[12px] font-dosis-regular text-text-5">
              {post.user?.name}
            </Text>
            <Text className="text-[12px] font-dosis-regular text-text-4">
              • {getShortTimeAgo(post?.created_at)}
            </Text>
          </View>
        </View>
      </View>
    ),
  };

  return (
    <>
      <TouchableOpacity
        className={`flex-col w-full border-b border-gray-100 pb-4 mb-4`}
        activeOpacity={0.8}
        disabled={type === "POST"}
        onPress={() => handleNavigate(true)}
      >
        <View className="flex-1">
          <View>
            <View className="flex-row items-center justify-between w-full">
              {variables[type]}

              {/* Contenedor Derecho: Botón de opciones */}
              {post.user?.id === user?.id && (
                <TouchableOpacity className="rounded-full">
                  <AntDesign
                    style={{ transform: [{ rotate: "90deg" }] }}
                    name="ellipsis"
                    size={18}
                    color="black"
                  />
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-[16px] font-dosis-bold text-text-3 mt-1">
              {post.title}
            </Text>
          </View>

          <View className="flex-col gap-y-4">
            {post?.image_urls?.length > 0 && <PostImagesCarousel post={post} />}

            {post.content && !post?.image_urls?.length && type !== "POST" ? (
              <RenderHTML
                contentWidth={width}
                source={{ html: post.content }}
                systemFonts={systemFonts}
                baseStyle={TextHTML}
                tagsStyles={styles}
                defaultTextProps={{ numberOfLines: 3 }}
              />
            ) : (
              post.content &&
              type === "POST" && (
                <RenderHTML
                  contentWidth={width}
                  source={{ html: post.content }}
                  systemFonts={systemFonts}
                  baseStyle={TextHTML}
                  tagsStyles={styles}
                />
              )
            )}

            {/* Tarjeta de Receta */}
            {post.recipe && <RecipeCard recipe={{ ...post.recipe }} />}
          </View>

          <View className="mt-4">
            <PostActions
              content={post as Post}
              type="POST"
              onOpenComments={() => handleOpenModal()}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/** MODAL DE COMENTARIOS */}
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: "#fefefe", borderRadius: 24 }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.4}
            pressBehavior="close"
          />
        )}
        handleStyle={{
          marginTop: 8,
          paddingBottom: 10,
        }}
        handleIndicatorStyle={{
          backgroundColor: "#707070",
          width: 35,
          height: 1.5,
        }}
      >
        <BottomSheetFlatList
          data={comments}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: PostComment) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }: { item: PostComment }) => (
            <CommentItem item={item} />
          )}
          onEndReached={() => {
            handleLoadMore();
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <Text className="font-dosis-medium text-[16px] text-text-5 text-center mb-6">
              Comentarios
            </Text>
          }
          ListEmptyComponent={
            <Text className="text-center font-dosis-regular text-text-4 mt-10">
              Sé el primero en comentar.
            </Text>
          }
        />
        <View className="px-4 py-3 border-t border-gray-200 bg-white">
          <BottomSheetTextInput
            placeholder="Añade un comentario..."
            placeholderTextColor="#999"
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              fontFamily: "Dosis-Regular",
              fontSize: 16,
            }}
          />
        </View>
      </BottomSheetModal>
    </>
  );
};

export default PostCard;
