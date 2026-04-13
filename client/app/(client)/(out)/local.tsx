import { useLocalSearchParams, useRouter } from "expo-router";
import MenuScreen from "@/components/features/menu/MenuScreen";
import { useEffect } from "react";
import { showToast } from "@/utils/toast";
import { useRedirecter } from "@/hooks/router/useRedirecter";

export default function ClientLocalMenuScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  //const { user } = useAuth();

  const { redirect } = useRedirecter();
  const router = useRouter();

  console.log(slug);
  useEffect(() => {
    if (!slug) {
      if (router.canGoBack()) {
        showToast("error", "No se pudo obtener el local");
        router.back();
      } else {
        redirect();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!slug) {
    return null;
  }

  return <MenuScreen slug={slug} />;
}
