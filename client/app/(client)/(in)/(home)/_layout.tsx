import { Drawer } from "expo-router/drawer";
import { CustomSidebar } from "@/components/layout/CustomSidebar";

export default function HomeInDrawerLayout() {
  return (
    <Drawer
      drawerContent={(props: any) => <CustomSidebar {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ swipeEdgeWidth: 0 }} />
    </Drawer>
  );
}
