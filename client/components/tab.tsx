import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Tabs } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";

import { Colors } from "@/constants/theme";
import { DataItem } from "@/interface/global";

interface TabProps {
  data: DataItem[];
}

export default function Tab({ data }: TabProps) {
  const colorScheme = useColorScheme();

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
      {data.map((item: DataItem) => {
        return (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
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