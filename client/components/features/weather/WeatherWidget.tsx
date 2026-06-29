import { useLocation } from "@/context/extension/LocationContext";
import React from "react";
import { View, Text, ImageBackground } from "react-native";

import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import { useQuery } from "@tanstack/react-query";
import axiosInterceptor from "@/api/client";

interface Props {
  type: "home" | "profile";
}

export const WeatherWidget = ({ type }: Props) => {
  const { location, address } = useLocation();

  const latitude = location?.coords.latitude;
  const longitude = location?.coords.longitude;

  const backgroundCodes: { [key: number]: string } = {
    0: "https://i.pinimg.com/1200x/fe/3e/2a/fe3e2a732108469ecf7fabd9b9dc69c3.jpg", // Despejado día
    1: "https://i.pinimg.com/736x/a2/8a/16/a28a16584b3bdc606ae6cd7c959dba4f.jpg", // Despejado noche
    2: "https://i.pinimg.com/1200x/93/12/79/931279e77480a9dee2c362808fa3e1d2.jpg", // Parcialmente nublado
    3: "https://i.pinimg.com/1200x/85/e4/e1/85e4e100758ada1ea5da7ef67396e34c.jpg", // Niebla
    4: "https://i.pinimg.com/1200x/2c/32/26/2c3226c57346ed58bf5313aa6cd4203a.jpg", // Lluvia
    5: "https://i.pinimg.com/736x/e0/9b/48/e09b48f2f4df9dc658f4a60187475c63.jpg", // Nieve
    6: "https://i.pinimg.com/736x/6f/2f/96/6f2f96530d1efdb3a82679643cca77c6.jpg", // Tormenta
  };

  const weatherConfig = [
    {
      condition: (code: number) => code === 0,
      label: "Despejado",
      backgrounds: { day: backgroundCodes[0], night: backgroundCodes[1] },
      icons: {
        day: (
          <MaterialCommunityIcons name="weather-sunny" size={20} color="#fff" />
        ),
        night: <Fontisto name="night-clear" size={16} color="#fff" />,
      },
    },
    {
      condition: (code: number) => code <= 3,
      label: "Parcialmente nublado",
      backgrounds: { day: backgroundCodes[2], night: backgroundCodes[2] },
      icons: {
        day: <Ionicons name="partly-sunny" size={20} color="#fff" />,
        night: <Fontisto name="night-alt-cloudy" size={20} color="#fff" />,
      },
    },
    {
      condition: (code: number) => code <= 48,
      label: "Niebla",
      backgrounds: { day: backgroundCodes[3], night: backgroundCodes[3] },
      icons: {
        day: <Feather name="cloud" size={20} color="#fff" />,
        night: <Ionicons name="cloudy-night-outline" size={20} color="#fff" />,
      },
    },
    {
      condition: (code: number) => code <= 67,
      label: "Lluvia",
      backgrounds: { day: backgroundCodes[4], night: backgroundCodes[4] },
      icons: {
        day: <Feather name="cloud-drizzle" size={20} color="#fff" />,
        night: <Fontisto name="night-alt-rain" size={20} color="#fff" />,
      },
    },
    {
      condition: (code: number) => code <= 77,
      label: "Nieve",
      backgrounds: { day: backgroundCodes[5], night: backgroundCodes[5] },
      icons: {
        day: <Ionicons name="snow" size={20} color="#fff" />,
        night: <Fontisto name="night-alt-snow" size={20} color="#fff" />,
      },
    },
    {
      condition: (code: number) => code <= 99,
      label: "Tormenta",
      backgrounds: { day: backgroundCodes[6], night: backgroundCodes[6] },
      icons: {
        day: <Feather name="cloud-lightning" size={20} color="#fff" />,
        night: <Fontisto name="night-alt-lightning" size={20} color="#fff" />,
      },
    },
  ];

  function getWeatherInfo(code: number) {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 20;

    const config = weatherConfig.find((c) => c.condition(code));

    if (!config) {
      return {
        label: "Clima desconocido",
        background: "defaultBackground.jpg",
        icon: null,
      };
    }
    return {
      label: config.label,
      background: isNight ? config.backgrounds.night : config.backgrounds.day,
      icon: isNight ? config.icons.night : config.icons.day,
    };
  }

  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: async () => {
      const response = await axiosInterceptor.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`,
      );
      const json = response.data;
      return {
        temperature: json.current_weather.temperature,
        weatherCode: json.current_weather.weathercode,
      };
    },
    enabled: !!location && !!latitude && !!longitude,
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 40 * 60 * 1000,
  });

  if (!weather) return null;

  const { label, background, icon } = getWeatherInfo(weather.weatherCode);

  return (
    <View
      className={`w-full justify-center overflow-hidden
        ${type === "profile" ? "h-[90px] rounded-[10px]" : "h-[110px] rounded-t-[5px] rounded-br-[70px] rounded-bl-[10px]"}`}
    >
      <ImageBackground
        source={{
          uri: background,
        }}
        className="absolute inset-0 w-full h-full"
        resizeMode="cover"
      />

      <View className="absolute inset-0 bg-black opacity-30" />

      <View className="px-4 flex-col gap-y-2 z-10">
        <View className="justify-between flex-row items-center">
          <Text
            className={`font-outfit-bold text-text-1 ${type === "profile" ? "text-[14px]" : "text-[18px]"}`}
          >
            {icon} {label}
          </Text>

          {type === "profile" && (
            <Text className="text-[14px] font-outfit-medium text-text-2">
              {address?.city ? `${address.city}` : ""}
            </Text>
          )}
        </View>

        <Text
          className={`text-text-1 font-outfit-bold tracking-wider ${type === "profile" ? "text-[20px]" : "text-[22px]"}`}
        >
          {weather.temperature}°
        </Text>
      </View>
    </View>
  );
};
