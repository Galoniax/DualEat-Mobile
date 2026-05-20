import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
} from "react-native";
import type { Post } from "@/interface/global";

interface PostImagesCarouselProps {
  post: Post;
}

const { height: screenHeight } = Dimensions.get("window");
const MIN_HEIGHT = screenHeight * 0.2; 
const MAX_HEIGHT = screenHeight * 0.4;

const CarouselImageItem = ({
  uri,
  containerWidth,
  onPress,
}: {
  uri: string;
  containerWidth: number;
  onPress?: () => void;
}) => {
  const [imgHeight, setImgHeight] = useState(MIN_HEIGHT);

  useEffect(() => {
    if (!uri) return;
    Image.getSize(
      uri,
      (width, height) => {
        if (width > 0) {
          const aspectRatio = height / width;
          let calculatedHeight = containerWidth * aspectRatio;

          calculatedHeight = Math.max(MIN_HEIGHT, Math.min(calculatedHeight, MAX_HEIGHT));

          setImgHeight(calculatedHeight);
        }
      },
      (e) => console.log("Error obteniendo tamaño de imagen:", e),
    );
  }, [uri, containerWidth]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} delayPressIn={50}>
      <Image
        source={{ uri }}
        style={{ width: containerWidth, height: imgHeight }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
};

const PostImagesCarousel: React.FC<PostImagesCarouselProps> = ({
  post,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showIndicators = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    hideTimeout.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 2000);
  }, [fadeAnim]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
      showIndicators();
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (!post?.image_urls || post.image_urls.length === 0) return null;

  const totalImages = post.image_urls.length;

  return (
    <View
      className="rounded-[15px] overflow-hidden border border-gray-100 w-full relative"
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <FlatList
          data={post.image_urls}
          keyExtractor={(item, index) => `${index}-${item}`}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <CarouselImageItem
              uri={item}
              containerWidth={containerWidth}
            />
          )}
        />
      )}

      {totalImages > 1 && (
        <>
          <Animated.View
            style={{ opacity: fadeAnim }}
            className="absolute bottom-6 w-full flex-row justify-center items-center gap-1.5 pointer-events-none"
          >
            {post.image_urls.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-3.5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </Animated.View>
          <View className="absolute top-4 right-4 pointer-events-none bg-black/45 rounded-[10px] px-2 py-0.5">
            <Text style={{ fontSize: 10 }} className="text-white font-dosis-regular">
              {currentIndex + 1}/{totalImages}
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default PostImagesCarousel;
