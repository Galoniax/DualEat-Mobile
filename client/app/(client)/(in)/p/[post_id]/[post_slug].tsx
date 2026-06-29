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
  useUpdateComment,
} from "@/hooks/api/post/usePost";

import PostCard from "@/components/features/post/PostCard";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Post, PostComment } from "@/interface/global";
import CommentItem from "@/components/features/post/CommentItem";
import { useAuth } from "@/context/auth/AuthContext";
import { PostCommentDTO } from "@/interface/global.dto";
import { globalToast as toast } from "@/utils/toast";

const PostHeader = React.memo(({ post }: { post: Post }) => (
  <View style={{ flex: 1, flexGrow: 1, marginBottom: 24 }}>
    <PostCard post={post} type="POST" />
  </View>
));

PostHeader.displayName = "PostHeader";

const MemoizedCommentItem = React.memo(CommentItem);

type Comment = Partial<PostComment>;

export default function PostDetailScreen() {
  const { post_id } = useLocalSearchParams();
  const router = useRouter();

  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const inputRef = useRef<TextInput>(null);

  const { mutate: createComment, isPending: isPendingCreateComment } =
    useCreateComment(user!);

  const { mutate: updateComment, isPending: isPendingUpdateComment } =
    useUpdateComment();

  const {
    data: post,
    isError,
    isLoading,
    refetch,
  } = usePostById(post_id as string);

  const [comment, setComment] = useState<Comment>({
    id: undefined,
    post_id: post?.id,
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

  const isOwner = useMemo(() => {
    if (!user || !post) return false;
    return user.id === post.user_id;
  }, [user, post]);

  const renderComment = useCallback(
    ({ item }: { item: PostComment }) => {
      return (
        <MemoizedCommentItem
          isOwner={isOwner}
          item={item}
          setComment={setComment}
          user={user!}
          inputRef={inputRef}
        />
      );
    },
    [setComment, isOwner, user],
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleAddComment = async () => {
    if (comment.content?.trim() === "") {
      toast.error("Error", "El comentario no puede estar vacío");
      return;
    }

    if (!user) {
      toast.error("No autorizado", "Debes iniciar sesión para comentar");
      return;
    }

    if (comment.id !== undefined) {
      updateComment(
        {
          comment_id: comment.id,
          content: comment.content as string,
        },
        {
          onSuccess: () => {
            setComment({
              id: undefined,
              post_id: post?.id,
              parent_comment_id: null,
              reply_to_user_id: null,
              reply_to_user: null,
              content: "",
            });
          },
          onError: (err) => {
            console.error("Error al actualizar el comentario", err);
          },
          onSettled: () => {
            Keyboard.dismiss();
          },
        },
      );
    } else {
      const dto: PostCommentDTO = {
        post_id: post?.id as string,
        parent_comment_id: comment.parent_comment_id || null,
        reply_to_user_id: comment.reply_to_user_id || null,
        content: comment.content as string,
      };

      createComment(
        {
          variables: dto,
          reply_to_user: comment.reply_to_user || null,
        },
        {
          onSuccess: (data) => {
            toast.success(
              data.message ?? "Comentario agregado",
              "El comentario fue agregado correctamente",
            );
            setComment({
              id: undefined,
              post_id: post?.id,
              parent_comment_id: null,
              reply_to_user_id: null,
              reply_to_user: null,
              content: "",
            });
          },
          onError: (err: any) => {
            toast.error(
              err.message ?? "Error al crear el comentario",
              "El comentario no pudo ser creado",
            );
          },
          onSettled: () => {
            Keyboard.dismiss();
          },
        },
      );
    }
  };

  useEffect(() => {
    if (post) {
      router.setParams({
        post_id: post.id,
        post_slug: post.slug,
      });
    }
  }, [post, router]);

  if (isError) {
    return (
      <ErrorView
        type={404}
        title="Post no encontrado"
        message="El post que estás buscando no existe o ha sido eliminado."
        onAction={() => router.back()}
        actionLabel="Volver"
      />
    );
  }

  const isPending = isPendingCreateComment || isPendingUpdateComment;

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
        <Text className="font-outfit-bold text-base text-text-3">Post</Text>
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
                <Text className="text-text-4 font-outfit-light text-[14px]">
                  Sé el primero en comentar
                </Text>
              </View>
            )
          }
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 80, gap: 12 }}
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
            <Text className="text-sm font-outfit-regular text-text-5">
              Respondiendo a{" "}
              <Text className="text-sm font-dosis-semibold text-text-3">
                {comment.reply_to_user?.name}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setComment({
                  id: undefined,
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
              <Entypo name="cross" size={18} color="#4A4947" />
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
            ref={inputRef}
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
            className="font-outfit-light text-sm bg-gray-100 text-text-3 rounded-full px-4"
            style={{
              paddingVertical: Platform.OS === "ios" ? 8 : 8,
              flex: 1,
            }}
          />

          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!comment?.content?.trim() || isPending}
            className={`rounded-full h-10 w-10 flex items-center justify-center ${!comment?.content?.trim() || isPending ? "bg-gray-300" : "bg-bg-semi-black"}`}
          >
            <Feather name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
