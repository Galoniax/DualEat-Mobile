import React from "react";
import { router, Tabs } from "expo-router";
import { HapticTab } from "@/components/layout/haptic-tab";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { DataItem } from "@/interface/global";
import { TopSearchBar } from "@/components/layout/TopSearchBar";

interface TabProps {
  data: DataItem[];
}

export default function Tab({ data }: TabProps) {
  const insets = useSafeAreaInsets();

  const TabStyle = {
    height: 65 + insets.bottom,
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
        tabBarIconStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 0,
        },
      }}
    >
      {data.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            headerShown: item.showHeader,
            headerTransparent: true,
            header: () => <TopSearchBar />,
            title: item.title,
            tabBarShowLabel: true,
            tabBarIcon: ({ color, focused }) => {
              const iconSize = 26;
              return focused && item.icons.focused
                ? item.icons.focused(color, iconSize)
                : item.icons.default(color, iconSize);
            },
            tabBarStyle: item.isTab ? TabStyle : { display: "none" },
          }}
          listeners={{
            tabPress: (e) => {
              if (item.redirect) {
                e.preventDefault();
                router.push(item.redirect as any);
              }
            },
          }}
        />
      ))}
    </Tabs>
  );
}
