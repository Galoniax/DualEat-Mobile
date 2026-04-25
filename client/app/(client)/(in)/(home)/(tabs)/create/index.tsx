import { useAuth } from "@/context/auth/AuthContext";
import {
  Entypo,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useVideoPlayer, VideoView } from "expo-video";

import {
  RichText,
  useEditorBridge,
  TenTapStartKit,
  PlaceholderBridge,
  ImageBridge,
} from "@10play/tentap-editor";

import { useCallback, useEffect, useRef, useState } from "react";
import EditorToolbar, {
  EditorToolbarRef,
} from "@/components/shared/EditorToolbar";
import { PostDTO, UploadableFile, UploadPayload } from "@/interface/global.dto";
import { useEvent } from "expo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import CommunityModal from "@/components/features/create/CommunityModal";
import { Community } from "@/interface/global";
import { ROUTES } from "@/constants/constants";
import { usePostCreateStore } from "@/context/store/usePostCreate";
import { upload, createPost } from "@/services/post.api";

export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { setPost } = usePostCreateStore();

  const [title, setTitle] = useState("");
  const [images, setImages] = useState<UploadableFile[]>([]);
  const [video, setVideo] = useState<UploadableFile | null>(null);

  const [community, setCommunity] = useState<Community | null>(null);

  const [withRecipe, setWithRecipe] = useState(false);

  const ref = useRef<BottomSheetModal>(null);
  const toolbarRef = useRef<EditorToolbarRef>(null);

  const player = useVideoPlayer(video?.uri || "", (player) => {
    player.loop = true;
    player.pause();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const { muted } = useEvent(player, "mutedChange", {
    muted: player.muted,
  });

  const customCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600;700&display=swap');

  p {
    font-family: 'Dosis', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 16px;
    color: #2F2F2F;
    line-height: 1.5;
    margin-top: 0;
  }

  .ProseMirror p.is-empty:first-child::before {
    content: attr(data-placeholder);
    color: #707070; 
    font-size: 16px;
    font-family: 'Dosis', sans-serif;
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

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,

    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: "Empieza a escribir...",
      }),
      ImageBridge,
    ],
  });

  useEffect(() => {
    if (editor.getEditorState().isReady) {
      editor.injectCSS(customCSS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.getEditorState().isReady, editor, customCSS]);

  const remove = useCallback(
    (index: number, type: "image" | "video") => {
      if (type === "image") {
        setImages(images.filter((_, i) => i !== index));
      } else {
        setVideo(null);
      }
    },
    [images],
  );

  console.log(editor.getHTML());

  const handleSubmit = async () => {
    const content = await editor.getHTML();

    // TODO: Toast
    if (!content || content === "<p></p>" || !title) {
      console.log("El editor está vacío");
      return;
    }

    if (withRecipe) {
      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: images
          ? images.map((image) => image)
          : video
            ? [video]
            : [],
        community_id: community?.id || null,
      };

      setPost(post);

      console.log("POST", JSON.stringify(post, null, 2));

      router.push(ROUTES.USER.CREATE_RECIPE);
    } else {
      const uploadPayload: UploadPayload = {
        post_images: images
          ? images.map((image) => image)
          : video
            ? [video]
            : [],
      };

      console.log("UPLOAD PAYLOAD", JSON.stringify(uploadPayload, null, 2));

      const response = await upload(uploadPayload);

      const urls = response.data;

      console.log("UPLOAD RESPONSE", JSON.stringify(urls, null, 2));

      const post: PostDTO = {
        title: title,
        content: content,
        image_urls: urls?.post_images || [],
        community_id: community?.id || null,
      };

      const r = await createPost(post);

      console.log("CREATE RESPONSE", JSON.stringify(r, null, 2));

      /*if (createResponse.success) {
        router.back();
      }*/
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
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

        <Text className="font-dosis-bold text-center text-[16px] text-text-3 flex-1">
          Crear
        </Text>

        <TouchableOpacity
          onPress={() => {
            handleSubmit();
          }}
          className="rounded-full bg-bg-semi-black py-1 px-4 items-center"
        >
          <Text className="font-dosis-bold text-[14px] text-text-1">
            Publicar
          </Text>
        </TouchableOpacity>
      </View>

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
          className="font-dosis-semibold text-[20px] flex-1"
        />
      </View>

      {images.length > 0 && (
        <View>
          <FlatList
            data={images}
            horizontal={true}
            keyExtractor={(item, index) => index.toString()}
            className="mx-6 mt-4"
            renderItem={({ item, index }) => {
              const isLast = index === images.length - 1;

              return (
                <View
                  key={index}
                  style={{
                    width: 150,
                    height: 150,
                    marginRight: 8,
                    overflow: "hidden",
                  }}
                  className="relative"
                >
                  <Image
                    className="border border-gray-200 bg-bg-semi-black"
                    style={{
                      flex: 1,
                      borderRadius: 14,
                    }}
                    source={{ uri: item.uri }}
                  />
                  {/** Eliminar foto */}
                  <TouchableOpacity
                    onPress={() => remove(index, "image")}
                    style={{
                      top: 6,
                      right: 6,
                      opacity: 0.8,
                    }}
                    className="absolute bg-bg-semi-black rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    <Entypo name="cross" size={16} color="white" />
                  </TouchableOpacity>

                  {/** Añadir foto */}
                  {isLast && (
                    <TouchableOpacity
                      onPress={() => toolbarRef.current?.handleAddImage()}
                      style={{
                        bottom: 6,
                        right: 6,
                      }}
                      className="absolute bg-bg-semi-black rounded-full px-2 py-1 flex-row items-center gap-x-2"
                    >
                      <MaterialCommunityIcons
                        name="image-plus-outline"
                        size={16}
                        color="#fff"
                      />
                      <Text className="text-[13px] font-dosis-bold text-text-1">
                        Añadir
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </View>
      )}

      {video && (
        <View className="px-6 mt-4">
          {/* CONTENEDOR PRINCIPAL DEL VIDEO (Relative) */}
          <View className="relative w-full h-[250px] rounded-xl overflow-hidden bg-black">
            {/* 1. EL VIDEO (Sin controles nativos) */}
            <VideoView
              player={player}
              style={{ width: "100%", height: "100%" }}
              nativeControls={false} // <--- ESTO APAGA LA UI DEL SISTEMA
              contentFit="cover"
            />

            {/* 2. OVERLAY OSCURECIDO EN LA PARTE INFERIOR (Para que los iconos blancos resalten) */}
            <View className="absolute bottom-0 w-full h-12 bg-black/40 flex-row items-center justify-between px-3">
              <View className="flex-row items-center gap-x-4">
                {/* Botón de Play/Pause */}
                <TouchableOpacity
                  onPress={() => (isPlaying ? player.pause() : player.play())}
                >
                  <Entypo
                    name={isPlaying ? "controller-paus" : "controller-play"}
                    size={22}
                    color="white"
                  />
                </TouchableOpacity>

                {/* Botón de Mute (Twitter suele mutear los videos por defecto) */}
                <TouchableOpacity
                  onPress={() => {
                    player.muted = !player.muted;
                  }}
                >
                  <Ionicons
                    name={muted ? "volume-mute" : "volume-high"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/** EDITOR DE TEXTO */}
      <View
        style={{
          marginTop: 12,
          paddingHorizontal: insets.left + insets.right + 20,
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <RichText style={{ backgroundColor: "transparent" }} editor={editor} />
      </View>

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
                className="text-text-3 font-dosis-regular text-[13px] truncate"
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
                className="text-text-3 font-dosis-regular text-[13px] flex-shrink"
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
              className="text-text-3 font-dosis-regular text-[13px]"
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
        ref={toolbarRef}
        editor={editor}
        images={images}
        video={video}
        setImages={setImages}
        setVideo={setVideo}
      />

      <CommunityModal ref={ref} setCommunity={setCommunity} />
    </SafeAreaView>
  );
}
