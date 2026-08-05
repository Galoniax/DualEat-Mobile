import { useAuth } from "@/context/auth/AuthContext";
import { FontAwesome6 } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  ScrollView,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  RichText,
  useEditorBridge,
  TenTapStartKit,
  PlaceholderBridge,
  ImageBridge,
} from "@10play/tentap-editor";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditorToolbar from "@/components/shared/EditorToolbar";
import ImagesCarousel from "@/components/shared/ImagesCarousel";
import { PostDTO, UploadableFile } from "@/interface/global.dto";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CommunityModal from "@/components/features/create/community/CommunityModal";
import { Community } from "@/interface/global";
import { ROUTES } from "@/constants/constants";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { upload, createPost } from "@/services/post.api";
import { useHeaderHeight } from "@react-navigation/elements";
import { pickMedia } from "@/utils/media";
import { globalToast as toast } from "@/utils/toast";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react-native";
import RecipeSideModal from "@/components/features/recipe/RecipeSideModal";

const CUSTOM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');


  p {
    font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    color: #2F2F2F;
    line-height: 1.5;
    margin-top: 0;
  }


  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #707070;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    pointer-events: none;
    height: 0;
    float: left;
  }


  a {
    color: #3578e4;
    text-decoration: underline;
  }


  ul, ol {
    padding-left: 20px;
  }
