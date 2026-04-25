import { PostComment } from "@/interface/global";
import { Image, Text, TouchableOpacity, View } from "react-native";
import PostActions from "./PostActions";
import { getShortTimeAgo } from "@/utils/date";
import { useMemo, useState } from "react";
import { useReplies } from "@/hooks/api/post/usePost";

export default function CommentItem({ item }: { item: PostComment }) {
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

  console.log(JSON.stringify(replies, null, 2));

  const duplicatedReplies = useMemo(() => {
    return [
      ...replies,
      ...replies,
      ...replies,
      ...replies,
      ...(isFetchingNextPage ? Array(5).fill(null) : []),
    ];
  }, [replies, isFetchingNextPage]);

  return (
    <View
      style={{ paddingLeft: isFather ? 0 : 30, marginTop: isFather ? 0 : 16 }}
      className="w-full"
      collapsable={false}
    >
      <View className="flex-row gap-x-3">
        <Image
          source={{
            uri:
              item.user?.avatar_url ||
              "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
          }}
          className={`rounded-full z-10 mt-1 ${isFather ? "w-9 h-9" : "w-7 h-7"}`}
          resizeMode="cover"
        />

        <View className="flex-col gap-y-1.5 flex-1">
          <View className="flex-row items-center gap-x-2">
            <Text className="font-dosis-bold text-text-3 text-[16px]">
              {item.user?.name}
            </Text>
            <Text
              numberOfLines={1}
              className="font-dosis-regular text-text-4 text-[16px] truncate"
            >
              @{item.user?.slug}
            </Text>
            <Text className="text-[12px] font-dosis-regular text-text-4">
              {getShortTimeAgo(item.created_at)}
            </Text>
          </View>

          {item.parent_comment && (
            <TouchableOpacity>
              <Text className="text-[15px] text-text-5 font-dosis-regular leading-5">
                En respuesta a{" "}
                <Text className="text-[15px] text-bg-blue font-dosis-regular leading-5">
                  @{item.parent_comment.user?.slug}
                </Text>
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-[15px] text-text-3 font-dosis-regular leading-5">
            {item.content}
          </Text>

          <TouchableOpacity>
            <Text className="text-[13px] font-dosis-semibold text-text-5">
              Responder
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex justify-center">
          <PostActions content={item} type="COMMENT" />
        </View>
      </View>

      {replies.length > 0 && (
        <View style={{ display: isExpanded ? "flex" : "none" }}>
          {replies.map((reply) => (
            <CommentItem key={reply.id} item={reply} />
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
          style={{ paddingLeft: 30, marginTop: 10 }}
          className="flex-row gap-x-2 items-center"
        >
          <View className="w-4 h-[1px] bg-[#4A4947]" />
          <Text className="text-[13px] font-dosis-semibold text-text-5">
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
