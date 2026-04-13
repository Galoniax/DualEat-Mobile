import { Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import { MenuLocal } from "./MenuScreen";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { mapStyle } from "@/constants/constants";
import React, { useState } from "react";
import { normalize } from "@/utils/normalize";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";

interface MenuInfoProps {
  local: MenuLocal;
  insets: any;
}

function MenuInfo({ local, insets }: MenuInfoProps) {
  const lat = Number(local.latitude) || 0;
  const lng = Number(local.longitude) || 0;

  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  const states = {
    horarios: false,
    descripcion: false,
  };

  const [state, setState] = useState(states);

  const now = days[new Date().getDay()];

  const handleOpenMap = () => {
    const label = encodeURI(local.name);

    const url = Platform.select({
      ios: `maps:${lat},${lng}?q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          );
        }
      });
    }
  };

  const handleSchedule = (day: string) => {
    const schedule = local.schedules?.find(
      (schedule) => normalize(schedule.day_of_week) === normalize(day),
    );

    if (!schedule) {
      return "Cerrado";
    }

    return schedule?.open_time + " a " + schedule?.close_time + " hs";
  };

  const todaySchedule = handleSchedule(now);

  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <View className="h-[280px] w-full rounded-[14px] overflow-hidden border border-gray-200">
        <MapView
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={false}
          showsMyLocationButton={false}
          customMapStyle={mapStyle}
          zoomControlEnabled={true}
          zoomTapEnabled={true}
          showsCompass={true}
          minZoomLevel={11}
          maxZoomLevel={18}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={true}
          zoomEnabled={true}
        >
          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            title={local.name}
            description={local.address}
          />
        </MapView>
      </View>

      {/* INFORMACIÓN */}
      <View className="flex-col gap-2 px-4">
        <View className="flex-row items-center justify-between mt-4 mb-6">
          <View className="flex-row items-center gap-2 flex-1">
            <Text
              className="text-text-3 text-[19px] font-dosis-bold"
              numberOfLines={2}
            >
              {local.address}
            </Text>
          </View>

          <TouchableOpacity onPress={handleOpenMap}>
            <Text className="text-[14px] font-dosis-bold text-black">
              Abrir mapa
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* HORARIOS */}
      <View className="flex-col px-4 mb-6 mt-4">
        <TouchableOpacity
          onPress={() => setState({ ...state, horarios: !state.horarios })}
          className="flex-col items-start w-full relative"
        >
          <Text
            className="text-text-3 text-[16px] font-dosis-bold"
            numberOfLines={2}
          >
            Horarios
          </Text>
          <Ionicons
            className="absolute right-0 top-1/2"
            name={state.horarios ? "chevron-up" : "chevron-down"}
            size={18}
            color="black"
          />

          <Text className="text-text-5 text-[15px] font-dosis-regular">
            Hoy · {todaySchedule}
          </Text>
        </TouchableOpacity>

        {state.horarios && (
          <View className="flex-col gap-3 mt-6">
            {days.map((day) => (
              <View key={day} className="flex-row items-center justify-between">
                <Text className="text-text-3 text-[14px] font-dosis-bold">
                  {day}
                </Text>
                <Text className="text-text-5 text-[14px] font-dosis-regular">
                  {handleSchedule(day)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* DESCRIPCIÓN */}
      {local.description && (
        <View className="flex-col gap-1 px-4">
          <TouchableOpacity
            onPress={() =>
              setState({ ...state, descripcion: !state.descripcion })
            }
          >
            <Text className="text-text-3 text-[16px] font-dosis-bold">
              Acerca del local
            </Text>
          </TouchableOpacity>

          <Text
            className="text-text-5 text-[15px] font-dosis-regular text-ellipsis"
            numberOfLines={state.descripcion ? undefined : 2}
          >
            {`"${local.description}"`}
          </Text>
        </View>
      )}

      {/* ADICIONALES */}
      <View className="flex-row justify-center gap-2 items-center mt-6 pt-2 border-t border-dashed border-gray-100">
        {local?.email && (
          <View className="flex-row items-center gap-2">
            <Feather name="mail" size={16} color="#333333" />
            <Text className="text-text-5 text-[15px] font-dosis-regular">
              {local?.email}
            </Text>
          </View>
        )}
        {local?.phone && (
          <View className="flex-row items-center gap-2">
            <FontAwesome name="mobile-phone" size={24} color="#333333" />
            <Text className="text-text-5 text-[15px] font-dosis-regular">
              {local?.phone}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default MenuInfo;
