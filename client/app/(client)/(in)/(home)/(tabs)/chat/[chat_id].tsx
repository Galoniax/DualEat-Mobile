import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import { ChatSessionData, Ingredient, Recipe } from "@/interface/global";
import Markdown from "react-native-markdown-display";
import MessageInput from "@/components/features/chat/MessageInput";
import IngredientsModal from "@/components/features/chat/IngredientsModal";
import { useChat, useCreateMessage } from "@/hooks/api/chat/useChat";
import { ROUTES } from "@/constants/constants";
import { Feather, Octicons } from "@expo/vector-icons";
import { useIngredients } from "@/hooks/api/recipe/useIngredients";
import { useAuth } from "@/context/auth/AuthContext";
import { useRecipeStore } from "@/context/store/useRecipeStore";
import { capitalize } from "@/utils/normalize";
import { Path, Svg } from "react-native-svg";

const rules = {
  strong: (node: any, children: any, parent: any, styles: any) => (
    <Text key={node.key} style={[styles.strong, { fontFamily: "Dosis-Bold" }]}>
      {children}
    </Text>
  ),
};

export default function ChatScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { user } = useAuth();

  const navigation = useNavigation();

  const { chat_id } = useLocalSearchParams<{ chat_id: string }>();

  const [open, setOpen] = useState(false);

  const { data: chat, isLoading, isFetching } = useChat(chat_id as string);
  const { mutate: createMessage, isPending } = useCreateMessage();
  const { setQuery, setRecipes, recipes } = useRecipeStore();

  const {
    data: ingredients,
    isLoading: isLoadingIngredients,
    isFetching: isFetchingIngredients,
  } = useIngredients(open);

  const ingredientsRef = useRef<BottomSheetModal>(null);
  const recipeRef = useRef<BottomSheetModal>(null);

  const [ingredientsSelected, setIngredientsSelected] = useState<Ingredient[]>(
    [],
  );

  const [message, setMessage] = useState("");

  useFocusEffect(
    useCallback(() => {
      return () => {
        ingredientsRef.current?.dismiss();
      };
    }, [ingredientsRef]),
  );

  useEffect(() => {
    if (chat_id) return;
    setQuery(null);
    setRecipes([]);
  }, [chat_id, setQuery, setRecipes]);

  const handleSubmit = () => {
    if (!message) return;
    const text = message.trim();

    setMessage("");

    createMessage(
      {
        chat_id: chat_id || null,
        recipe_id: chat?.recipe_id || null,
        message: text,
        prevMessages: (chat?.messages as ChatSessionData[]) || [],
        ingredients: ingredientsSelected,
      },
      {
        onSuccess: (data) => {
          if (data.recipes && data.recipes.length > 0) {
            setRecipes(data.recipes as Recipe[]);
            setQuery(data.search_query);
          }

          if (!chat_id && data.chat?.chat_id) {
            router.setParams({ chat_id: data.chat.chat_id });
          }
        },
        onError: (error) => {
          console.log("Error al enviar mensaje:", error);
          setMessage(text);
        },
      },
    );
  };

  const renderMessage = useCallback(({ item }: { item: ChatSessionData }) => {
    return (
      <View
        className={`mb-6 ${item.role === "USER" ? "items-end" : "items-start"} `}
      >
        <Markdown style={markdownStyles(item.role === "USER")} rules={rules}>
          {item.text}
        </Markdown>
      </View>
    );
  }, []);

  const handleSelectIngredient = (selectedIngredient: Ingredient) => {
    setIngredientsSelected((prev) => {
      if (prev.includes(selectedIngredient)) {
        return prev.filter((ing) => ing.id !== selectedIngredient.id);
      }

      return [...prev, selectedIngredient];
    });
  };

  const handleNewChat = useCallback(() => {
    setMessage("");
    setIngredientsSelected([]);

    router.setParams({ chat_id: "" });

    setQuery(null);
    setRecipes([]);
  }, [setQuery, setRecipes, router]);

  /** HEADER PERSONALIZACIÓN */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ gap: 20 }} className="flex-row items-center">
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push(ROUTES.USER.CHAT_HISTORY)}
          >
            <Octicons name="history" size={20} color="#2F2F2F" />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => {
              handleNewChat();
            }}
          >
            <Svg width={26} height={26} viewBox="0 0 640 640">
              <Path
                fill="#2F2F2F"
                d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, router, handleNewChat]);

  console.log("RECIPES: ", JSON.stringify(recipes, null, 2));

  const reverted = useMemo(
    () => [...(chat?.messages || [])].reverse() as ChatSessionData[],
    [chat],
  );

  return (
    <SafeAreaView
      edges={["left", "right"]}
      style={{
        paddingTop: headerHeight,
        paddingHorizontal: insets.left + insets.right + 12,
      }}
      className="flex-1 bg-bg-semi-white"
    >
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
        behavior="padding"
        className="flex-col gap-y-4"
        style={{ flex: 1 }}
      >
        {isLoading || isFetching ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e5a657" />
          </View>
        ) : (
          <FlatList
            data={reverted}
            inverted={true}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom,
              flexGrow: 1,
            }}
            ListEmptyComponent={
              <View className="flex-1 items-start justify-center">
                <Text
                  style={{ fontSize: 20 }}
                  className="text-text-3 font-dosis-regular"
                >
                  Hola, {`${user?.name ? user.name : "Usuario"} `}
                </Text>
                <Text
                  style={{ fontSize: 28, maxWidth: "90%" }}
                  className="text-text-3 font-dosis-bold"
                >
                  ¿En qué puedo ayudarte hoy?
                </Text>
              </View>
            }
            ListHeaderComponent={
              isPending ? (
                <View className="items-center justify-start flex-row gap-x-4">
                  <ActivityIndicator size="small" color="#e5a657" />
                  <Text className="text-text-5 font-dosis-regular text-[14px]">
                    Pensando...
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        {/** INPUT */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            flexGrow: 0,
          }}
          contentContainerStyle={{
            gap: 4,
          }}
        >
          {ingredientsSelected.map((ingredient, index) => {
            if (index >= 4)
              return (
                <View
                  key={ingredient.id}
                  className="flex-row items-center justify-center gap-x-4 border border-bg-yellow rounded-full px-3 py-1.5"
                >
                  <Text className="text-text-3 font-dosis-regular text-[14px]">
                    +{ingredientsSelected.length - 4}
                  </Text>
                </View>
              );
            return (
              <View
                key={ingredient.id}
                className="flex-row items-center justify-center gap-x-4 border border-bg-yellow rounded-full px-3 py-1.5"
              >
                <Text className="text-text-3 font-dosis-regular text-[14px]">
                  {capitalize(ingredient.name)}
                </Text>
                <TouchableOpacity
                  onPress={() => handleSelectIngredient(ingredient)}
                  hitSlop={{
                    top: 10,
                    bottom: 10,
                    left: 10,
                    right: 10,
                  }}
                >
                  <Feather name="trash" size={16} color="#B53325" />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSubmit={handleSubmit}
          setOpenIngredients={setOpen}
          ingredientsRef={ingredientsRef}
          recipeRef={recipeRef}
        />
      </KeyboardAvoidingView>

      <BottomSheetModal
        ref={ingredientsRef}
        snapPoints={["80%"]}
        enablePanDownToClose={true}
        enableOverDrag={false}
        enableDynamicSizing={false}
        index={0}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        handleIndicatorStyle={{
          backgroundColor: "#2F2F2F",
          marginVertical: 10,
        }}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderColor: "#dbdbdb",
          borderWidth: 1,
          backgroundColor: "#fefefe",
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.4}
            pressBehavior="close"
          />
        )}
      >
        <IngredientsModal
          ingredients={ingredients || []}
          onSelectIngredient={handleSelectIngredient}
          isLoading={isLoadingIngredients || isFetchingIngredients}
          ingredientsIDs={ingredientsSelected}
        />
      </BottomSheetModal>
    </SafeAreaView>
  );
}

const markdownStyles = (isUser: boolean) => ({
  body: {
    fontFamily: "Dosis-Regular",
    fontSize: 15,
    color: "#4A4947",
    maxWidth: isUser ? "70%" : ("95%" as any),
    paddingHorizontal: isUser ? 16 : 0,
    paddingVertical: isUser ? 4 : 0,
    lineHeight: 28,
    borderRadius: isUser ? 15 : 0,
    borderWidth: isUser ? 1 : 0,
    borderColor: isUser ? "#dbdbdb" : "transparent",
  },
  strong: {
    fontFamily: "Dosis-Bold",
    fontWeight: "normal" as "normal",
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
});
