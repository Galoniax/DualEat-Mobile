import { View, Text, TouchableOpacity } from "react-native";
import type { ContentType, Post, PostComment } from "@/interface/global";
import { Octicons } from "@expo/vector-icons";
import { Path, Svg } from "react-native-svg";
import { useVote } from "@/hooks/api/vote/useVote";

type Content = Post | PostComment;

type PostActionsProps = {
  content: Content;
  type: ContentType;
};

export default function PostActions({ content, type }: PostActionsProps) {
  const { mutate: vote } = useVote();

  const isVoteUP = content?.user_vote === "UP";
  const isVoteDown = content?.user_vote === "DOWN";

  const totalLikes = (content?.votes_up ?? 0) - (content?.votes_down ?? 0);

  const handleVoteUp = () => {
    vote({ type: "UP", content_id: content.id, content_type: type });
  };

  const handleVoteDown = () => {
    vote({ type: "DOWN", content_id: content.id, content_type: type });
  };

  const size = type === "POST" ? 20 : 18;

  const styles = {
    BUTTON:
      type === "POST" &&
      (isVoteUP
        ? "bg-bg-yellow"
        : isVoteDown
          ? "bg-bg-red"
          : "border border-gray-300"),
    TEXT_COLOR:
      type === "POST"
        ? isVoteUP || isVoteDown
          ? "text-white"
          : "text-text-4"
        : "text-text-4",

    UP: type === "POST" ? (isVoteDown ? "#fff" : "#707070") : "#707070",
    DOWN: type === "POST" ? (isVoteUP ? "#fff" : "#707070") : "#707070",

    HEIGHT_BUTTON: type === "POST" ? 30 : 0,
  };

  return (
    <View className="flex-row items-center justify-between w-full">
      <View className="flex-row justify-start items-center gap-x-4">
        <View
          style={{
            borderRadius: 999,
            flexShrink: 1,
            minHeight: styles.HEIGHT_BUTTON,
          }}
          className={`flex-row items-center ${type === "POST" ? "gap-x-3" : "gap-x-2"} px-2 ${styles.BUTTON}`}
        >
          {/* Botón UP */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleVoteUp()}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            className="rounded-full"
          >
            {isVoteUP ? (
              <Svg height={size} width={size} viewBox="0 0 640 640">
                <Path
                  fill={type === "POST" ? "#fff" : "#e5a657"}
                  d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7L435.3 292.7C439.9 297.3 441.2 304.2 438.8 310.1C436.4 316 430.5 320 424 320L368 320L368 416C368 433.7 353.7 448 336 448L304 448C286.3 448 272 433.7 272 416L272 320L216 320C209.5 320 203.7 316.1 201.2 310.1C198.7 304.1 200.1 297.2 204.7 292.7L308.7 188.7C314.9 182.5 325.1 182.5 331.3 188.7z"
                />
              </Svg>
            ) : (
              <Svg height={size} width={size} viewBox="0 0 640 640">
                <Path
                  fill={styles.UP}
                  d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7C325.1 182.5 314.9 182.5 308.7 188.7L204.7 292.7C200.1 297.3 198.8 304.2 201.2 310.1C203.6 316 209.5 320 216 320L288 320L288 424C288 437.3 298.7 448 312 448L328 448C341.3 448 352 437.3 352 424L352 320L424 320C430.5 320 436.3 316.1 438.8 310.1C441.3 304.1 439.9 297.2 435.3 292.7L331.3 188.7z"
                />
              </Svg>
            )}
          </TouchableOpacity>

          <Text className={`text-xs font-outfit-bold ${styles.TEXT_COLOR}`}>
            {totalLikes}
          </Text>

          {/* Botón DOWN */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleVoteDown()}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
            className="rounded-full"
          >
            {isVoteDown ? (
              <Svg height={size} width={size} viewBox="0 0 640 640">
                <Path
                  fill={type === "POST" ? "#fff" : "#B53325"}
                  d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3L204.7 347.3C200.1 342.7 198.8 335.8 201.2 329.9C203.6 324 209.5 320 216 320L272 320L272 224C272 206.3 286.3 192 304 192L336 192C353.7 192 368 206.3 368 224L368 320L424 320C430.5 320 436.3 323.9 438.8 329.9C441.3 335.9 439.9 342.8 435.3 347.3L331.3 451.3C325.1 457.5 314.9 457.5 308.7 451.3z"
                />
              </Svg>
            ) : (
              <Svg height={size} width={size} viewBox="0 0 640 640">
                <Path
                  fill={styles.DOWN}
                  d="M320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528zM320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64zM308.7 451.3C314.9 457.5 325.1 457.5 331.3 451.3L435.3 347.3C439.9 342.7 441.2 335.8 438.8 329.9C436.4 324 430.5 320 424 320L352 320L352 216C352 202.7 341.3 192 328 192L312 192C298.7 192 288 202.7 288 216L288 320L216 320C209.5 320 203.7 323.9 201.2 329.9C198.7 335.9 200.1 342.8 204.7 347.3L308.7 451.3z"
                />
              </Svg>
            )}
          </TouchableOpacity>
        </View>

        {type === "POST" && (
          <View
            style={{
              borderRadius: 999,
              flexShrink: 1,
              minHeight: styles.HEIGHT_BUTTON,
            }}
            className="flex-row items-center gap-x-2 py-1 px-4 border border-gray-300"
          >
            <Octicons name="comment" size={16} color="#707070" />
            <Text className="text-sm font-outfit-bold text-text-4">
              {content?.total_comments ?? 0}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
