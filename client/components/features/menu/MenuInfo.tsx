import {
  Text,
  View,
  TouchableOpacity,
  Linking,
  Platform,
  ScrollView,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { mapStyle } from "@/constants/constants";
import React, { useState } from "react";
import { normalize } from "@/utils/normalize";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { MenuLocal } from "@/app/(client)/(out)/local/[local_id]";
import { EdgeInsets } from "react-native-safe-area-context";

interface MenuInfoProps {
  local: MenuLocal;
  insets: EdgeInsets;
  ListHeaderComponent?: () => React.ReactNode;
}

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

export default function MenuInfo({
  local,
  insets,
  ListHeaderComponent,
}: MenuInfoProps) {
  const lat = Number(local.latitude) || 0;
  const lng = Number(local.longitude) || 0;
  const now = days[new Date().getDay()];

  const [state, setState] = useState(states);

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
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 20,
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      {ListHeaderComponent && ListHeaderComponent()}

      <View
        style={{
          paddingHorizontal: insets.right + insets.left + 12,
          gap: 28,
        }}
      >
        {/* DESCRIPCIÓN */}
        {local.description && (
          <TouchableOpacity
            onPress={() =>
              setState({ ...state, descripcion: !state.descripcion })
            }
          >
            <Text
              className="text-text-5 text-[15px] font-outfit-light text-center"
              ellipsizeMode="tail"
              numberOfLines={state.descripcion ? undefined : 3}
            >
              {`"${local.description}"`}
            </Text>
          </TouchableOpacity>
        )}

        {/* DIRECCIÓN */}
        <View className="flex-col gap-y-4">
          <View className="flex-row items-center gap-x-2">
            <Ionicons name="location-outline" size={18} color="#333333" />
            <Text className="text-text-3 text-[15px] font-outfit-bold">
              Dirección
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text
              className="text-text-3 text-[15px] font-outfit-light"
              numberOfLines={2}
            >
              {local.address}
            </Text>

            <TouchableOpacity onPress={handleOpenMap}>
              <Text className="text-[15px] font-outfit-bold text-text-5 underline">
                Abrir mapa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/** MAPA */}
        <View className="h-[250px] w-full rounded-[14px] overflow-hidden border border-gray-400">
          <MapView
            style={{ flex: 1 }}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={true}
            showsMyLocationButton={true}
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

        {/* HORARIOS */}
        <View className="flex-col gap-y-6">
          <TouchableOpacity
            onPress={() => setState({ ...state, horarios: !state.horarios })}
            className="flex-col items-start gap-y-2 w-full relative"
          >
            <View className="flex-row items-center gap-x-2">
              <Ionicons name={"time-outline"} size={18} color="#333333" />
              <Text
                className="text-text-3 text-[16px] font-outfit-bold"
                numberOfLines={2}
              >
                Horarios
              </Text>
            </View>
            <Ionicons
              className="absolute right-0 top-1/2"
              name={state.horarios ? "chevron-up" : "chevron-down"}
              size={18}
              color="black"
            />

            <Text className="text-text-5 text-[15px] font-outfit-light">
              Hoy · {todaySchedule}
            </Text>
          </TouchableOpacity>

          {state.horarios && (
            <View className="flex-col gap-y-4">
              {days.map((day) => (
                <View
                  key={day}
                  className="flex-row items-center justify-between"
                >
                  <Text className="text-text-3 text-[14px] font-outfit-bold">
                    {day}
                  </Text>
                  <Text className="text-text-5 text-[14px] font-outfit-light">
                    {handleSchedule(day)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ADICIONALES */}
        {local.email || local.phone ? (
          <View className="flex-row justify-center gap-2 items-center pt-2 border-t border-dashed border-gray-100">
            {local?.email && (
              <View className="flex-row items-center gap-2">
                <Feather name="mail" size={16} color="#333333" />
                <Text className="text-text-5 text-[15px] font-outfit-light">
                  {local?.email}
                </Text>
              </View>
            )}
            {local?.phone && (
              <View className="flex-row items-center gap-2">
                <FontAwesome name="mobile-phone" size={24} color="#333333" />
                <Text className="text-text-5 text-[15px] font-outfit-light">
                  {local?.phone}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
