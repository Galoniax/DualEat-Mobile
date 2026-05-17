import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { RecentOrdersTab, NewOrderTab } from "@/components/features/orders/StaffOrdersTabs";

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const { local_id, tab, qrPayload } = useGlobalSearchParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"recent" | "new">("recent");

  // Si se envían parámetros desde otra pantalla (ej. escáner QR), actualizamos la pestaña activa
  useEffect(() => {
    if (tab === "new") {
      setActiveTab("new");
    }
  }, [tab, qrPayload]);

  const handleOrderCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["local-orders", local_id] });
    setActiveTab("recent");
  }, [local_id, queryClient]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F7FA", paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingHorizontal: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontFamily: "Dosis-Bold", color: "#1F2937" }}>Órdenes</Text>
          <Text style={{ fontSize: 14, fontFamily: "Dosis-Medium", color: "#6B7280" }}>Gestión de pedidos</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={{ backgroundColor: "white", paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
        <View style={{ flexDirection: "row", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            onPress={() => setActiveTab("recent")}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: activeTab === "recent" ? "white" : "transparent" }}
          >
            <Text style={{ fontSize: 15, fontFamily: "Dosis-Bold", color: activeTab === "recent" ? "#B53325" : "#6B7280" }}>
              Pedidos Recientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("new")}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: activeTab === "new" ? "white" : "transparent" }}
          >
            <Text style={{ fontSize: 15, fontFamily: "Dosis-Bold", color: activeTab === "new" ? "#B53325" : "#6B7280" }}>
              Nueva Orden
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {activeTab === "recent" ? (
        <RecentOrdersTab localId={local_id as string} />
      ) : (
        <NewOrderTab localId={local_id as string} onOrderCreated={handleOrderCreated} qrPayload={qrPayload as string} />
      )}
    </View>
  );
}
