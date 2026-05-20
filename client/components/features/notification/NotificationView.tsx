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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotification,
  getNotifications,
  readAllNotifications,
} from "@/services/notifications.api";
import { Notification } from "@/interface/global";
import { getShortTimeAgo } from "@/utils/date";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useCallback } from "react";

export default function NotificationView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    data: notifications,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await getNotifications();
      return response.data as Notification[];
    },

    staleTime: 1000 * 60 * 30,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const EmptyHeader = () => {
    if (isFetching) return null;

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
          <Text className="text-center font-dosis-bold text-[16px] text-text-3">
            &quot;Todo en Calma por Aquí&quot;
          </Text>
          <Text className="text-center font-dosis-regular text-[14px] text-text-4">
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

  const queryClient = useQueryClient();

  // TODO: Toast
  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await deleteNotification(id);

      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del servidor");
      }

      console.log("Mensaje enviado", JSON.stringify(response.data, null, 2));

      return response.data;
    },

    onMutate: async ({ id }: { id: string }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData([
        "notifications",
      ]) as Notification[];

      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] | undefined) => {
          if (!old) return old;
          return old.filter((n) => n.id !== id);
        },
      );

      return { previous, id };
    },

    onError: (err, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const { mutate: readAllNotificationMutation } = useMutation({
    mutationFn: async () => {
      const response = await readAllNotifications();
      if (!response.success || !response.data) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.data;
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previous = queryClient.getQueryData([
        "notifications",
      ]) as Notification[];

      queryClient.setQueryData(
        ["notifications"],
        (old: Notification[] | undefined) => {
          if (!old) return old;
          return old.map((n) => ({ ...n, read: true }));
        },
      );

      return { previous };
    },

    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const RightActions = (item: Notification) => (
    <TouchableOpacity
      onPress={() => deleteNotificationMutation({ id: item.id })}
      style={{ paddingHorizontal: 26 }}
      className="bg-bg-red flex justify-center items-end "
    >
      <View className="flex-col items-center gap-y-0.5">
        <Octicons name="trash" size={18} color="#fff" />
        <Text className="text-text-1 font-dosis-bold text-[12px]">Borrar</Text>
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
          paddingVertical: insets.top / 2,
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
        <Text className="font-dosis-bold text-[16px] text-text-3">
          Notificaciones
        </Text>

        <TouchableOpacity
          onPress={() => readAllNotificationMutation()}
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
          renderItem={({ item }: { item: Notification }) => (
            <Swipeable
              renderRightActions={() => RightActions(item)}
              onSwipeableOpen={(direction) => {
                if (direction === "right") {
                  deleteNotificationMutation({ id: item.id });
                }
              }}
              rightThreshold={40}
              friction={2}
              overshootRight={false}
            >
              <TouchableOpacity
                className={`w-full flex-row gap-x-3 px-4 py-3 justify-between items-start ${!item.read ? "bg-bg-gray" : "bg-bg-semi-white"} `}
              >
                <Image
                  source={{
                    uri:
                      item.content_type === "COMMENT"
                        ? item.user?.avatar_url
                        : "https://ohhvldagwoycuifwhgtc.supabase.co/storage/v1/object/public/assets/android-icon-foreground.png",
                  }}
                  style={{ width: 32, height: 32, borderRadius: 999 }}
                  resizeMode="cover"
                />

                <View style={{ flex: 1 }} className="flex-col gap-y-1">
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="font-dosis-bold text-[14px] text-text-3"
                  >
                    {item.metadata.title ?? ""}
                  </Text>
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    className="font-dosis-regular text-[14px] text-text-5"
                  >
                    &quot;{item.message}&quot;
                  </Text>

                  <Text className="font-dosis-regular text-[12px] text-text-5">
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
