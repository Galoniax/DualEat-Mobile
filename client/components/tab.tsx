import React from "react";
import { router, Tabs } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";

import { Colors } from "@/constants/theme";
import { DataItem } from "@/interface/global";

interface TabProps {
  data: DataItem[];
  children?: React.ReactNode;
}

export default function Tab({ data, children }: TabProps) {
  //const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
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
      {data.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ color, focused }) => {
              const iconSize = item.isLg ? 32 : 22;
              return focused && item.icons.focused
                ? item.icons.focused(color, iconSize)
                : item.icons.default(color, iconSize);
            },
            tabBarStyle: item.isTab
              ? { height: 120, paddingTop: 5 }
              : { display: "none" },
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