import { AntDesign, EvilIcons } from "@expo/vector-icons";
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

export default function ChatHistoryScreen() {
  const insets = useSafeAreaInsets();

  const sheetRef = useRef<BottomSheetModal>(null);

  // 1. React Query
  // ==============================================
  const [submitSearch, setSubmitSearch] = useState("");
  const { data: history, isFetching, refetch } = useHistory(submitSearch);

  const { mutate: deleteChat, isPending: isDeleting } = useDeleteChat();
  const { mutate: renameChat, isPending: isRenaming } = useRenameChat();

  // 2. Estados Locales
  // ==============================================
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ChatHistory | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  // 3. Efectos
  // ==============================================
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setEditing(null);
        setTitle("");
      },
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // 4. Handlers (Funciones de acción)
  // ==============================================
  const handleDelete = () => {
    if (isDeleting || !selected) return;

    deleteChat(selected.chat_id);
    sheetRef.current?.dismiss();
  };

  const handleStartRename = () => {
    if (!selected) return;

    const chatId = selected.chat_id;
    const currentTitle = selected.title;

    sheetRef.current?.dismiss();
    setEditing(chatId);
    setTitle(currentTitle);
  };

  const handleSaveRename = useCallback(() => {
    if (!title.trim() || !editing) {
      setEditing(null);
      return;
    }

    if (isRenaming) return;

    renameChat({ id: editing, title });
    setEditing(null);
    setTitle("");
  }, [title, editing, renameChat, isRenaming]);

  // 5. Sub-Renders
  // ==============================================
  const header = () => (
    <View className="py-4 mt-4">
      <Text className="text-[18px] font-dosis-regular">Conversaciones</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }: { item: ChatHistory }) => {
      const isLast = item.chat_id === history?.[history.length - 1]?.chat_id;

      return (
        <TouchableOpacity
          onPress={() => {
            if (!editing) {
              router.replace({
                pathname: ROUTES.USER.CHAT,
                params: { chat_id: item.chat_id },
              });
            }
          }}
          activeOpacity={editing ? 1 : 0.2}
          style={{
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: "#f5f5f5",
          }}
          className="items-center py-3 justify-between flex-row"
        >
          <View className="flex-col gap-y-1 flex-1">
            {editing === item.chat_id ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
                autoFocus={true}
                onSubmitEditing={handleSaveRename}
                returnKeyType="done"
                className="text-[18px] font-dosis-regular text-text-5 border-b border-gray-300 py-0"
                style={{ padding: 0, margin: 0 }}
              />
            ) : (
              <Text
                numberOfLines={1}
                className="text-[18px] font-dosis-regular tracking-tight truncate"
              >
                {item.title}
              </Text>
            )}

            <Text className="text-[12px] font-dosis-light">
              {getShortTimeAgo(new Date(item.lastActivity))}
            </Text>
          </View>

          {!editing && (
            <TouchableOpacity
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              onPress={() => {
                setSelected(item);
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
    [history, editing, title, handleSaveRename],
  );

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-bg-semi-white"
    >
      <View
        style={{ marginTop: insets.top - 10 }}
        className="items-center mx-6 px-4 py-0.5 justify-start flex-row border border-gray-200 rounded-full"
      >
        <EvilIcons name="search" size={26} color="#4A4947" />
        <TextInput
          className="flex-1 ml-2 text-[16px] text-text-5 font-dosis-regular py-2"
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

      <View className="border-t mt-4 border-gray-200" />

      {isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size={28} color="#3578e4" />
        </View>
      ) : history?.length === 0 && !isFetching ? (
        <View className="flex-1 items-center justify-center flex-col gap-y-2">
          <Text className="text-[20px] font-dosis-bold text-text-3">
            No se encontraron conversaciones
          </Text>
          <Text className="text-[16px] font-dosis-regular text-text-6">
            Intenta buscar otra cosa.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          ListHeaderComponent={header}
          renderItem={renderItem}
          className="flex-1 mx-6"
          keyExtractor={(item) => item.chat_id}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <HistoryModal
        sheetRef={sheetRef as React.RefObject<BottomSheetModal>}
        setSelected={setSelected}
        handleDelete={handleDelete}
        handleStartRename={handleStartRename}
      />
    </SafeAreaView>
  );
}
