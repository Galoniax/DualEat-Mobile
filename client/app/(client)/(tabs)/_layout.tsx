import React from "react";
import { Image } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Tabs } from "expo-router";

import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useAppMode } from "@/context/app/AppModeContext";

type AppMode = "eatIn" | "eatOut";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { mode } = useAppMode();

  const tabs = [
    {
      name: "index",
      title: "Home",
      modes: ["eatIn", "eatOut"] as AppMode[],
      isLg: false,
      icons: {
        default: (color: string, size: number) => (
          <Svg width={size} height={size} viewBox="0 0 48 48">
            <Path
              fill={color}
              d="M23.95 4L8.86 15.52A7.5 7.5 0 0 0 6 21.41V40.5A2.5 2.5 0 0 0 8.5 43h10A2.5 2.5 0 0 0 21 40.5v-10a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v10A2.5 2.5 0 0 0 29.5 43h10A2.5 2.5 0 0 0 42 40.5V21.41a7.5 7.5 0 0 0-2.86-5.89L24.93 4a1.5 1.5 0 0 0-.98 0Z"
            />
          </Svg>
        ),
        focused: (color: string, size: number) => (
          <Svg width={size} height={size} viewBox="0 0 48 48">
            <Path
              fill={color}
              d="M39.5 43h-9a2.5 2.5 0 0 1-2.5-2.5v-9a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v9A2.5 2.5 0 0 1 17.5 43h-9A2.5 2.5 0 0 1 6 40.5V21.41a7.5 7.5 0 0 1 2.86-5.89L23.07 4.32a1.5 1.5 0 0 1 1.86 0L39.14 15.52A7.5 7.5 0 0 1 42 21.41V40.5A2.5 2.5 0 0 1 39.5 43Z"
            />
          </Svg>
        ),
      },
    },
    {
      name: "maps",
      title: "Maps",
      modes: ["eatOut"] as AppMode[],
      isLg: false,
      icons: {
        default: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/material-outlined/24/map-marker.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        focused: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/material/24/map-marker--v1.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      },
    },
    {
      name: "qr",
      title: "QR",
      modes: ["eatOut"] as AppMode[],
      isLg: true,
      icons: {
        default: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/windows/32/qr-code.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      },
    },
    {
      name: "orders",
      title: "Pedidos",
      modes: ["eatOut"] as AppMode[],
      isLg: false,
      icons: {
        default: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/material-outlined/50/purchase-order.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        focused: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/material/24/purchase-order--v1.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      },
    },
    {
      name: "profile",
      title: "Profile",
      modes: ["eatOut"] as AppMode[],
      isLg: false,
      icons: {
        default: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/fluency-systems-regular/48/name.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        focused: (color: string, size: number) => (
          <Image
            source={{ uri: "https://img.icons8.com/fluency-systems-filled/48/name.png" }}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
      },
    },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { height: 120, paddingTop: 5 },
        tabBarIconStyle: { marginTop: 5 },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Dosis-Bold",
          marginBottom: 8,
        },
      }}
    >
      {tabs.map((item) => {
        const visible = item.modes.includes(mode);

        return (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,

              href: visible ? undefined : null,

              tabBarItemStyle: {
                display: visible ? "flex" : "none",
              },

              tabBarIcon: ({ color, size, focused }) => {
                const iconSize = item.isLg ? 32 : 22;

                if (focused && item.icons.focused) {
                  return item.icons.focused(color, iconSize);
                }

                return item.icons.default(color, iconSize);
              },
            }}
          />
        );
      })}
    </Tabs>
  );
}
