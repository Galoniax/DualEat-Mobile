import { PostComment } from "@/interface/global";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PostActions from "./PostActions";
import { getShortTimeAgo } from "@/utils/date";
import { useMemo, useState } from "react";
import { useReplies } from "@/hooks/api/post/usePost";

type Comment = Pick<
  PostComment,
  | "post_id"
  | "parent_comment_id"
  | "reply_to_user_id"
  | "reply_to_user"
  | "content"
>;
interface CommentItemProps {
  item: PostComment;
  setComment: React.Dispatch<React.SetStateAction<Comment>>;
}

export default function CommentItem({ item, setComment }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFather = item.parent_comment_id === null;

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
    <View
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
            <Text className="font-dosis-semibold text-text-3 text-[14px]">
              {item.user?.name}
            </Text>
            <Text className="text-[12px] font-dosis-regular text-text-4">
              {getShortTimeAgo(item.created_at)}
            </Text>
          </View>

          <Text className="text-[15px] text-text-3 font-dosis-regular leading-5">
            {item.reply_to_user_id ? (
              <Text>
                <Text className="text-[15px] text-primary-5 font-dosis-bold leading-5">
                  {item.reply_to_user?.name}{" "}
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
                  post_id: item.post_id,
                  parent_comment_id: item.parent_comment_id || item.id,
                  reply_to_user_id: item.user_id,
                  reply_to_user: item.user,
                  content: "",
                });
              }}
            >
              <Text className="text-[13px] font-dosis-semibold text-text-5">
                Responder
              </Text>
            </TouchableOpacity>
            <PostActions content={item} type="COMMENT" />
          </View>
        </View>
      </View>

      {isExpanded && replies.length > 0 && (
        <View>
          {replies.map((reply) => (
            <CommentItem key={reply.id} item={reply} setComment={setComment} />
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
          <Text className="text-[13px] font-dosis-medium text-text-5">
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
    </View>
  );
}
