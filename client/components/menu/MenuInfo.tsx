import { Text, View, TouchableOpacity, Linking, Platform } from "react-native";
import { MenuLocal } from "./MenuScreen";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

interface MenuInfoProps {
  local: MenuLocal;
  insets: any;
}

function MenuInfo({ local, insets }: MenuInfoProps) {
  const lat = Number(local.latitude) || 0;
  const lng = Number(local.longitude) || 0;

  
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
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
        }
      });
    }
  };

  return (
    <View className="px-4" style={{ paddingBottom: insets.bottom }}>
      
      <View className="h-[200px] w-full rounded-2xl overflow-hidden mt-2 border border-gray-200">
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude: lat, longitude: lng }}
            title={local.name}
            description={local.address}
          />
        </MapView>
      </View>

      {/* 2. LA DIRECCIÓN Y EL BOTÓN (Estilo PedidosYa) */}
      <View className="flex-row items-center justify-between mt-4 mb-6">
        {/* Izquierda: Dirección */}
        <View className="flex-row items-center gap-2 flex-1 pr-4">
          <Ionicons name="location-sharp" size={22} color="#333333" />
          <Text 
            className="text-text-3 text-[18px] font-dosis-bold" 
            numberOfLines={2}
          >
            {local.address}
          </Text>
        </View>

        {/* Derecha: Botón de Abrir Mapa */}
        <TouchableOpacity onPress={handleOpenMap}>
          <Text className="text-[14px] font-dosis-bold text-black">
            Abrir mapa
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

export default MenuInfo;