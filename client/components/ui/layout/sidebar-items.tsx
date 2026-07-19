import { ROUTES } from "@/constants/constants";
import { useOrdering } from "@/context/cart/OrderingContext";
import { CommunityMember } from "@/interface/global";
import { Ionicons } from "@expo/vector-icons";
import { Href, Router } from "expo-router";
import { JSX, useMemo, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Path, Svg } from "react-native-svg";

export const SidebarItem = ({
  icon,
  label,
  onPress,
  isExpanded,
  extra,
}: {
  icon: JSX.Element;
  label: string;
  onPress?: () => void;
  isExpanded?: boolean | null;
  extra?: JSX.Element | null;
}) => (
  <View className="flex-row justify-between">
    <TouchableOpacity
      className={`flex-row flex-1 items-center ${onPress ? "justify-between" : ""} py-2`}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-x-4">
        {icon}
        <Text className="font-outfit-bold text-base text-text-3">{label}</Text>
      </View>
      {isExpanded !== null && (
        <Ionicons
          name={isExpanded ? "chevron-up-outline" : "chevron-down-outline"}
          size={17}
          color="#333"
        />
      )}
    </TouchableOpacity>
    {extra}
  </View>
);

export const UserSidebarItems = ({
  mode,
  handlePress,
  communities,
  router,
  props,
}: {
  mode: "out" | "in" | null;
  handlePress: (route: Href) => void;
  communities: CommunityMember[];
  router: Router;
  props: any;
}) => {
  const { open, items } = useOrdering();

  const [expanded, setExpanded] = useState({
    comunity: false,
    chat: false,
  });

  const size = 22;

  return useMemo(() => {
    if (!mode) return <></>;

    if (mode === "out") {
      return (
        <>
          <SidebarItem
            isExpanded={null}
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/shopping-cart--v1.png",
                }}
                style={{ width: size, height: size, tintColor: "#4A4947" }}
              />
            }
            onPress={() => {
              props.navigation.closeDrawer();
              setTimeout(() => {
                open();
              }, 300);
            }}
            label="Carrito"
            extra={
              items.length > 0 ? (
                <View className="bg-bg-red rounded-full items-center justify-center self-center">
                  <Text className="text-text-1 font-outfit-bold text-[10px] px-2 py-0.5">
                    {items.length}
                  </Text>
                </View>
              ) : null
            }
          />

          <SidebarItem
            isExpanded={null}
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M576 112C576 103.7 571.7 96 564.7 91.6C557.7 87.2 548.8 86.8 541.4 90.5L416.5 152.1L244 93.4C230.3 88.7 215.3 89.6 202.1 95.7L77.8 154.3C69.4 158.2 64 166.7 64 176L64 528C64 536.2 68.2 543.9 75.1 548.3C82 552.7 90.7 553.2 98.2 549.7L225.5 489.8L396.2 546.7C409.9 551.3 424.7 550.4 437.8 544.2L562.2 485.7C570.6 481.7 576 473.3 576 464L576 112zM208 146.1L208 445.1L112 490.3L112 191.3L208 146.1zM256 449.4L256 148.3L384 191.8L384 492.1L256 449.4zM432 198L528 150.6L528 448.8L432 494L432 198z"
                />
              </Svg>
            }
            onPress={() => {
              handlePress(ROUTES.USER.MAPS);
            }}
            label="Mapa"
          />

          <SidebarItem
            isExpanded={null}
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/qr-code--v1.png",
                }}
                style={{ width: size, height: size, tintColor: "#4A4947" }}
              />
            }
            onPress={() => {
              handlePress(ROUTES.USER.QR);
            }}
            label="Escanear QR"
          />

          <SidebarItem
            isExpanded={null}
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/receipt.png",
                }}
                style={{ width: size, height: size, tintColor: "#4A4947" }}
              />
            }
            onPress={() => {
              handlePress(ROUTES.USER.ORDERS);
            }}
            label="Órdenes"
          />
        </>
      );
    } else {
      return (
        <>
          <SidebarItem
            isExpanded={null}
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"
                />
              </Svg>
            }
            label="Explorar"
            onPress={() => {
              handlePress(ROUTES.USER.EXPLORE);
            }}
          />
          <SidebarItem
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z"
                />
              </Svg>
            }
            label="Crear Comunidad"
            onPress={() => router.push(ROUTES.USER.CREATE_COMMUNITY)}
            isExpanded={null}
          />

          <SidebarItem
            icon={
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/conference-call--v1.png",
                }}
                style={{ width: size, height: size, tintColor: "#4A4947" }}
              />
            }
            label="Comunidades"
            onPress={() =>
              setExpanded({ ...expanded, comunity: !expanded.comunity })
            }
            isExpanded={expanded.comunity}
          />

          {expanded.comunity &&
            (communities && communities.length > 0 ? (
              <View className="pb-2 flex-col gap-y-3">
                {communities.map((item: CommunityMember) => (
                  <TouchableOpacity
                    key={item.community.id}
                    onPress={() => {
                      router.push({
                        pathname: ROUTES.USER.COMMUNITY,
                        params: {
                          community_slug: item.community.slug || "",
                        },
                      });
                      props.navigation.closeDrawer();
                    }}
                    className="flex-row items-center py-2"
                  >
                    {/* Avatar */}
                    <Image
                      source={{ uri: item.community.image_url }}
                      className="w-6 h-6 rounded-full mr-3"
                    />

                    {/* Community Info */}
                    <View className="flex-1">
                      <Text
                        className="font-outfit-light text-sm text-text-4 truncate"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.community.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="pb-2 flex-row justify-center">
                <Text className="text-text-4 text-base font-outfit-light">
                  No tienes comunidades
                </Text>
              </View>
            ))}

          <SidebarItem
            icon={
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={"#4A4947"}
                  d="M115.9 448.9C83.3 408.6 64 358.4 64 304C64 171.5 178.6 64 320 64C461.4 64 576 171.5 576 304C576 436.5 461.4 544 320 544C283.5 544 248.8 536.8 217.4 524L101 573.9C97.3 575.5 93.5 576 89.5 576C75.4 576 64 564.6 64 550.5C64 546.2 65.1 542 67.1 538.3L115.9 448.9zM153.2 418.7C165.4 433.8 167.3 454.8 158 471.9L140 505L198.5 479.9C210.3 474.8 223.7 474.7 235.6 479.6C261.3 490.1 289.8 496 319.9 496C437.7 496 527.9 407.2 527.9 304C527.9 200.8 437.8 112 320 112C202.2 112 112 200.8 112 304C112 346.8 127.1 386.4 153.2 418.7z"
                />
              </Svg>
            }
            label="Chats"
            onPress={() => setExpanded({ ...expanded, chat: !expanded.chat })}
            isExpanded={expanded.chat}
          />
        </>
      );
    }
  }, [
    mode,
    handlePress,
    expanded,
    communities,
    props.navigation,
    router,
    open,
    items.length,
  ]);
};
