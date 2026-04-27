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

  const { options } = props;

  const title =
    options.headerTitle !== undefined ? options.headerTitle : options.title;
  const RightActions = options.headerRight;

  return (
    <View
      style={{
        paddingTop: Platform.OS === "ios" ? 50 : 46,
        paddingBottom: 10,
      }}
      className="flex-row px-5 items-center justify-between"
    >
      {/* --- IZQUIERDA: Perfil --- */}
      <TouchableOpacity onPress={handleMenuPress} style={{ zIndex: 10 }}>
        <Image
          source={{ uri: user?.avatar_url }}
          className="w-[28px] h-[28px] rounded-full bg-gray-200"
        />
      </TouchableOpacity>

      {/* --- CENTRO: Título Dinámico --- */}
      <View
        pointerEvents="none"
        className="flex-1 items-center"
       
        
      >
        {typeof title === "string" ? (
          <Text className="font-dosis-bold text-[16px] text-text-3">{title}</Text>
        ) : typeof title === "function" ? (
          title({ children: "", tintColor: "#333" })
        ) : null}
      </View>

      {/* --- DERECHA: Botones Dinámicos --- */}
      <View style={{ zIndex: 10 }}>
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
