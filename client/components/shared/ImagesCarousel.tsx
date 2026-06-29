import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { useIsFocused } from "@react-navigation/native";
import type { UploadableFile } from "@/interface/global.dto";

interface ImagesCarouselProps {
  media: UploadableFile[];
  add?: (type: "image" | "video") => void;
  remove?: (index: number) => void;
}


const { height: screenHeight } = Dimensions.get("window");
const MIN_HEIGHT = screenHeight * 0.2;
const MAX_HEIGHT = screenHeight * 0.4;

const VideoSlide = ({ uri, isActive }: { uri: string; isActive: boolean }) => {
  const isFocused = useIsFocused();
  
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    if (isActive && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  });

  useEffect(() => {
    if (isActive && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isFocused, player]);

  return (
    <VideoView
      player={player}
      style={{ width: "100%", height: "100%" }}
      nativeControls={true}
      contentFit="contain"
    />
  );
};

export default function ImagesCarousel({
  media,
  add,
  remove,
}: ImagesCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(
    Dimensions.get("window").width
  );
  const flatListRef = useRef<FlatList>(null);

  if (!media || media.length === 0) {
    return null;
  }

  const nextImage = () => {
    if (currentImageIndex < media.length - 1) {
      const nextIndex = currentImageIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentImageIndex(nextIndex);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIndex });
      setCurrentImageIndex(prevIndex);
    }
  };

  const onScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== currentImageIndex && index >= 0 && index < media.length) {
      setCurrentImageIndex(index);
    }
  };

  const isEdit = add !== undefined && remove !== undefined;

  const currentItem = media[currentImageIndex];

  const currentMediaType =
    currentItem?.type?.includes("video") ||
    currentItem?.uri?.endsWith(".mp4") ||
    currentItem?.uri?.endsWith(".mov")
      ? "video"
      : "image";

  const renderItem = ({
    item,
    index,
  }: {
    item: UploadableFile;
    index: number;
  }) => {
    const isVideo =
      item.type?.includes("video") ||
      item.uri?.endsWith(".mp4") ||
      item.uri?.endsWith(".mov");

    return (
      <View
        style={{ width: containerWidth, height: "100%" }}
        className="relative bg-black justify-center items-center"
      >
        {/* Blurred background for aesthetic framing */}
        {!isVideo && item.uri && (
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
          {isVideo ? (
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
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={renderItem}
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
      />

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <TouchableOpacity
            onPress={prevImage}
            disabled={currentImageIndex === 0}
            className={`absolute left-4 top-1/2 -mt-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/70 ${
              currentImageIndex === 0 ? "opacity-30" : "opacity-100"
            }`}
          >
            <Ionicons name="chevron-back" size={20} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextImage}
            disabled={currentImageIndex === media.length - 1}
            className={`absolute right-4 top-1/2 -mt-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-black/70 ${
              currentImageIndex === media.length - 1 ? "opacity-30" : "opacity-100"
            }`}
          >
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Add Button */}
      {isEdit && currentMediaType !== "video" && (
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
        <View className="absolute bottom-3 left-0 right-0 z-20 flex-row justify-center gap-x-1.5">
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
