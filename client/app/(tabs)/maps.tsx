import {
  Text,
  View,
  TextInput,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import * as Location from 'expo-location';

import Octicons from "@expo/vector-icons/Octicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);

  let text = "Esperando ubicación...";

  if (errorMsg) {
    text = errorMsg;
  } else if (address) {
    text = `${address.street}, ${address.city}.`;
  } else if (location) {
    text = "Obteniendo dirección...";
  }

    useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      if (location) {
        try {
          const addressResponse = await Location.reverseGeocodeAsync(
            location.coords
          );

          if (addressResponse && addressResponse.length > 0) {
            setAddress(addressResponse[0]);
          }
        } catch (error) {
          setErrorMsg("No se pudo traducir la ubicación");
          console.error(error);
        }
      }
    }

    getCurrentLocation();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ImageBackground
        source={require("../../assets/images/BGDash-Mini.png")}
        className="absolute inset-0 opacity-20"
        resizeMode="cover"
      />

      <View className="flex-1 px-4 pt-3 z-[2]">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity className="p-3 border bg-bg-yellow border-bg-yellow rounded-[10px]">
            <MaterialCommunityIcons
              name="toggle-switch"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          <View className="flex-row gap-4">
            <TouchableOpacity className="p-3 border bg-bg-red border-bg-red rounded-[10px]">
              <Octicons name="bell-fill" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity className="p-3 border border-text-5 rounded-[10px]">
              <Octicons name="bell-fill" size={16} color="#707070" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mt-10">
          <Text className="text-text-5 text-[18px] font-dosis-regular">
            Mapa
          </Text>
          <Text className="text-text-3 text-[20px] font-dosis-bold">
            {text}
          </Text>
        </View>

        <TextInput
          className="bg-white border border-text-3 rounded-[5px] p-4 mt-8"
          placeholder="Buscar rrlocales y productos"
          placeholderTextColor="#6B7280"
        />

        {/* <View className="mt-12">
          <Text className="text-text-5 text-[24px] font-dosis-bold">
            Recomendaciones
          </Text>
        </View> */}

        <View className="mt-12">
          <Text className="text-text-3 text-[28px] font-dosis-bold">
            Explorar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}