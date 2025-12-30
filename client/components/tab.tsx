import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Tabs } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";

import { Colors } from "@/constants/theme";
import { JSX } from "react/jsx-runtime";

interface TabProps {
  data: DataItem[];
}

interface DataItem {
  name: string;
  title: string;
  icons: {
    default: (color: string, size: number) => JSX.Element;
    focused?: (color: string, size: number) => JSX.Element;
  };
  isLg?: boolean;
}

// Tab Component -- (export default function Tab(data: DataItem[]))
export default function Tab({ data }: TabProps) {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarIconStyle: { marginTop: 5, marginBottom: 1 },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          fontFamily: "Dosis-Bold",
          marginBottom: 8,
        },

        tabBarStyle: { height: 120, paddingTop: 5 },
      }}
    >
      {data.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name.toString()}
          options={{
            title: item.title,
            tabBarIcon: ({ color, size, focused }) =>
              focused && item.icons.focused
                ? item.icons.focused(color, size)
                : item.icons.default(
                    color,
                    (size = item.isLg ? 32 : (size = 22))
                  ),
          }}
        />
      ))}
    </Tabs>
  );
}
