import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Entypo, MaterialCommunityIcons, Octicons } from "@expo/vector-icons";

import { Notification } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback } from "react";
import { useNotifications } from "@/hooks/api/notification/useNotifications";

export default function NotificationView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    notifications,
    markAsRead,
    markAsReadSingle,
    deleteNotification,
    isLoading,
    refetch,
  } = useNotifications();

  console.log(notifications);

  const handleNavigation = (item: Notification) => {
    switch (item.content_type) {
      case "ORDER":
        //router.push(ROUTES.USER.ORDER_INFO(item.metadata.order_id));
        break;
      case "COMMUNITY":
        //router.push(ROUTES.USER.COMMUNITY_SEARCH);
        break;
      case "POST":
        /*router.push(ROUTES.USER.POST(
            item.metadata.post_id,
            item.metadata.post_slug,
          ));*/
        break;
      case "COMMENT":
        /*router.push(ROUTES.USER.RECIPE(
            item.metadata.recipe_id,
            item.metadata.recipe_slug,
          ));*/
        break;
      case "LOCAL":
        /*router.push(ROUTES.USER.LOCAL(
            item.metadata.community_slug,
            item.metadata.recipe_id,
            item.metadata.recipe_slug,
          ));*/
        break;
      default:
        break;
    }
  };

  const EmptyHeader = () => {
    if (isLoading) return null;

    return (
      <View className="w-full justify-center items-center flex-col gap-y-6">
        <View
          style={{ width: "100%", height: 40 }}
          className="relative overflow-hidden"
        >
          <Image
            source={{
              uri: "https://t3.ftcdn.net/jpg/05/17/54/92/360_F_517549233_fjVR9Kt1GlQqtvsGjb1ThVZAwa3gUviE.jpg",
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          <View className="absolute bottom-0 left-0 right-0 inset-0 bg-black opacity-20" />
        </View>

        <View className="w-[80%] flex-col items-center py-4 gap-y-2 border-y border-dashed border-gray-400">
          <MaterialCommunityIcons
            name="bell-cancel-outline"
            size={24}
            color="#2F2F2F"
          />
          <Text className="text-center font-outfit-bold text-base text-text-3">
            &quot;Todo en calma por aquí&quot;
          </Text>
          <Text className="text-center font-outfit-light text-base text-text-4">
            Tus alertas, mensajes y novedades importantes aparecerán en este
            lugar.
          </Text>
        </View>
      </View>
    );
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const RightActions = (item: Notification) => (
    <TouchableOpacity
      onPress={() => deleteNotification(item.id)}
      style={{ paddingHorizontal: 26 }}
      className="bg-bg-red flex flex-1 justify-center items-end "
    >
      <View className="flex-col items-center gap-y-0.5">
        <Octicons name="trash" size={18} color="#fff" />
        <Text className="text-text-1 font-outfit-bold text-[12px]">Borrar</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      edges={["top", "bottom", "left", "right"]}
      className="flex-1 bg-bg-semi-white flex-col gap-y-6"
    >
      <View
        style={{
          paddingHorizontal: insets.left + insets.right + 10,
          paddingTop: insets.top / 2,
        }}
        className="flex-row items-center justify-between gap-x-4 w-full"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-base text-text-3">
          Notificaciones
        </Text>

        <TouchableOpacity
          onPress={() => markAsRead()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <MaterialCommunityIcons
            name="bell-check-outline"
            size={20}
            color="black"
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#e5a657" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              colors={["#e5a657"]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyHeader />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }: { item: Notification }) => (
            <Swipeable
              renderRightActions={() => RightActions(item)}
              onSwipeableOpen={(direction) => {
                if (direction === "right") {
                  deleteNotification(item.id);
                }
              }}
              rightThreshold={10}
              friction={1.5}
              overshootRight={false}
            >
              <TouchableOpacity
                onPress={() => {
                  markAsReadSingle(item.id);
                  handleNavigation(item);
                }}
                className={`w-full flex-row border-y border-dashed border-gray-200 gap-x-3 px-4 py-3 justify-between items-start ${item.read ? "bg-bg-semi-white" : "bg-bg-gray"} `}
              >
                <View style={{ flex: 1 }} className="flex-col gap-y-1">
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="font-outfit-bold text-[14px] text-text-3"
                  >
                    {item.title}
                  </Text>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    className="font-outfit-light text-[14px] text-text-5"
                  >
                    &quot;{item.message}&quot;
                  </Text>

                  <Text className="font-outfit-light text-[12px] text-text-5">
                    {getShortTimeAgo(item.created_at)}
                  </Text>
                </View>

                {item.metadata.image_urls &&
                  item.metadata.image_urls.length > 0 && (
                    <Image
                      source={{
                        uri: item.metadata.image_urls[0],
                      }}
                      style={{ width: 50, height: "100%", borderRadius: 5 }}
                      resizeMode="cover"
                    />
                  )}
              </TouchableOpacity>
            </Swipeable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