`;

const EDITOR_EXTENSIONS = [
  ...TenTapStartKit,
  PlaceholderBridge.configureExtension({
    placeholder: "Empieza a escribir...",
  }),
  ImageBridge,
];

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const { user } = useAuth();

  const { post, setPost, clearPost } = usePostCreateStore();

  const isEditing = useMemo(() => post.id !== "", [post.id]);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const hasActiveSubscription = useMemo(() => {
    return (
      user?.subscription_status === "ACTIVE" ||
      user?.subscription_status === "TRIAL"
    );
  }, [user?.subscription_status]);

  const postLimit = useMemo(
    () => (hasActiveSubscription ? 1000 : 500),
    [hasActiveSubscription],
  );

  const cleanTextLength = useMemo(() => {
    return content.replace(/<[^>]*>/g, "").trim().length;
  }, [content]);

  const [image_urls, setImageUrls] = useState<UploadableFile[]>([]);

  const [community, setCommunity] = useState<Community | null>(null);

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    bridgeExtensions: EDITOR_EXTENSIONS,
    onChange: () => {
      editor.getHTML().then((html) => {
        setContent(html);
      });
    },
  });

  useEffect(() => {
    if (post?.content && editor?.getEditorState().isReady) {
      editor.setContent(post.content);
    }
  }, [editor, post.content]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPost({
          id: "",
          title: "",
          content: "",
          image_urls: [],
          community: null,
          recipe: null,
        });
      };
    }, [setPost]),
  );

  const ref = useRef<BottomSheetModal>(null);
  const recipeRef = useRef<BottomSheetModal>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        ref.current?.forceClose();
        recipeRef.current?.forceClose();
      };
    }, []),
  );

  useEffect(() => {
    if (editor.getEditorState().isReady) {
      editor.injectCSS(CUSTOM_CSS);
    }
  }, [editor]);

  const { mutate: mutatePost, isPending } = useMutation({
    mutationFn: async () => {
      let urls: string[] = [];

      // Solo subimos imágenes si no estamos en modo edición
      if (!isEditing && image_urls.length > 0) {
        const uploadPayload = { post_images: image_urls };

        try {
          const response = await upload(uploadPayload);

          if (response.success && response.data?.post_images) {
            urls = response.data.post_images;
          } else {
            throw new Error(response.message || "No se pudieron subir las imágenes");
          }
        } catch (err: any) {
          // Lanzar el error para interrumpir la mutación y que NO se cree el post
          throw new Error(err.message || "Error al subir las imágenes");
        }
      }

      const postDTO: PostDTO = {
        id: isEditing ? usePostCreateStore.getState().post.id : undefined,
        title: title.trim(),
        content: content.trim(),
        image_urls: urls,
        community: community,
        recipe: post.recipe || null,
      };

      /*const res = isEditing
            ? await updatePost(postDTO.id!, postDTO)
            : await createPost(postDTO);*/

      const res = await createPost(postDTO);

      if (!res.success) {
        throw new Error(res.message || "Error al crear el post");
      }
      return res;
    },

    onSuccess: (res) => {
      clearPost();
      router.replace({
        pathname: ROUTES.USER.POST,
        params: {
          post_id: res.data?.id as string,
          post_slug: res.data?.slug as string,
        },
      });
    },

    onError: (err: any) => {
      toast.error(
        "Error",
        err.message || "Ocurrió un error al procesar la publicación",
      );
    },
  });

  const remove = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    if (!content || content === "<p></p>" || !title) {
      toast.error(
        "Datos incompletos",
        "El título y el contenido no pueden estar vacíos",
      );
      return;
    }

    if (cleanTextLength > postLimit) {
      toast.error(
        "Contenido muy largo",
        `El contenido no puede superar los ${postLimit} caracteres (actual: ${cleanTextLength})`,
      );
      return;
    }

    if (!community) {
      toast.error("Datos incompletos", "Comunidad no seleccionada");
      return;
    }

    mutatePost();
  };

  const handleFiles = async (type: "image" | "video") => {
    let files: UploadableFile[] = [];

    if (type === "image") {
      files = await pickMedia({
        mediaType: "Images",
        allowsMultipleSelection: true,
        allowsEditing: true,
        selectionLimit: 10 - onlyImages.length,
      });
    } else {
      files = await pickMedia({
        mediaType: "Videos",
        allowsMultipleSelection: false,
        allowsEditing: false,
        selectionLimit: 1,
      });
    }

    if (files.length === 0) return;

    const hasVideo = !!video;
    const imageCount = onlyImages.length;

    if (type === "image") {
      if (imageCount >= 10 || hasVideo) return;
      setImageUrls((prev) => [...prev, ...files]);
    } else if (type === "video") {
      if (imageCount > 0 || hasVideo) return;
      setImageUrls((prev) => [...prev, files[0]]);
    }
  };

  const video =
    image_urls.find((item) => {
      return item.type
        ? item.type.includes("video")
        : item.uri?.endsWith(".mp4") || item.uri?.endsWith(".mov");
    }) || null;

  const onlyImages = image_urls.filter((item) => {
    return !(
      item.type?.startsWith("video/") ||
      item.uri?.endsWith(".mp4") ||
      item.uri?.endsWith(".mov")
    );
  });

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ paddingTop: headerHeight }}
      className="flex-1 bg-bg-semi-white"
    >
      {/* HEADER */}
      <View className="relative flex-row items-center justify-center p-4">
        <Text className="font-outfit-bold text-base text-text-3">
          {isEditing ? "Editar post" : "Crear post"}
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
          disabled={isPending || !content || !title}
          className="absolute right-4 rounded-full bg-bg-semi-black py-1 px-4 items-center disabled:opacity-50"
        >
          <Text className="font-outfit-bold text-sm text-text-1">
            {isPending
              ? isEditing
                ? "Guardando..."
                : "Publicando..."
              : "Publicar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-x-4 px-6 items-center">
          <Image
            className="h-8 w-8 rounded-full"
            source={{
              uri: user?.avatar_url,
            }}
          />

          <TextInput
            onChangeText={setTitle}
            value={title}
            placeholder="Título"
            returnKeyType="next"
            maxLength={300}
            multiline
            placeholderTextColor="#2F2F2F"
            autoCapitalize={"sentences"}
            className="font-outfit-medium text-xl flex-1"
          />
        </View>

        {image_urls.length > 0 && (
          <View className="px-6">
            <ImagesCarousel
              media={image_urls}
              add={
                isEditing
                  ? undefined
                  : (type: "image" | "video") => handleFiles(type)
              }
              remove={isEditing ? undefined : (index) => remove(index)}
            />
          </View>
        )}

        {/** EDITOR DE TEXTO */}
        <View
          style={{
            marginTop: 12,
            paddingHorizontal: insets.left + insets.right + 20,
            height: 380,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <RichText
            style={{ backgroundColor: "transparent" }}
            editor={editor}
          />
        </View>
      </ScrollView>

      <View className="flex-col items-center w-full border border-gray-300">
        <TouchableOpacity
          disabled={isEditing}
          onPress={() => ref.current?.present()}
          className="w-full flex-row items-center justify-between p-4"
        >
          {community ? (
            <View className="flex-row items-center gap-x-3">
              <Image
                className="h-6 w-6 rounded-full"
                source={{
                  uri: community.image_url,
                }}
              />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-text-3 font-outfit-light text-sm truncate"
              >
                {community.name}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-x-3">
              <FontAwesome6 name="people-group" size={12} color="#e5a657" />
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                className="text-text-3 font-outfit-light text-sm flex-shrink"
              >
                Selecciona una comunidad
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            recipeRef.current?.present();
          }}
          className={`w-full flex-row items-center gap-x-3 p-4`}
        >
          {!post.recipe ? (
            <>
              <Plus size={18} color="#e5a657" />
              <Text className="text-text-3 font-outfit-light text-sm">
                ¿Vincular una receta?
              </Text>
            </>
          ) : (
            <>
              <Image
                src={
                  (post.recipe && post.recipe.main_image) ||
                  "https://placehold.co/50x50.png"
                }
                alt="Imagen de la comunidad"
                className="w-5 h-5 rounded-full object-cover"
              />
              <Text className="text-text-3 font-outfit-light text-sm">
                {post.recipe.name}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setPost({ ...post, recipe: null });
                }}
                className="cursor-pointer group hover:bg-[#B53325] p-0.5 rounded-full transition-all duration-200"
              >
                <X size={14} className="group-hover:text-[#fff]" />
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </View>

      <EditorToolbar
        editor={editor}
        imageUrls={image_urls}
        handleFiles={
          isEditing ? undefined : (type: "image" | "video") => handleFiles(type)
        }
      />

      <CommunityModal ref={ref} setCommunity={setCommunity} />

      <RecipeSideModal
        ref={recipeRef}
        recipe={post.recipe || undefined}
        onSelectRecipe={(rec) => {
          setPost({ ...post, recipe: rec });
        }}
      />
    </SafeAreaView>
  );
}
