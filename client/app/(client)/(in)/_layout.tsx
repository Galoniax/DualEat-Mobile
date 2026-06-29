import { Stack } from "expo-router";

export default function InStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)" />
      
      <Stack.Screen name="c/[community_slug]" />
      <Stack.Screen name="p/[post_id]/[post_slug]" />
      <Stack.Screen name="r/[recipe_id]/[recipe_slug]" />

      <Stack.Screen name="create-community" />
    </Stack>
  );
}
