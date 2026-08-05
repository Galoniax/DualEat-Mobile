import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useIsFocused } from "@react-navigation/native";
import type { UploadableFile } from "@/interface/global.dto";
import { getMimeType, getMimeTypeFromUrl } from "@/utils/media";
import { FlatList } from "react-native-gesture-handler";

interface ImagesCarouselProps {
  media: UploadableFile[];
  add?: (type: "image" | "video") => void;
  remove?: (index: number) => void;
}

const { height: screenHeight } = Dimensions.get("window");
const MAX_HEIGHT = screenHeight * 0.4;

const VideoSlide = ({ uri, isActive }: { uri: string; isActive: boolean }) => {
  const isFocused = useIsFocused();

  const videoRef = useRef<View>(null);
  const [isInViewport, setIsInViewport] = useState(true);

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
  });

  const checkVisibility = () => {
    if (videoRef.current) {
      videoRef.current.measureInWindow((x, y, width, height) => {
        const isVisible = y + height > 0 && y < screenHeight;
        setIsInViewport(isVisible);
      });
    }
  };

  useEffect(() => {
    let interval: number;
    if (isActive && isFocused) {
      interval = setInterval(checkVisibility, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isFocused]);

  useEffect(() => {
    if (isActive && isFocused && isInViewport) {
      player.play();
    } else {
      player.pause();
    }

    return () => {
      try {
        player.pause();
      } catch (e) {
        console.log(e);
      }
    };
  }, [isActive, isFocused, isInViewport, player]);

  return (
    <View ref={videoRef} style={{ width: "100%", height: "100%" }}>
      <VideoView
        player={player}
        style={{ width: "100%", height: "100%" }}
        nativeControls={true}
        allowsFullscreen={true}
        contentFit="contain"
        pointerEvents="none"
      />
    </View>
  );
};

export default function ImagesCarousel({
  media,
  add,
  remove,
}: ImagesCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get("window").width,
  );
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (
      viewableItems.length > 0 &&
      viewableItems[0].index !== null &&
      viewableItems[0].index !== undefined
    ) {
      setCurrentImageIndex(viewableItems[0].index);
    }
  }).current;

  if (!media || media.length === 0) {
    return null;
  }

  const isEdit = add !== undefined && remove !== undefined;
  const currentUrl = media[currentImageIndex];

  const mediaType = currentUrl
    ? getMimeTypeFromUrl(currentUrl.uri) ||
      (currentUrl.type ? getMimeType(currentUrl.type) : "")
    : "";

  const renderItem = ({
    item,
    index,
  }: {
    item: UploadableFile;
    index: number;
  }) => {
    const mType =
      getMimeTypeFromUrl(item.uri) || (item.type ? getMimeType(item.type) : "");

    return (
      <View
        style={{ width: containerWidth, height: "100%" }}
        className="relative bg-black justify-center items-center"
      >
        {/* Blurred background for aesthetic framing */}
        {mType !== "video" && item.uri && (
          <Image
            source={{ uri: item.uri }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              opacity: 0.35,
            }}
            blurRadius={15}
            resizeMode="cover"
          />
        )}

        {/* Centered Media Content */}
        <View className="w-full h-full justify-center items-center z-10">
          {mType === "video" ? (
            <VideoSlide uri={item.uri} isActive={index === currentImageIndex} />
          ) : (
            item.uri && (
              <Image
                source={{ uri: item.uri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            )
          )}
        </View>
      </View>
    );
  };

  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={{
        height: isEdit ? 200 : Math.min(containerWidth, MAX_HEIGHT),
      }}
      className="w-full overflow-hidden rounded-[10px] relative bg-black"
    >
      <FlatList
        ref={flatListRef}
        data={media}
        keyExtractor={(item, index) => `${index}-${item.uri}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEnabled
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
      />

      {/* Add Button */}
      {isEdit && mediaType !== "video" && (
        <View className="absolute top-3 left-3 z-20">
          <TouchableOpacity
            onPress={() => add("image")}
            className="flex-row items-center gap-x-1.5 px-3 py-1.5 rounded-[40px] bg-black/70"
          >
            <Ionicons name="images-outline" size={14} color="white" />
            <Text className="text-white text-[12px] font-outfit-bold">
              Añadir
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Remove Button */}
      {isEdit && (
        <TouchableOpacity
          onPress={() => {
            remove?.(currentImageIndex);
            if (currentImageIndex > 0) {
              setCurrentImageIndex(currentImageIndex - 1);
            }
          }}
          className="absolute top-3 right-3 z-20 w-9 h-9 bg-black/70 rounded-full flex items-center justify-center"
        >
          <Ionicons name="trash-outline" size={16} color="white" />
        </TouchableOpacity>
      )}

      {/* Image Counter */}
      <View className="absolute bottom-3 right-3 z-20 bg-black/70 px-2 py-0.5 rounded-full">
        <Text className="text-white text-[11px] font-outfit-light">
          {currentImageIndex + 1} / {media.length}
        </Text>
      </View>

      {/* Dots Indicator */}
      {media.length > 1 && (
        <View
          pointerEvents="box-none"
          className="absolute bottom-3 left-0 right-0 z-20 flex-row justify-center gap-x-1.5"
        >
          {media.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index });
                setCurrentImageIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
