import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocation } from "@/context/extension/LocationContext";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomBottomSheet from "@/components/ui/BottomSheetModal";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";


import { BottomSheetModal } from "@gorhom/bottom-sheet";
import FilterComponent, { initialFilters } from "@/components/ui/FilterComponent";

const LOCALES_DATA = [
  {
    id: 1,
    name: "Burger King",
    lat: -34.6037,
    lng: -58.3816,
    category: "Fast Food",
  },
  { id: 2, name: "Sushi Club", lat: -34.605, lng: -58.385, category: "Sushi" },
  {
    id: 3,
    name: "Pizzeria Guerrin",
    lat: -34.604,
    lng: -58.388,
    category: "Pizza",
  },
];

export default function MapScreen() {
  const { location, address } = useLocation();
  const webViewRef = useRef<WebView>(null);
  const [locales, setLocales] = useState(LOCALES_DATA);

  const userLat = location?.coords.latitude;
  const userLng = location?.coords.longitude;
  const inputRef = useRef<TextInput | null>(null);

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const [filters, setFilters] = useState(initialFilters);
  const [sizeType, setSizeType] = useState<"small" | "large">("large");

  // console.log("Current filters:", filters);

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const leafletHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <style>
      html, body { margin: 0; padding: 0; height: 100%; }
      #map { height: 100vh; width: 100vw; }
      .leaflet-popup-content-wrapper { font-size: 14px; font-family: Arial; }
      button { padding: 5px 10px; margin-top: 6px; cursor: pointer; }
      
      .custom-user-marker { background: transparent; border: none; }
      
      .pin-marker { display: flex; justify-content: center; align-items: center; box-sizing: border-box; }
      .pin-shape { width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 2px 2px 4px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; transition: transform 0.2s ease; }
      .pin-dot { width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg); }

      .recenter-btn {
        background-color: white;
        width: 34px;
        height: 34px;
        border-radius: 100%;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 1px 5px rgba(0,0,0,0.65);
        border: 2px solid rgba(0,0,0,0.2);
        padding: 7px;
      }
      .recenter-btn:active { background-color: #f4f4f4; }
      .recenter-icon { width: 23px; height: 23px; fill: #444; }
    </style>

    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "js-error", message }));
      };

      let map;
      let userMarker = null;
      let localesMarkers = [];

      document.addEventListener("DOMContentLoaded", function () {
        try {
          map = L.map("map", { zoomControl: false }).setView([${userLat}, ${userLng}], 15);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
             minZoom: 10,
             maxZoom: 20
          }).addTo(map);

          const RecenterControl = L.Control.extend({
            options: { position: 'bottomright' },
            onAdd: function (map) {
              const container = L.DomUtil.create('div', 'recenter-btn leaflet-bar leaflet-control');
              container.innerHTML = \`<svg class="recenter-icon" viewBox="0 0 24 24">
                   <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                </svg>\`;
              container.onclick = function(e) {
                L.DomEvent.stopPropagation(e);
                if (userMarker) {
                   const latLng = userMarker.getLatLng();
                   map.flyTo(latLng, 16, { duration: 1.5 });
                }
              };
              L.DomEvent.disableClickPropagation(container);
              return container;
            }
          });
          map.addControl(new RecenterControl());

          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "map-ready" }));
          updateUserLocation(${userLat}, ${userLng});

        } catch (e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "js-error", message: e.message }));
        }
      });

      function updateUserLocation(lat, lng) {
        if (!map) return;
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: \`<div style="position: relative;"><div style="position: absolute; width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div></div>\`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        });
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          userMarker = L.marker([lat, lng], { icon: userIcon, title: "Tu ubicación" }).addTo(map);
        }
      }

      function updateLocales(list) {
        if (!map) return;
        localesMarkers.forEach(m => map.removeLayer(m));
        localesMarkers = [];

        list.forEach(loc => {
          let pinColor = "#ef4444"; 
          if (loc.category === "Sushi") pinColor = "#111827"; 
          if (loc.category === "Pizza") pinColor = "#f59e0b"; 

          const customPin = L.divIcon({
            className: 'pin-marker',
            html: \`<div class="pin-shape" style="background-color: \${pinColor};"><div class="pin-dot"></div></div>\`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
          });

          const marker = L.marker([loc.lat, loc.lng], { icon: customPin })
            .addTo(map)
            .bindPopup("<b>" + loc.name + "</b><br>" + loc.category + "<br><button onclick='openLocal(" + loc.id + ")'>Ver detalle</button>");
          
          localesMarkers.push(marker);
        });
      }

      function openLocal(id) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: "click", id }));
      }
    </script>
  </head>
  <body><div id="map"></div></body>
</html>
  `;

  useEffect(() => {
    if (location && webViewRef.current) {
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      webViewRef.current.injectJavaScript(
        `updateUserLocation(${lat}, ${lng}); true;`
      );
    }
  }, [location]);

  useEffect(() => {
    if (webViewRef.current && locales.length > 0) {
      const localesJson = JSON.stringify(locales);
      webViewRef.current.injectJavaScript(
        `updateLocales(${localesJson}); true;`
      );
    }
  }, [locales]);

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "click") alert("Abrir local ID: " + data.id);
    } catch (e) {
      console.error(e);
    }
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, fontFamily: "Dosis-Regular" }}>
          Obteniendo ubicación...
        </Text>
      </View>
    );
  }

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        mixedContentMode="always"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        source={{ html: leafletHTML }}
        onMessage={handleMapMessage}
      />

      {/* CAPA DE UI */}
      <SafeAreaView
        pointerEvents="box-none"
        className="absolute inset-0 z-50 flex-col justify-between"
      >
        <View className="flex gap-3 items-center flex-row justify-evenly pt-4 px-6 mx-auto w-full">
          <View
            onTouchStart={focusInput}
            className="flex-[1] justify-start w-full bg-bg-gray rounded-full flex-row items-center gap-2"
            pointerEvents="box-none"
          >
            <Feather name="search" className="ps-4" size={22} color="#707070" />

            <TextInput
              ref={inputRef}
              className="rounded-[40px] placeholder:text-text-5"
              placeholder={`Buscá en ${
                address?.region?.split("Provincia de ")[1] || "tu zona"
              }`}
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Botón de filtro */}
          <TouchableOpacity
            onPress={openBottomSheet}
            style={{
              backgroundColor: "#e5e7eb",
              padding: 14,
              borderRadius: 999,
            }}
          >
            <Ionicons name="options-sharp" size={20} color="black" />
          </TouchableOpacity>
        </View>

        <View
          className="px-4 pb-6 items-center"
          pointerEvents="box-none"
        ></View>
      </SafeAreaView>

      <CustomBottomSheet type={sizeType} ref={bottomSheetRef}>
        <View className="flex-1 px-1 py-3">
          {/* --- Header del filtro --- */}
          <View className="flex-row justify-start items-center mb-6  gap-4 border-b border-dashed border-gray-200 pb-5">
            <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()}>
              <Ionicons name="close" size={22} color="black" />
            </TouchableOpacity>

            <Text className="text-[18px] font-bold text-text-3">Filtros</Text>
          </View>

          <FilterComponent filters={filters} setFilters={setFilters} viewMode={"all"}/>

          {/* --- Botones inferiores fijos --- */}
          <View className="flex-row gap-4 pt-4 border-t border-gray-100 mt-auto">
            <TouchableOpacity
              className="flex-1 py-4 rounded-full border border-gray-300 items-center justify-center"
              onPress={() => console.log("Limpiar")}
            >
              <Text className="font-bold text-gray-700">Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 py-4 rounded-full bg-[#FBBF24] items-center justify-center shadow-sm"
              onPress={() => {
                console.log("Aplicar");
                bottomSheetRef.current?.dismiss();
              }}
            >
              <Text className="text-white font-bold text-base">Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CustomBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    flex: 1,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: "center",
  },
});
