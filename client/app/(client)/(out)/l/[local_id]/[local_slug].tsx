import MenuInfo from "@/components/features/menu/MenuInfo";
import MenuReviews from "@/components/features/menu/MenuReviews";
import MenuView from "@/components/features/menu/MenuView";
import { ErrorType } from "@/components/ui/feedback/ErrorView";
import { useOrdering } from "@/context/cart/OrderingContext";
import { useLocation } from "@/context/extension/LocationContext";
import { Food, FoodCategory, Local } from "@/interface/global";
import { getLocalById } from "@/services/discovery.api";
import {
  calculateDistance,
  formatDistance,
  formatPrice,
} from "@/utils/distance";
import { isLocalOpen } from "@/utils/isLocalOpen";
import {
  AntDesign,
  Entypo,
  Feather,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export interface MenuFood extends Food {
  original_price: number;
  discount_pct_applied: number | null;
  ends_at?: string;
  sales_count?: number;
}

export interface MenuCategory extends Omit<FoodCategory, "foods"> {
  foods: MenuFood[];
}

export interface MenuLocal extends Omit<Local, "categories"> {
  categories?: MenuCategory[];
}

const MENU_BUTTONS = [
  {
    id: "Menu",
    label: "Menú del local",
    iconName: "list-outline",
  },
  {
    id: "Info",
    label: "Información del local",
    iconName: "information-circle-outline",
  },
  {
    id: "Reviews",
    label: "Leer opiniones",
    iconName: "star-outline",
  },
] as const;

export default function ClientLocalMenuScreen() {
  const router = useRouter();
  const { local_id } = useLocalSearchParams<{ local_id: string }>();

  const { location } = useLocation();
  const { items, open } = useOrdering();

  const [tab, setTab] = useState<"Menu" | "Info" | "Reviews">("Menu");

  const [isOpen, setIsOpen] = useState(() => {
    return local ? isLocalOpen(local.schedules || []) : false;
  });

  const refModal = useRef<BottomSheetModal>(null);

  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["25%"], []);

  const {
    data: local,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["local", "by-id", local_id],
    enabled: !!local_id,

    queryFn: async () => {
      try {
        const response = await getLocalById(local_id);
        if (response) {
          return response.data as MenuLocal;
        }
      } catch (err: any) {
        throw err.response.status as ErrorType;
      }
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 15,

    staleTime: 1000 * 60 * 15,
  });

  useEffect(() => {
    if (!local) return;

    setIsOpen(isLocalOpen(local.schedules || []));

    const intervalId = setInterval(() => {
      const currentlyOpen = isLocalOpen(local.schedules || []);

      setIsOpen((prevIsOpen) => {
        if (prevIsOpen !== currentlyOpen) {
          return currentlyOpen;
        }
        return prevIsOpen;
      });
    }, 60000);

    return () => clearInterval(intervalId);
  }, [local]);

  console.log(JSON.stringify(local, null, 2));

  const distance = useMemo(
    () =>
      calculateDistance(
        location?.coords.latitude || 0,
        location?.coords.longitude || 0,
        local?.latitude || 0,
        local?.longitude || 0,
      ),
    [location, local],
  );

  const views: Record<"Menu" | "Info" | "Reviews", JSX.Element> = {
    Menu: <MenuView local={local as MenuLocal} insets={insets} />,
    Info: <MenuInfo local={local as MenuLocal} insets={insets} />,
    Reviews: <MenuReviews local={local as MenuLocal} insets={insets} />,
  };

  useFocusEffect(
    useCallback(() => {
      refetch();

      return () => {
        refModal.current?.dismiss();
      };
    }, [refetch]),
  );

  if (isError) {
    return null;
  }

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      className="flex-1 bg-bg-semi-white"
    >
      {/* HEADER */}
      <View
        style={{
          borderBottomRightRadius: !isOpen ? 0 : 20,
          borderBottomLeftRadius: !isOpen ? 0 : 20,
        }}
        className="relative h-[250px] overflow-hidden flex-col justify-between"
      >
        <ImageBackground
          className="absolute top-0 left-0 right-0 w-full h-[100%]"
          resizeMode="cover"
          source={{ uri: local?.image_url || undefined }}
        >
          <View className="flex-1 bg-black/50" />
        </ImageBackground>

        {/** CONTENIDO DEL HEADER */}
        <View
          className="flex-row justify-between items-center px-4"
          style={{
            paddingTop: insets.top,
            paddingHorizontal: insets.right + insets.left + 10,
          }}
        >
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
            }}
            onPress={() => router.back()}
            className="justify-center items-center rounded-full"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Entypo name="chevron-thin-left" size={18} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
            }}
            onPress={() => refModal.current?.present()}
            className="rounded-full justify-center items-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Entypo name="dots-three-vertical" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* CONTENIDO DEL LOCAL */}
        <View className="flex-row flex-1 justify-between items-end">
          <View className="flex-col px-6 pb-6 gap-y-1">
            <Text
              style={{ fontSize: 14 }}
              className="font-dosis-light text-text-2 tracking-wide"
            >
              {local?.type_local}
            </Text>

            <Text
              style={{ fontSize: 28 }}
              className="font-dosis-bold text-text-1 tracking-wider"
            >
              {local?.name}
            </Text>

            <View className="flex-row items-center gap-x-1 mt-2">
              <AntDesign name="star" size={16} color="#e5a657" />
              <Text
                style={{ fontSize: 12 }}
                className="font-dosis-bold text-text-1 tracking-wide"
              >
                {local?.average_rating === 0
                  ? "N/A"
                  : local?.average_rating?.toFixed(1)}
              </Text>
            </View>
          </View>

          <View className="flex-col items-end justify-end px-6 pb-6">
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
              }}
              onPress={() => console.log("share")}
              className="rounded-full justify-center items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Entypo name="share" size={18} color="#fff" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-x-2 mt-2">
              <FontAwesome5 name="walking" size={12} color="#dbdbdb" />
              <Text
                style={{ fontSize: 14 }}
                className="font-dosis-regular text-text-2 tracking-tighter"
              >
                {formatDistance(distance)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* NOTA DE ABIERTO/CERRADO */}
      {!isOpen && (
        <View
          style={{
            paddingVertical: 2,
            paddingHorizontal: 10,
          }}
          className={`border border-[#B53325] mt-3 mx-4 py-2`}
        >
          <Text
            className={`text-[12px] text-bg-red text-center font-dosis-bold`}
          >
            Cerrado
          </Text>
        </View>
      )}

      {/* VISTAS */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#B53325" />
        </View>
      ) : (
        views[tab]
      )}

      {/* MODAL */}
      <BottomSheetModal
        ref={refModal}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: "#fff",
        }}
        enableOverDrag={false}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
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
        <BottomSheetView
          style={{
            paddingHorizontal: insets.right + insets.left + 20,
            paddingBottom: insets.bottom + 10,
            paddingTop: insets.top - 10,
          }}
          className="flex-col gap-y-6"
        >
          {MENU_BUTTONS.map((button) => (
            <TouchableOpacity
              key={button.id}
              className="flex-row items-center justify-between"
              onPress={() => {
                setTab(button.id);
                refModal.current?.dismiss();
              }}
            >
              <View className="flex-row gap-4 items-center">
                <Ionicons name={button.iconName} size={14} color="#707070" />

                <Text className="text-text-3 text-[14px] font-dosis-medium">
                  {button.label}
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color="#333333" />
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheetModal>

      {/* CARRITO */}
      {items.length > 0 && items[0].local.id === local?.id && (
        <View
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 16,
            borderTopWidth: 1,
            borderTopColor: "#dbdbdb",
            width: "100%",
          }}
          className="bg-bg-semi-white flex-row items-center justify-center"
        >
          <View className="flex-col gap-0.5 flex-1 items-start">
            <Text className="text-text-5 text-[13.5px] font-dosis-regular">
              {items.reduce((acc, item) => acc + item.quantity, 0)}{" "}
              {items.reduce((acc, item) => acc + item.quantity, 0) === 1
                ? "producto"
                : "productos"}
            </Text>
            <Text className="text-text-3 text-[17px] font-dosis-bold">
              {formatPrice(
                items.reduce(
                  (acc, item) => acc + item.unit_price * item.quantity,
                  0,
                ),
              )}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => open()}
            style={{ flex: 3 }}
            className="bg-bg-red py-2.5 rounded-[8px] items-center"
          >
            <Text className="text-white font-dosis-bold text-[14px]">
              Ver carrito
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
