import {
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Keyboard,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Entypo, Feather } from "@expo/vector-icons";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

import {
  useComment,
  useCreateComment,
  usePostById,
} from "@/hooks/api/post/usePost";

import PostCard from "@/components/features/post/PostCard";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Post, PostComment } from "@/interface/global";
import CommentItem from "@/components/features/post/CommentItem";
import { useAuth } from "@/context/auth/AuthContext";

const PostHeader = React.memo(({ post }: { post: Post }) => (
  <View style={{ flex: 1, flexGrow: 1, marginBottom: 24 }}>
    <PostCard post={post} type="POST" />
  </View>
));

PostHeader.displayName = "PostHeader";

type Comment = Pick<
  PostComment,
  | "post_id"
  | "parent_comment_id"
  | "reply_to_user_id"
  | "reply_to_user"
  | "content"
>;

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams();
  const router = useRouter();

  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const { mutateAsync: createComment } = useCreateComment(user!);

  const {
    data: post,
    isError,
    isLoading,
    refetch,
  } = usePostById(post_id as string);

  const [comment, setComment] = useState<Comment>({
    post_id: post?.id as string,
    parent_comment_id: null,
    reply_to_user_id: null,
    reply_to_user: null,
    content: "",
  });

  const {
    data: commentsData,
    refetch: refetchComments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useComment(post_id as string);

  const handleRefresh = useCallback(() => {
    refetchComments();
    refetch();
  }, [refetchComments, refetch]);

  const comments = useMemo(() => {
    return (
      commentsData?.pages
        .flatMap((page) => page?.data || [])
        .filter((comment): comment is PostComment => Boolean(comment)) || []
    );
  }, [commentsData]);

  const renderComment = useCallback(
    ({ item }: { item: any }) => {
      return <CommentItem item={item} setComment={setComment} />;
    },
    [setComment],
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAddComment = async () => {
    if (!comment?.content?.trim()) return;

    try {
      const result = await createComment({
        post_id: post?.id as string,
        content: comment.content as string,
      });

      console.log(JSON.stringify(result, null, 2));

      setComment({
        post_id: post?.id as string,
        parent_comment_id: null,
        reply_to_user_id: null,
        content: "",
        reply_to_user: null,
      });
      Keyboard.dismiss();
    } catch (err) {
      console.error("Error al crear el comentario", err);
    }
  };

  useEffect(() => {
    if (post) {
      router.setParams({
        community_slug: post.community.slug,
        post_id: post.id,
        post_slug: post.slug,
      });
    }
  }, [post, router]);

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
      style={{
        paddingBottom: insets.bottom + 12,
      }}
    >
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: insets.left + insets.right + 10,
          paddingVertical: insets.top / 2,
        }}
        className="flex-row items-center justify-between gap-x-4 w-full"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-dosis-bold text-[16px] text-text-3">Post</Text>
        <Entypo name="share" size={18} color="#2F2F2F" />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#e5a657" />
        </View>
      ) : (
        <FlatList
          data={comments}
          style={{ paddingHorizontal: insets.left + insets.right + 16 }}
          ListHeaderComponent={post ? <PostHeader post={post} /> : null}
          renderItem={renderComment}
          keyExtractor={(item: PostComment) => item.id}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            handleLoadMore();
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="flex items-center justify-center py-4">
                <ActivityIndicator size="small" color="#3578e4" />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading && (
              <View className="flex items-center justify-center">
                <Text className="text-text-4 font-dosis-regular text-[14px]">
                  Sé el primero en comentar
                </Text>
              </View>
            )
          }
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 80 }}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={handleRefresh}
              colors={["#e5a657"]}
            />
          }
        />
      )}

      {/* INPUT DE COMENTARIOS */}
      <KeyboardAvoidingView
        behavior={"padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom + 20 : 8}
        className="px-4 border-t border-gray-300 bg-bg-semi-white flex-col gap-y-4"
        style={{
          paddingTop: 12,
        }}
      >
        {comment.reply_to_user && (
          <View className="flex-row items-center justify-between">
            <Text className="text-[14px] font-dosis-medium text-text-5">
              Respondiendo a{" "}
              <Text className="text-[14px] font-dosis-semibold text-text-3">
                {comment.reply_to_user?.name}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setComment({
                  post_id: post?.id as string,
                  parent_comment_id: null,
                  reply_to_user_id: null,
                  reply_to_user: null,
                  content: "",
                });
              }}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Entypo name="cross" size={20} color="#4A4947" />
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center gap-x-2">
          <Image
            source={{
              uri:
                user?.avatar_url ||
                "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
            }}
            className="rounded-full w-8 h-8"
            resizeMode="cover"
          />

          <TextInput
            placeholder={
              comment.reply_to_user
                ? `@${comment.reply_to_user?.name}`
                : "Añade un comentario..."
            }
            placeholderTextColor="#4A4947"
            value={comment?.content}
            onChangeText={(text) => {
              setComment({ ...comment, content: text });
            }}
            style={{
              backgroundColor: "#e5e7eb",
              color: "#4A4947",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: Platform.OS === "ios" ? 8 : 8,
              fontFamily: "Dosis-Regular",
              fontSize: 14,
              flex: 1,
            }}
          />

          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!comment?.content?.trim()}
            className={`rounded-full h-10 w-10 flex items-center justify-center ${!comment?.content?.trim() ? "bg-gray-300" : "bg-bg-semi-black"}`}
          >
            <Feather name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
