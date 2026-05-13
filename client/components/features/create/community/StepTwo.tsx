import { CommunityDTO } from "@/interface/global.dto";
import { Text, TextInput, View } from "react-native";

interface StepProps {
  community: CommunityDTO;
  setCommunity: React.Dispatch<React.SetStateAction<CommunityDTO>>;
}

export default function StepTwo({ community, setCommunity }: StepProps) {
  return (
    <View className="flex-col flex-1 px-5 py-4 gap-y-6">
      <Text className="font-dosis-bold text-[22px] text-text-3">
        Cuéntanos sobre tu comunidad
      </Text>
      <Text className="font-dosis-regular text-[16px] text-text-5 leading-7">
        Danos un nombre y una descripción para tu comunidad. Cuanto más
        detallada sea la descripción, mejor podrán entender los usuarios de qué
        se trata tu comunidad.
      </Text>

      <View className="flex-col gap-y-6">
        {/** Input nombre de la comunidad  */}
        <View className="flex-row items-center gap-x-2">
          <TextInput
            value={community.name}
            maxLength={28}
            onChangeText={(text) => setCommunity({ ...community, name: text })}
            enterKeyHint="next"
            placeholder="Nombre de la comunidad"
            placeholderTextColor={"#4A4947"}
            className="font-dosis-regular flex-1 text-[16px] text-text-3 border border-gray-200 rounded-lg px-4 py-3"
          />

          <Text
            className={`font-dosis-regular text-[12px] ${community.name.length > 28 ? "text-text-6" : "text-text-5"}`}
          >
            {28 - community.name.length}
          </Text>
        </View>

        {/** Input descripción de la comunidad */}
        <View className="flex-row items-center gap-x-2">
          <TextInput
            value={community.description}
            maxLength={500}
            multiline={true}
            numberOfLines={4}
            onChangeText={(text) =>
              setCommunity({ ...community, description: text })
            }
            enterKeyHint="next"
            placeholder="Descripción"
            placeholderTextColor={"#4A4947"}
            className="font-dosis-regular flex-1 text-[16px] text-text-3 border border-gray-200 rounded-lg px-4 py-3"
          />
          <Text
            className={`font-dosis-regular text-[12px] ${community.description.length > 500 ? "text-text-6" : "text-text-5"}`}
          >
            {500 - community.description.length}
          </Text>
        </View>
      </View>
    </View>
  );
}
