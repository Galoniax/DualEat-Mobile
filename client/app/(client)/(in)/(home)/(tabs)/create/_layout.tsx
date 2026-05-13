import { Stack } from "expo-router";

export default function CreateStackLayout() {
  return (
    <Stack
      screenOptions={{
        animation: "fade_from_bottom",
        headerShown: false,
        presentation: "card",
        gestureEnabled: true,
        gestureDirection: "vertical",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Crear",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recipe"
        options={{
          title: "Crear Receta",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
