import React from "react";
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

import { AntDesign } from "@expo/vector-icons";
import PostImagesCarousel from "./PostImagesCarousel";

import { ROUTES } from "@/constants/constants";
import PostActions from "./PostActions";
import RecipeCard from "../recipe/RecipeCard";
import { getShortTimeAgo } from "@/utils/date";
import RenderHTML, { defaultSystemFonts } from "react-native-render-html";

interface PostCardProps {
  post: Post;
  type: "POST" | "HOME" | "COMMUNITY";
}

const systemFonts = [...defaultSystemFonts, "Dosis-Regular", "Dosis-Bold"];

const stripHTMLTags = (str: string) => {
  if (!str) return "";
  
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ') 
    .trim();                 
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  type = "HOME",
}: PostCardProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const { user } = useAuth();

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

  return (
    <TouchableOpacity
      key={post.id}
      className={`flex-col w-full gap-y-2`}
      activeOpacity={0.8}
      disabled={type === "POST"}
      onPress={() => handleNavigate(true)}
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
                onPress={handleNavigateCommunity}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text className="text-[14px] font-dosis-bold text-text-3">
                  {post.community?.name}
                </Text>
              </TouchableOpacity>
            )}

            <View className="flex-row items-center gap-2">
              <Text className="text-[12px] font-dosis-regular text-text-4">
                {post.user?.name}
              </Text>
              <Text className="text-[12px] font-dosis-regular text-text-4">
                • {getShortTimeAgo(post?.created_at)}
              </Text>
            </View>
          </View>
        </View>

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

      <View className="flex-col gap-y-2">
        <Text className="text-[16px] font-dosis-bold text-text-3 mt-1">
          {post.title}
        </Text>

        {post.content && post.image_urls?.length === 0 && type !== "POST" ? (
          <Text style={TextHTML} ellipsizeMode="tail" numberOfLines={3}>
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

      <View>
        <PostActions content={post as Post} type="POST" />
      </View>
    </TouchableOpacity>
  );
};

export default PostCard;
