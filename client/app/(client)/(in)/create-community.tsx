import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { JSX, useState } from "react";
import {
  CommunityDTO,
  UploadPayload,
  UploadableFile,
} from "@/interface/global.dto";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { create, upload } from "@/services/community.api";
import StepOne from "@/components/features/create/community/StepOne";
import StepTwo from "@/components/features/create/community/StepTwo";
import StepThree from "@/components/features/create/community/StepThree";
import { globalToast as toast } from "@/utils/toast";

export default function CreateCommunityScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [community, setCommunity] = useState<CommunityDTO>({
    name: "",
    description: "",
    image_url: "",
    banner_url: "",
    tags: [] as string[],
  });

  const handleNext = async () => {
    if (step !== 3) setStep((prev) => prev + 1);

    if (
      step === 3 &&
      community.tags.length > 0 &&
      community.name.trim().length > 0 &&
      community.description.trim().length > 0 &&
      community.image_url &&
      community.banner_url
    ) {
      try {
        setIsLoadingSubmit(true);

        const payload: UploadPayload = {
          image_url: community.image_url as UploadableFile,
          banner_url: community.banner_url as UploadableFile,
        };

        const responseUpload = await upload(payload);

        if (!responseUpload?.success || !responseUpload?.data) {
          throw new Error("Error al subir las imágenes de la comunidad");
        }

        const urls = responseUpload.data;

        const payloadCommunity: CommunityDTO = {
          name: community.name,
          description: community.description,
          tags: community.tags,
          image_url: urls.image_url as string,
          banner_url: urls.banner_url as string,
        };

        const responseCreate = await create(payloadCommunity);

        if (!responseCreate?.success || !responseCreate?.data) {
          throw new Error("Error al crear la comunidad");
        }

        toast.success("Comunidad creada", "Comunidad creada correctamente");
        router.back();
      } catch (err: any) {
        toast.error(
          err.message || "Error al crear la comunidad",
          "La comunidad no se pudo crear, intentalo de nuevo",
        );
      } finally {
        setIsLoadingSubmit(false);
      }
    }
  };

  const handleBack = () => {
    if (step !== 1) setStep((prev) => prev - 1);
    if (step === 1) router.back();
  };

  const variables: Record<number, JSX.Element> = {
    1: <StepOne community={community} setCommunity={setCommunity} />,

    2: <StepTwo community={community} setCommunity={setCommunity} />,

    3: <StepThree community={community} setCommunity={setCommunity} />,
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "top", "right"]}
      className="flex-1 bg-bg-semi-white "
    >
      <View className="flex-row items-center justify-between w-full px-5 py-4">
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={handleBack}
            className="h-10 w-10 flex items-center justify-center"
          >
            <Feather name="arrow-left" size={24} color="#2F2F2F" />
          </TouchableOpacity>
          <Text className="font-outfit-bold text-[16px] text-text-3">{`${step} de 3`}</Text>
        </View>

        <TouchableOpacity
          disabled={
            community.tags.length < 3 ||
            (step === 2 &&
              (community.name.length < 1 ||
                community.description.length < 10)) ||
            isLoadingSubmit
          }
          style={{ minWidth: step === 3 ? 150 : 0 }}
          className="bg-bg-gray py-2 px-4 rounded-full"
          onPress={handleNext}
        >
          {isLoadingSubmit ? (
            <ActivityIndicator size={18} color="#2F2F2F" className="py-1" />
          ) : (
            <Text className="font-outfit-bold text-[16px] text-center text-text-5">
              {step !== 3 ? "Siguiente" : "Crear comunidad"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {variables[step]}
    </SafeAreaView>
  );
}
