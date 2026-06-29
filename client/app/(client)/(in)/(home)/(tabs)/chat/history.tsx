import { AntDesign, Entypo, EvilIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  ChatHistory,
  useDeleteChat,
  useHistory,
  useRenameChat,
} from "@/hooks/api/chat/useHistory";

import { getShortTimeAgo } from "@/utils/date";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useFocusEffect } from "expo-router";
import { ROUTES } from "@/constants/constants";
import HistoryModal from "@/components/features/chat/HistoryModal";
import { globalToast as toast } from "@/utils/toast";

type PartialChatHistory = Pick<ChatHistory, "chat_id" | "title">;

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();

  const sheetRef = useRef<BottomSheetModal>(null);

  const [search, setSearch] = useState("");
  const [submitSearch, setSubmitSearch] = useState("");

  const { data: history, isFetching, refetch } = useHistory(submitSearch);

  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const { mutate: renameChat, isPending: isRenaming } = useRenameChat();

  const [selected, setSelected] = useState<PartialChatHistory | null>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState(selected?.title || "");

  useFocusEffect(
    useCallback(() => {
      refetch();

      return () => {
        sheetRef.current?.dismiss();
      };
    }, [refetch]),
  );

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setIsEditing(false);
        setNewTitle("");
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Handlers
  const handleDelete = () => {
    if (isDeleting || !selected) return;

    deleteChat(selected.chat_id, {
      onSuccess: (data) => {
        toast.success(
          data.message ?? "Conversación eliminada",
          "La conversación fue eliminada correctamente",
        );
        setSelected(null);
        sheetRef.current?.dismiss();
      },
      onError: (err: any) => {
        toast.error(
          err.message ?? "Error desconocido",
          "La conversación no se pudo eliminar, intentalo de nuevo",
        );
      },
    });
  };

  const handleStartRename = () => {
    if (!selected) return;

    const current = selected.title;

    sheetRef.current?.dismiss();
    setIsEditing(true);
    setNewTitle(current);
  };

  const handleSaveRename = useCallback(() => {
    if (!newTitle.trim() || !isEditing) {
      setIsEditing(false);
      return;
    }

    if (isRenaming) return;

    renameChat(
      { id: selected?.chat_id as string, title: newTitle },
      {
        onSuccess: (data) => {
          toast.success(
            data.message ?? "Conversación renombrada",
            "La conversación fue renombrada correctamente",
          );
          setSelected(null);
          setNewTitle("");
          setIsEditing(false);
        },

        onError: (err: any) => {
          toast.error(
            err.message ?? "Error desconocido",
            "La conversación no se pudo renombrar, intentalo de nuevo",
          );
        },
      },
    );
  }, [newTitle, selected, renameChat, isRenaming, isEditing]);

  // Render
  const renderItem = useCallback(
    ({ item }: { item: ChatHistory }) => {
      const isLast = item.chat_id === history?.[history.length - 1]?.chat_id;

      return (
        <TouchableOpacity
          onPress={() => {
            if (!isEditing) {
              router.replace({
                pathname: ROUTES.USER.CHAT,
                params: { chat_id: item.chat_id },
              });
            }
          }}
          activeOpacity={isEditing ? 1 : 0.2}
          style={{
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: "#f5f5f5",
          }}
          className="items-center py-3 justify-between flex-row"
        >
          <View className="flex-col gap-y-1 flex-1">
            {isEditing && selected?.chat_id === item.chat_id ? (
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                autoFocus={true}
                onSubmitEditing={handleSaveRename}
                returnKeyType="done"
                className="text-[18px] font-outfit-light text-text-5 border-b border-gray-300"
                style={{ padding: 0, margin: 0 }}
              />
            ) : (
              <Text
                numberOfLines={1}
                className="text-[16px] text-text-3 font-outfit-light tracking-tight truncate"
              >
                {item.title}
              </Text>
            )}

            <Text className="text-[12px] font-dosis-light">
              {getShortTimeAgo(new Date(item.lastActivity))}
            </Text>
          </View>

          {!isEditing && (
            <TouchableOpacity
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              onPress={() => {
                setSelected({
                  chat_id: item.chat_id,
                  title: item.title,
                });
                sheetRef.current?.present();
              }}
            >
              <AntDesign
                name="ellipsis"
                size={18}
                color="#878787"
                className="rotate-90"
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    },
    [history, isEditing, newTitle, handleSaveRename, selected?.chat_id],
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={{ paddingHorizontal: insets.left + insets.right + 12 }}
      className="flex-1 bg-bg-semi-white flex-col gap-y-4"
    >
      {/** HEADER */}
      <View
        style={{
          paddingHorizontal: insets.left + insets.right + 12,
          paddingVertical: insets.top / 2,
        }}
        className=" flex-row items-center justify-center w-full"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          className="h-10 w-10 flex items-center justify-center absolute left-0 top-1/2"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
        <Text className="font-outfit-bold text-base text-text-3">
          Conversaciones
        </Text>
      </View>

      {/** SEARCH BAR */}
      <View className="border-b border-gray-200 pb-4">
        <View className="items-center px-4 py-0.5 justify-start flex-row border border-gray-200 rounded-full">
          <EvilIcons name="search" size={26} color="#4A4947" />
          <TextInput
            className="flex-1 ml-2 text-base text-text-5 font-outfit-light py-2"
            onSubmitEditing={() => {
              setSubmitSearch(search);
            }}
            returnKeyType="search"
            placeholder="Historial de conversaciones"
            placeholderTextColor={"#4A4947"}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              if (text.trim() === "") {
                setSubmitSearch("");
              }
            }}
          />
        </View>
      </View>

      {isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={28} color="#3578e4" />
        </View>
      ) : history?.length === 0 && !isFetching ? (
        <View className="flex-1 items-center justify-center flex-col gap-y-2">
          <Text className="text-xl font-outfit-bold text-text-3">
            No se encontraron conversaciones
          </Text>
          <Text className="text-lg font-outfit-light text-text-6">
            Intenta buscar otra cosa.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          renderItem={renderItem}
          className="flex-1 mx-2"
          keyExtractor={(item) => item.chat_id}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/** MODAL **/}
      <HistoryModal
        sheetRef={sheetRef as React.RefObject<BottomSheetModal>}
        handleDelete={handleDelete}
        handleStartRename={handleStartRename}
      />
    </SafeAreaView>
  );
}
