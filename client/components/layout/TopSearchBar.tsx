import { View, Text, TouchableOpacity, Platform, Image } from "react-native";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useAuth } from "@/context/auth/AuthContext";

export const TopSearchBar = (props: any) => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleMenuPress = () => {
    if (!user) return;
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const options = props?.options || {};
  const title = options?.title || "";

  const RightActions = options?.headerRight || null;

  return (
    <View
      style={{
        paddingTop: Platform.OS === "ios" ? 50 : 46,
        paddingBottom: 10,
        zIndex: 10
      }}
      className="flex-row px-4 items-center justify-between"
    >
      {/* --- IZQUIERDA: Perfil --- */}
      <TouchableOpacity onPress={handleMenuPress}>
        <Image
          source={{ uri: user?.avatar_url }}
          className="w-[32px] h-[32px] rounded-full bg-gray-200"
        />
      </TouchableOpacity>

      {/* --- CENTRO: Título Dinámico --- */}
      <View pointerEvents="none" className="flex-1 items-center">
        {typeof title === "string" ? (
          <Text className="font-dosis-bold text-[15px] text-text-3">
            {title}
          </Text>
        ) : null}
      </View>

      {/* --- DERECHA: Botones Dinámicos --- */}
      <View>
        {RightActions ? (
          RightActions({
            tintColor: "#333",
            canGoBack: navigation.canGoBack(),
          })
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>
    </View>
  );
};
