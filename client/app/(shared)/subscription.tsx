import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import LinearGradient from "react-native-linear-gradient";
import * as WebBrowser from "expo-web-browser";

import { useAuth } from "@/context/auth/AuthContext";
import { createUserCheckout } from "@/services/subscription.api";
import { globalToast as toast } from "@/utils/toast";

export default function SubscriptionView() {
  const router = useRouter();
  const { user } = useAuth();

  const [billingCycle, setBillingCycle] = useState<"MENSUAL" | "ANUAL">(
    "MENSUAL",
  );
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">(
    "PREMIUM",
  );

  const [loading, setLoading] = useState(false);

  const prices = {
    BASIC: {
      monthly: "$0.00",
      annual: "$0.00",
      period: "/ mes",
    },
    PREMIUM: {
      monthly: {
        original: "$4.00 ARS",
        period: "/ mes",
      },
      annual: {
        original: "$24.00 ARS",
        period: "/ año",
      },
    },
  };

  const handleSubscribe = async () => {
    if (selectedPlan === "BASIC") return;

    setLoading(true);
    try {
      const planKey =
        billingCycle === "MENSUAL"
          ? "COMMUNITY_USER_MONTHLY"
          : "COMMUNITY_USER_ANNUAL";

      const response = await createUserCheckout(planKey);

      if (response && response.success && response.checkoutUrl) {
        await WebBrowser.openBrowserAsync(response.checkoutUrl);
      } else {
        toast.error("Error desconocido", response?.message || "No se pudo iniciar el checkout");
      }
    } catch (e: any) {
      toast.error("Error desconocido", e?.message || "Error al iniciar el checkout");
    } finally {
      setLoading(false);
    }
  };

  const isUserPremium =
    user?.subscription_status === "ACTIVE" ||
    user?.subscription_status === "TRIAL";

  return (
    <SafeAreaView className="flex-1" edges={["bottom", "top", "left", "right"]}>
      <LinearGradient
        colors={["#B53325", "#46130eff", "#000000"]}
        locations={[0, 0.3, 1]}
        className="absolute inset-0"
      />

      <View className="flex-row justify-start items-center px-4 py-2 z-10">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="flex-1"
      >
        {/* Icono de Verificación e Hito */}
        <View className="items-center flex-col gap-y-3 px-6">
          <View className="w-20 h-20 rounded-full bg-[#161616] border-2 border-[#e5a657] items-center justify-center">
            <MaterialCommunityIcons name="decagram" size={54} color="#e5a657" />
            <Ionicons
              name="checkmark"
              size={28}
              color="#ffffff"
              style={{ position: "absolute" }}
            />
          </View>

          <Text className="text-[24px] font-outfit-bold text-white text-center leading-8 px-4">
            Obtén Premium
          </Text>
          <Text className="text-base font-outfit-light text-text-2 text-center px-6">
            Elige el plan ideal para ti y comienza a disfrutar de los beneficios
            de DualEat Premium
          </Text>
        </View>

        {/* Switcher de Anual / Mensual */}
        <View className="flex-row justify-center mt-8 px-6">
          <View className="flex-row bg-[#161616] p-1.5 rounded-full border border-white/5 w-64 justify-between">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setBillingCycle("ANUAL")}
              className={`flex-1 py-2.5 rounded-full items-center ${
                billingCycle === "ANUAL" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-[14px] font-outfit-bold ${
                  billingCycle === "ANUAL" ? "text-black" : "text-text-2"
                }`}
              >
                Anual
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setBillingCycle("MENSUAL")}
              className={`flex-1 py-2.5 rounded-full items-center ${
                billingCycle === "MENSUAL" ? "bg-white" : "bg-transparent"
              }`}
            >
              <Text
                className={`text-[14px] font-outfit-bold ${
                  billingCycle === "MENSUAL" ? "text-black" : "text-text-2"
                }`}
              >
                Mensual
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tarjetas de Planes */}
        <View className="px-6 mt-8 flex-col gap-y-6">
          {/* PLAN BÁSICO */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan("BASIC")}
            className={`rounded-2xl p-5 border ${
              selectedPlan === "BASIC"
                ? "bg-[#161616] border-white/30"
                : "bg-white/5 border-white/5"
            }`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-[18px] font-outfit-bold text-white mb-1">
                  Básico
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-base font-outfit-bold text-white">
                    {prices.BASIC.monthly}
                  </Text>
                  <Text className="text-sm font-outfit-regular text-text-2 ml-1">
                    {prices.BASIC.period}
                  </Text>
                </View>
              </View>
              {/* Selector */}
              <View
                className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                  selectedPlan === "BASIC"
                    ? "border-white bg-white"
                    : "border-white/20 bg-transparent"
                }`}
              >
                {selectedPlan === "BASIC" && (
                  <Ionicons name="checkmark" size={14} color="#000000" />
                )}
              </View>
            </View>

            <View className="border-t border-white/10 my-4" />

            {/* Características */}
            <View className="flex-col gap-y-3">
              {[
                "Crear posts y recetas básicas",
                "Límite estándar de contenido (300 caracteres)",
                "Lectura de chats y comentarios",
              ].map((item, idx) => (
                <View key={idx} className="flex-row items-center">
                  <Ionicons
                    name={
                      idx === 0
                        ? "create-outline"
                        : idx === 1
                          ? "text-outline"
                          : "chatbox-outline"
                    }
                    size={16}
                    color="#dbdbdb"
                    className="mr-3"
                  />
                  <Text className="text-sm font-outfit-regular text-text-2">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          {/* PLAN PREMIUM */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedPlan("PREMIUM")}
            style={{
              shadowColor:
                selectedPlan === "PREMIUM" ? "#e5a657" : "transparent",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
            }}
            className={`rounded-2xl p-5 border relative overflow-hidden ${
              selectedPlan === "PREMIUM"
                ? "bg-[#161616] border-[#e5a657]"
                : "bg-white/5 border-white/5"
            }`}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-[18px] font-outfit-bold text-white">
                  Premium
                </Text>

                <View className="flex-row items-baseline gap-x-2">
                  <Text className="text-base font-outfit-bold text-white">
                    {billingCycle === "MENSUAL"
                      ? prices.PREMIUM.monthly.original
                      : prices.PREMIUM.annual.original}
                  </Text>

                  <Text className="text-sm font-outfit-regular text-text-2">
                    {billingCycle === "MENSUAL"
                      ? prices.PREMIUM.monthly.period
                      : prices.PREMIUM.annual.period}
                  </Text>
                </View>
              </View>

              {/* Selector */}
              <View
                className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
                  selectedPlan === "PREMIUM"
                    ? "border-[#e5a657] bg-[#e5a657]"
                    : "border-white/20 bg-transparent"
                }`}
              >
                {selectedPlan === "PREMIUM" && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" />
                )}
              </View>
            </View>

            <View className="border-t border-white/10 my-4" />

            {/* Características */}
            <View className="flex-col gap-y-3.5">
              <View className="flex-row items-center">
                <Text className="text-sm font-outfit-bold text-white">
                  Marca de cuenta verificada
                </Text>
              </View>

              {[
                "Capacidad de editar tus posts",
                "Posibilidad de hacer posts o recetas más largas"
              ].map((item, idx) => (
                <View key={idx} className="flex-row items-center">
                  <Ionicons
                    name={
                      idx === 0
                        ? "checkmark"
                        : idx === 1
                          ? "add-circle"
                          : "shield-checkmark"
                    }
                    size={18}
                    color="#e5a657"
                    className="mr-3"
                  />
                  <Text className="text-sm font-outfit-medium text-white">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Panel Inferior Flotante Sticky */}
      <View className="bg-[#0e1117]/95 border-t border-white/10 py-6 px-6 z-20">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-[16px] font-outfit-bold text-white">
              {selectedPlan === "PREMIUM" ? "Premium" : "Básico"}
            </Text>

            <Text className="text-[12px] font-outfit-regular text-text-2">
              {selectedPlan === "PREMIUM"
                ? billingCycle === "MENSUAL"
                  ? `${prices.PREMIUM.monthly.original} ARS facturado anualmente de manera única.`
                  : `${prices.PREMIUM.annual.original} ARS facturado anualmente de manera única.`
                : "Uso gratuito y limitado para siempre."}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[20px] font-outfit-bold text-white">
              {selectedPlan === "PREMIUM"
                ? billingCycle === "MENSUAL"
                  ? prices.PREMIUM.monthly.original
                  : prices.PREMIUM.annual.original
                : prices.BASIC.monthly}
            </Text>
            <Text className="text-[11px] font-outfit-regular text-text-4">
              {selectedPlan === "PREMIUM"
                ? billingCycle === "MENSUAL"
                  ? prices.PREMIUM.monthly.period
                  : prices.PREMIUM.annual.period
                : prices.BASIC.period}
            </Text>
          </View>
        </View>

        {/* Botón de Acción */}
        {isUserPremium && selectedPlan === "PREMIUM" ? (
          <View className="w-full bg-[#1b2a1e] border border-[#2e7d32]/40 py-3.5 rounded-xl items-center justify-center flex-row gap-x-2">
            <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
            <Text className="text-[#2e7d32] font-outfit-bold text-[16px]">
              Ya eres miembro Premium
            </Text>
          </View>
        ) : selectedPlan === "BASIC" ? (
          <View className="w-full bg-white/5 border border-white/10 py-3.5 rounded-xl items-center justify-center">
            <Text className="text-text-2 font-outfit-bold text-[16px]">
              Plan actual habilitado
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubscribe}
            disabled={loading}
            className="w-full bg-white py-3.5 rounded-xl items-center justify-center shadow-lg shadow-white/5"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text className="text-black font-outfit-bold text-[16px]">
                Suscribirse y pagar
              </Text>
            )}
          </TouchableOpacity>
        )}

        <Text className="text-[10px] font-outfit-light text-text-4 text-center mt-3 leading-4 px-2">
          Al suscribirte aceptas los{" "}
          <Text className="underline">Términos de servicio</Text> del comprador.
          Pases de un único pago mediante Mercado Pago. Cancelación sin cargos
          automáticos recurrentes.
        </Text>
      </View>
    </SafeAreaView>
  );
}
