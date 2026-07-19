import React, { useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import type { Post } from "@/interface/global";

import { useAuth } from "@/context/auth/AuthContext";
import { useRouter } from "expo-router";

import {
  AntDesign,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import PostImagesCarousel from "./PostImagesCarousel";

import { ROUTES } from "@/constants/constants";
import PostActions from "./PostActions";
import RecipeCard from "../recipe/RecipeCard";
import { getShortTimeAgo } from "@/utils/date";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { useMyCommunities } from "@/hooks/api/useMyCommunities";
import { useDeletePost } from "@/hooks/api/post/usePost";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeCheck } from "lucide-react-native";

interface PostCardProps {
  post: Post;
  type: "POST" | "HOME" | "COMMUNITY";
  showActions?: boolean;
  padding?: string;
}

const systemFonts = [...defaultSystemFonts, "Outfit-Light", "Outfit-Bold"];

const stripHTMLTags = (str: string) => {
  if (!str) return "";

  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  type = "HOME",
  showActions = true,
  padding,
}: PostCardProps) => {
  const router = useRouter();

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { user } = useAuth();

  const { data: myCommunities } = useMyCommunities();
  const { mutate: deletePost, isPending } = useDeletePost();

  const { setPost } = usePostCreateStore();

  const handleNavigate = (type: "POST" | "RECIPE" | "COMMUNITY") => {
    switch (type) {
      case "POST":
        router.push({
          pathname: ROUTES.USER.POST,
          params: {
            post_id: post.id || "",
            post_slug: post.slug || "",
          },
        });
        break;

      case "RECIPE":
        router.push({
          pathname: ROUTES.USER.RECIPE,
          params: {
            recipe_id: post.recipe?.id || "",
            recipe_slug: post.recipe?.slug || "",
          },
        });
        break;

      case "COMMUNITY":
        router.push({
          pathname: ROUTES.USER.COMMUNITY,
          params: {
            community_slug: post.community?.slug || "",
          },
        });
        break;

      default:
        break;
    }
  };

  const TextHTML = {
    lineHeight: 24,
    fontFamily: "Outfit-Light",
    color: "#4A4947",
  };

  const styles = {
    strong: {
      fontFamily: "Outfit-Bold",
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
      fontFamily: "Outfit-Light",
      marginBottom: 12,
    },
  };

  const ref = useRef<BottomSheetModal>(null);

  const isPostCreator = post.user_id === user?.id;

  const isCreator = post.community?.creator_id === user?.id;

  const isModerator =
    myCommunities?.some(
      (member) =>
        member.community_id === post.community_id && member.is_moderator,
    ) || false;

  const canEdit = isPostCreator;
  const canDelete = isPostCreator || isCreator || isModerator;

  const handleDelete = () => {
    ref.current?.dismiss();
    deletePost({ post_id: post.id });
  };

  return (
    <TouchableOpacity
      key={post.id}
      className={`flex-col w-full gap-y-2.5 ${padding}`}
      activeOpacity={0.8}
      disabled={type === "POST"}
      onPress={() => {
        handleNavigate("POST");
      }}
    >
      <View className="flex-row items-center justify-between w-full">
        <View className="flex-row items-center gap-x-2.5">
          <Image
            source={{
              uri:
                type === "COMMUNITY"
                  ? post.user?.avatar_url
                  : post.community?.image_url ||
                    "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/DefaultProfile.png",
            }}
            className="w-8 h-8 rounded-full"
            resizeMode="cover"
          />
          <View className="flex-col gap-y-0.5">
            {type !== "COMMUNITY" && (
              <TouchableOpacity
                onPress={() => handleNavigate("COMMUNITY")}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-sm font-outfit-bold text-text-3">
                  {post.community?.name}
                </Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center gap-2">
               {(post.user?.subscription_status === "ACTIVE" || post.user?.subscription_status === "TRIAL") && (
                <BadgeCheck size={16} fill="#3578e4" color="#fff" />
              )}
              <Text className="text-sm font-outfit-light text-text-4">
                {post.user?.name}
              </Text>
             
              <Text className="text-sm font-outfit-light text-text-4">
                • {getShortTimeAgo(post?.created_at, true)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contenedor Derecho: Botón de opciones */}
        {(canEdit || canDelete) && (
          <TouchableOpacity
            onPress={() => ref.current?.present()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="rounded-full"
          >
            <AntDesign
              style={{ transform: [{ rotate: "90deg" }] }}
              name="ellipsis"
              size={18}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-col gap-y-2">
        <Text className="text-lg font-outfit-bold text-text-3">
          {post.title}
        </Text>

        {post.content && post.image_urls?.length === 0 && type !== "POST" ? (
          <Text
            style={TextHTML}
            className="text-base"
            ellipsizeMode="tail"
            numberOfLines={3}
          >
            {stripHTMLTags(post.content || "")}
          </Text>
        ) : (
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
        {post?.image_urls?.length > 0 && <PostImagesCarousel post={post} />}

        {/* Tarjeta de Receta */}
        {post.recipe && <RecipeCard recipe={{ ...post.recipe }} />}
      </View>

      {showActions && (
        <View>
          <PostActions content={post as Post} type="POST" />
        </View>
      )}

      <BottomSheetModal
        ref={ref}
        enableDynamicSizing={true}
        enableOverDrag={false}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          marginTop: 4,
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.4}
            pressBehavior="close"
          />
        )}
      >
        <BottomSheetView
          style={{ paddingBottom: insets.bottom + 16 }}
          className="flex-1 justify-center items-center flex-col gap-y-2 px-4"
        >
          <Text className="text-text-3 font-outfit-bold text-sm">Acciones</Text>

          <TouchableOpacity
            onPress={() => {
              handleDelete();
            }}
            disabled={isPending}
            className="relative w-full flex-row items-center gap-x-2 py-2"
          >
            <Octicons name="trash" size={20} color="#B53325" />
            <Text className="text-sm font-outfit-light text-text-3">
              Eliminar post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setPost({
                id: post.id,
                title: post.title,
                content: post.content,
                image_urls: post.image_urls || [],
                community: post.community,
              });
              router.push(ROUTES.USER.CREATE);
            }}
            className="relative w-full flex-row items-center gap-x-2 py-2"
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color="#3578e4"
            />
            <Text className="text-sm font-outfit-light text-text-3">
              Editar post
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </TouchableOpacity>
  );
};

export default PostCard;
