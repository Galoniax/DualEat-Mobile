import { useAuth } from "@/context/auth/AuthContext";
import {
  Entypo,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

const CUSTOM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

  p {
    font-family: 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: #2F2F2F;
    line-height: 1.5;
    margin-top: 0;
  }

  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #707070; 
    font-size: 16px;
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

  const [title, setTitle] = useState("");

  const [image_urls, setImageUrls] = useState<UploadableFile[]>([]);

  const [community, setCommunity] = useState<Community | null>(null);

  const [withRecipe, setWithRecipe] = useState(false);

  const ref = useRef<BottomSheetModal>(null);

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    bridgeExtensions: EDITOR_EXTENSIONS,
  });

  useEffect(() => {
    if (editor.getEditorState().isReady) {
      editor.injectCSS(CUSTOM_CSS);
    }
  }, [editor]);

  const remove = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    const content = await editor.getHTML();

    if (!content || content === "<p></p>" || !title) {
      toast.error("Datos incompletos", "El título y el contenido no pueden estar vacíos")
      return;
    }

    if (!community) {
      toast.error("Datos incompletos", "Comunidad no seleccionada");
      return;
    }

    if (withRecipe) {
      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: image_urls,
        community: community,
      };

      setPost(post);

      console.log("POST", JSON.stringify(post, null, 2));

      router.push(ROUTES.USER.CREATE_RECIPE);
    } else {
      let finalImageUrls: string[] = [];

      if (image_urls.length > 0) {
        const uploadPayload = { post_images: image_urls };

        const response = await upload(uploadPayload);

        if (response?.success && response?.data) {
          finalImageUrls = response.data.post_images || [];
        }
      }

      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: finalImageUrls,
        community: community,
      };

      const result = await createPost(post);

      console.log("CREATE RESPONSE", JSON.stringify(result, null, 2));

      /*if (createResponse.success) {
        router.back();
      }*/
    }
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
      return (
        item.type?.startsWith("video/") ||
        item.uri?.endsWith(".mp4") ||
        item.uri?.endsWith(".mov")
      );
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
      <View className="flex-row items-center justify-between p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>

        <Text className="font-outfit-bold text-center text-base text-text-3 flex-1">
          Crear post
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
          className="rounded-full bg-bg-semi-black py-1 px-4 items-center"
        >
          <Text className="font-outfit-bold text-sm text-text-1">
            {withRecipe ? "Continuar" : "Publicar"}
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
            placeholderTextColor="#2F2F2F"
            autoCapitalize={"sentences"}
            className="font-outfit-medium text-[20px] flex-1"
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

      <View className="flex-row items-center w-full border border-gray-200">
        <TouchableOpacity
          onPress={() => ref.current?.present()}
          style={{ flex: 1 }}
          className="border-r border-gray-200 h-14 flex-row items-center justify-between px-4"
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
                className="text-text-3 font-outfit-light text-[13px] truncate"
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
          onPress={() => setWithRecipe(!withRecipe)}
          style={{ flex: 1 }}
          className="h-14 flex-row items-center justify-between px-4"
        >
          <View className="flex-row items-center gap-x-3">
            <Entypo name="book" size={16} color="#e5a657" />
            <Text
              className="text-text-3 font-outfit-light text-sm"
              numberOfLines={1}
            >
              ¿Tiene receta?
            </Text>
          </View>

          <MaterialCommunityIcons
            name={withRecipe ? "checkbox-marked" : "checkbox-blank-outline"}
            size={18}
            color="#e5a657"
          />
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
    </SafeAreaView>
  );
}
