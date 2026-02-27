import { useLocalSearchParams, useRouter } from "expo-router";
import MenuScreen from "@/components/menu/MenuScreen";
import { useAuth } from "@/context/auth/AuthContext";
import { useEffect } from "react";

export default function ClientLocalMenuScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!slug) {
      router.back();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!slug) {
    return null; 
  }

  return <MenuScreen user={user} slug={slug} />;
}
