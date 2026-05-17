import React from "react";
import { Image } from "react-native";
import Svg, { Path } from "react-native-svg";

import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { HapticTab } from "@/components/layout/haptic-tab";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  const TabStyle = {
    height: 60 + insets.bottom,
    paddingBottom: insets.bottom + 4,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    backgroundColor: "#fefefe",
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarButton: HapticTab,
        tabBarStyle: TabStyle,
        headerTransparent: true,
        header: (props) => <TopSearchBar {...props} />,
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
        },
      }}
    >
      {/* ---------------- PESTAÑA: INICIO ---------------- */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: true,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Image
                source={{
                  uri: "https://img.icons8.com/?size=100&id=1iF9PyJ2Thzo&format=png",
                }}
                style={{ width: size, height: size, tintColor: color }}
              />
            ) : (
              <Image
                source={{
                  uri: "https://img.icons8.com/?size=100&id=i6fZC6wuprSu&format=png",
                }}
                style={{ width: size, height: size, tintColor: color }}
              />
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: MAPS ---------------- */}
      <Tabs.Screen
        name="maps"
        options={{
          title: "Mapa",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M576 112C576 100.9 570.3 90.6 560.8 84.8C551.3 79 539.6 78.4 529.7 83.4L413.5 141.5L234.1 81.6C226 78.9 217.3 79.5 209.7 83.3L81.7 147.3C70.8 152.8 64 163.9 64 176L64 528C64 539.1 69.7 549.4 79.2 555.2C88.7 561 100.4 561.6 110.3 556.6L226.4 498.5L405.8 558.3C413.9 561 422.6 560.4 430.2 556.6L558.2 492.6C569 487.2 575.9 476.1 575.9 464L575.9 112zM256 440.9L256 156.4L384 199.1L384 483.6L256 440.9z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M576 112C576 103.7 571.7 96 564.7 91.6C557.7 87.2 548.8 86.8 541.4 90.5L416.5 152.1L244 93.4C230.3 88.7 215.3 89.6 202.1 95.7L77.8 154.3C69.4 158.2 64 166.7 64 176L64 528C64 536.2 68.2 543.9 75.1 548.3C82 552.7 90.7 553.2 98.2 549.7L225.5 489.8L396.2 546.7C409.9 551.3 424.7 550.4 437.8 544.2L562.2 485.7C570.6 481.7 576 473.3 576 464L576 112zM208 146.1L208 445.1L112 490.3L112 191.3L208 146.1zM256 449.4L256 148.3L384 191.8L384 492.1L256 449.4zM432 198L528 150.6L528 448.8L432 494L432 198z"
                />
              </Svg>
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: QR ---------------- */}
      <Tabs.Screen
        name="qr"
        options={{
          title: "QR",
          tabBarStyle: { display: "none" },
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color }) => {
            const size = 32;
            return (
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/qr-code--v1.png",
                }}
                style={{ width: size, height: size, tintColor: color }}
              />
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: ÓRDENES ---------------- */}
      <Tabs.Screen
        name="orders"
        options={{
          title: "Pedidos",
          headerShown: true,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-filled/48/receipt.png",
                }}
                style={{ width: size, height: size, tintColor: color }}
              />
            ) : (
              <Image
                source={{
                  uri: "https://img.icons8.com/fluency-systems-regular/48/receipt.png",
                }}
                style={{ width: size, height: size, tintColor: color }}
              />
            );
          },
        }}
      />

      {/* ---------------- PESTAÑA: PERFIL ---------------- */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, focused }) => {
            const size = 24;
            return focused ? (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z"
                />
              </Svg>
            ) : (
              <Svg width={size} height={size} viewBox="0 0 640 640">
                <Path
                  fill={color}
                  d="M240 192C240 147.8 275.8 112 320 112C364.2 112 400 147.8 400 192C400 236.2 364.2 272 320 272C275.8 272 240 236.2 240 192zM448 192C448 121.3 390.7 64 320 64C249.3 64 192 121.3 192 192C192 262.7 249.3 320 320 320C390.7 320 448 262.7 448 192zM144 544C144 473.3 201.3 416 272 416L368 416C438.7 416 496 473.3 496 544L496 552C496 565.3 506.7 576 520 576C533.3 576 544 565.3 544 552L544 544C544 446.8 465.2 368 368 368L272 368C174.8 368 96 446.8 96 544L96 552C96 565.3 106.7 576 120 576C133.3 576 144 565.3 144 552L144 544z"
                />
              </Svg>
            );
          },
        }}
      />
    </Tabs>
  );
}
