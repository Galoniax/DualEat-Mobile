import { PostComment, User } from "@/interface/global";
import {
  Image,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PostActions from "./PostActions";
import { getShortTimeAgo } from "@/utils/date";
import { useMemo, useState, memo, useRef } from "react";
import { useDeleteComment, useReplies } from "@/hooks/api/post/usePost";

import { Entypo } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PencilLine, Trash } from "lucide-react-native";
import { globalToast as toast } from "@/utils/toast";

type Comment = Partial<PostComment>;

interface CommentItemProps {
  item: PostComment;
  setComment: React.Dispatch<React.SetStateAction<Comment>>;
  isOwner: boolean;
  user: User;
  inputRef: React.RefObject<TextInput | null>;
}

export default function CommentItem({
  item,
  setComment,
  isOwner,
  user,
  inputRef,
}: CommentItemProps) {
  const insets = useSafeAreaInsets();

  const [isExpanded, setIsExpanded] = useState(false);
  const isFather = item.parent_comment_id === null;

  const ref = useRef<BottomSheetModal>(null);

  const { mutate: deleteComment } = useDeleteComment();

  const handleDelete = () => {
    try {
      deleteComment(
        { comment_id: item.id },
        {
          onSuccess: (data) => {
            toast.success(
              data?.message || "Comentario eliminado",
              "El comentario fue eliminado correctamente",
            );
            ref.current?.dismiss();
          },
          onError: (err: any) => {
            toast.error(
              err?.message || "Error al eliminar el comentario",
              "El comentario no se pudo eliminar, intentalo de nuevo",
            );
          },
        },
      );
    } catch (e: any) {
      console.log(e);
    }
  };

  const {
    data: repliesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useReplies(item.id, isExpanded);

  const fetchedRepliesCount = useMemo(() => {
    if (!repliesData) return 0;
    return repliesData.pages.reduce(
      (total, page) => total + (page.data?.length || 0),
      0,
    );
  }, [repliesData]);

  const remainingReplies = item._count?.replies
    ? item._count.replies - fetchedRepliesCount
    : 0;

  const replies = useMemo(() => {
    return (
      repliesData?.pages
        .flatMap((page) => page?.data || [])
        .filter((comment): comment is PostComment => Boolean(comment)) || []
    );
  }, [repliesData]);

  return (
    <KeyboardAvoidingView
      style={{ paddingLeft: isFather ? 0 : 30, marginTop: isFather ? 0 : 16 }}
      className="w-full"
    >
      <View className="flex-row gap-x-4">
        <Image
          source={{
            uri:
              item.user?.avatar_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
          }}
          className={`rounded-full z-10 mt-1 ${isFather ? "w-9 h-9" : "w-8 h-8"}`}
          resizeMode="cover"
        />

        <View className="flex-col gap-y-1.5 flex-1">
          <View className="flex-row items-center gap-x-2">
            <Text className="font-outfit-medium text-text-3 text-sm">
              {item.user?.name}
            </Text>
            <Text className="text-sm font-outfit-light text-text-4">
              {getShortTimeAgo(item.created_at)}
            </Text>
          </View>

          <Text className="text-sm text-text-3 font-outfit-light leading-5">
            {item.reply_to_user_id ? (
              <Text>
                <Text className="text-sm text-bg-blue font-outfit-medium leading-5">
                  @{item.reply_to_user?.name}
                  {"  "}
                </Text>
                {item.content}
              </Text>
            ) : (
              item.content
            )}
          </Text>

          <View className="flex-row gap-x-4">
            <TouchableOpacity
              onPress={() => {
                setComment({
                  id: undefined,
                  post_id: item.post_id,
                  parent_comment_id: item.parent_comment_id || item.id,
                  reply_to_user_id: item.user_id,
                  reply_to_user: item.user,
                  content: "",
                });
              }}
            >
              <Text className="text-sm font-outfit-medium text-text-5">
                Responder
              </Text>
            </TouchableOpacity>
            <PostActions content={item} type="COMMENT" />
          </View>
        </View>

        {(isOwner || user.id === item.user_id) && (
          <TouchableOpacity
            onPress={() => ref.current?.present()}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Entypo name="dots-three-vertical" size={12} color="#2F2F2F" />
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && replies.length > 0 && (
        <View>
          {replies.map((reply) => (
            <MemoizedCommentItem
              key={reply.id}
              item={reply}
              setComment={setComment}
              isOwner={isOwner}
              user={user}
              inputRef={inputRef}
            />
          ))}
        </View>
      )}

      {item._count?.replies && item._count.replies > 0 ? (
        <TouchableOpacity
          onPress={() => {
            if (!isExpanded) {
              setIsExpanded(true);
            } else if (hasNextPage) {
              fetchNextPage();
            } else {
              setIsExpanded(false);
            }
          }}
          disabled={isFetchingNextPage}
          style={{ paddingLeft: 40, marginTop: 10 }}
          className="flex-row gap-x-2 items-center"
        >
          <Text className="text-sm font-outfit-regular text-text-5">
            {isFetchingNextPage
              ? "Cargando..."
              : isExpanded
                ? !hasNextPage
                  ? "Ocultar respuestas"
                  : `Ver más respuestas (${remainingReplies})`
                : `Ver respuestas (${item._count.replies})`}
          </Text>
        </TouchableOpacity>
      ) : null}

      <BottomSheetModal
        ref={ref}
        enableDynamicSizing={true}
        enablePanDownToClose={true}
        enableOverDrag={false}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.6}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView
          className="flex-col gap-y-3"
          style={{
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: insets.left + insets.right + 16,
          }}
        >
          <TouchableOpacity
            onPress={() => handleDelete()}
            className="flex-row items-center gap-x-4 py-1"
          >
            <Trash size={18} color="#2F2F2F" />
            <Text className="font-outfit-light text-text-5 text-lg">
              Eliminar
            </Text>
          </TouchableOpacity>

          {user.subscription_status === "ACTIVE" && (
            <TouchableOpacity
              onPress={() => {
                setComment({
                  id: item.id,
                  post_id: item.post_id,
                  parent_comment_id: item.parent_comment_id,
                  reply_to_user_id: null,
                  reply_to_user: null,
                  content: item.content,
                });

                ref.current?.dismiss();
                setTimeout(() => {
                  inputRef.current?.focus();
                }, 200);
              }}
              className="flex-row items-center gap-x-4 py-1"
            >
              <PencilLine size={18} color="#2F2F2F" />
              <Text className="font-outfit-light text-text-5 text-lg">
                Actualizar
              </Text>
            </TouchableOpacity>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </KeyboardAvoidingView>
  );
}

const MemoizedCommentItem = memo(CommentItem);
