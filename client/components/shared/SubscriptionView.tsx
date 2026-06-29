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
import { showToast } from "@/utils/toast";

export default function SubscriptionView() {
  const router = useRouter();
  const { user } = useAuth();

  // Estado para el ciclo de facturación: "MENSUAL" o "ANUAL"
  const [billingCycle, setBillingCycle] = useState<"MENSUAL" | "ANUAL">(
    "MENSUAL",
  );

  // Estado para el plan seleccionado: "BASIC" o "PREMIUM"
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">(
    "PREMIUM",
  );

  // Estado de carga para Mercado Pago
  const [loading, setLoading] = useState(false);

  // Precios para mostrar (simulados para lucir premium pero alineados al backend)
  const prices = {
    BASIC: {
      monthly: "$0.00",
      annual: "$0.00",
      period: "/ mes",
    },
    PREMIUM: {
      monthly: {
        original: "$4.00 ARS",
        promo: "$2.00 ARS",
        period: "/ mes",
      },
      annual: {
        original: "$30.00 ARS",
        promo: "$15.00 ARS",
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
        // Abrir la pasarela de Mercado Pago en el navegador del celular
        await WebBrowser.openBrowserAsync(response.checkoutUrl);
      } else {
        showToast(
          "error",
          response.message || "No se pudo iniciar el checkout",
          "Error",
        );
      }
    } catch (error) {
      console.error("Error al procesar suscripción:", error);
      showToast(
        "error",
        "Ocurrió un error inesperado al conectar con Mercado Pago",
        "Error",
      );
    } finally {
      setLoading(false);
    }
  };

  const isUserPremium =
    user?.suscription_status === "ACTIVE" ||
    user?.suscription_status === "TRIAL";

  return (
    <View className="flex-1 bg-black">
      {/* Fondo Premium degradado de oscuro a negro con brillo azul superior */}
      <LinearGradient
        colors={["#0a101d", "#020305", "#000000"]}
        locations={[0, 0.4, 1]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
        {/* Cabecera / Botón Cerrar */}
        <View className="flex-row justify-between items-center px-4 py-2 z-10">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <Text className="text-[12px] font-outfit-bold text-text-2 uppercase tracking-widest">
              DualEat Premium
            </Text>
          </View>
          <View className="w-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
          className="flex-1"
        >
          {/* Icono de Verificación e Hito */}
          <View className="items-center mt-4 px-6">
            <View
              style={{
                shadowColor: "#3578e4",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 24,
                elevation: 10,
              }}
              className="w-20 h-20 rounded-full bg-[#1b3152] border-2 border-[#3578e4] items-center justify-center mb-5"
            >
              <MaterialCommunityIcons
                name="decagram"
                size={54}
                color="#3578e4"
              />
              <Ionicons
                name="checkmark"
                size={28}
                color="#ffffff"
                style={{ position: "absolute" }}
              />
            </View>

            <Text className="text-[26px] font-outfit-bold text-white text-center leading-8 px-4">
              Ahorra un 50 % en Premium
            </Text>
            <Text className="text-[14px] font-outfit-regular text-text-2 text-center mt-2 px-6">
              Elige el plan ideal para ti y obtén superpoderes en DualEat
            </Text>
          </View>

          {/* Switcher de Anual / Mensual */}
          <View className="flex-row justify-center mt-8 px-6">
            <View className="flex-row bg-[#151922] p-1.5 rounded-full border border-white/5 w-64 justify-between">
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
            {/* PLAN BÁSICO (Gratuito) */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelectedPlan("BASIC")}
              className={`rounded-2xl p-5 border ${
                selectedPlan === "BASIC"
                  ? "bg-[#15181f] border-white/30"
                  : "bg-white/5 border-white/5"
              }`}
            >
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-[18px] font-outfit-bold text-white mb-1">
                    Básico
                  </Text>
                  <View className="flex-row items-baseline">
                    <Text className="text-[24px] font-outfit-bold text-white">
                      {prices.BASIC.monthly}
                    </Text>
                    <Text className="text-[13px] font-outfit-regular text-text-2 ml-1">
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
                <View className="flex-row items-center">
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color="#707070"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-regular text-text-2">
                    Crear posts y recetas básicas
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="text-outline"
                    size={16}
                    color="#707070"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-regular text-text-2">
                    Límite estándar de contenido (300 caracteres)
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="chatbox-outline"
                    size={16}
                    color="#707070"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-regular text-text-2">
                    Lectura de chats y comentarios
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* PLAN PREMIUM (De Pago) */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelectedPlan("PREMIUM")}
              style={{
                shadowColor:
                  selectedPlan === "PREMIUM" ? "#3578e4" : "transparent",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
              }}
              className={`rounded-2xl p-5 border relative overflow-hidden ${
                selectedPlan === "PREMIUM"
                  ? "bg-[#111724] border-[#3578e4]"
                  : "bg-white/5 border-white/5"
              }`}
            >
              {/* Badge de Descuento */}
              <View className="absolute top-0 right-0 bg-[#2e7d32] px-3 py-1 rounded-bl-xl border-l border-b border-[#3e9e42]/20">
                <Text className="text-[11px] font-outfit-bold text-white uppercase tracking-wider">
                  {billingCycle === "MENSUAL"
                    ? "50% OFF 2 meses"
                    : "Ahorra 37%"}
                </Text>
              </View>

              <View className="flex-row justify-between items-start mt-2">
                <View>
                  <View className="flex-row items-center gap-x-1.5 mb-1">
                    <Text className="text-[19px] font-outfit-bold text-white">
                      Premium
                    </Text>
                    <Ionicons name="sparkles" size={16} color="#e5a657" />
                  </View>

                  {/* Precios tachados y promo */}
                  <View className="flex-row items-baseline">
                    <Text className="text-[14px] font-outfit-regular text-text-2 line-through mr-2">
                      {billingCycle === "MENSUAL"
                        ? prices.PREMIUM.monthly.original
                        : prices.PREMIUM.annual.original}
                    </Text>
                    <Text className="text-[25px] font-outfit-bold text-white">
                      {billingCycle === "MENSUAL"
                        ? prices.PREMIUM.monthly.promo
                        : prices.PREMIUM.annual.promo}
                    </Text>
                    <Text className="text-[13px] font-outfit-regular text-text-2 ml-1">
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
                      ? "border-[#3578e4] bg-[#3578e4]"
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
                  <Text className="text-[14px] font-outfit-bold text-white">
                    Marca de cuenta verificada
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="pencil"
                    size={18}
                    color="#3578e4"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-medium text-white">
                    Capacidad de editar tus posts
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="add-circle"
                    size={18}
                    color="#3578e4"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-medium text-white">
                    Contenido e historias 2 veces más largos
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="chatbubbles"
                    size={18}
                    color="#3578e4"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-medium text-white">
                    Chat de soporte exclusivo con locales
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="shield-checkmark"
                    size={18}
                    color="#3578e4"
                    className="mr-3"
                  />
                  <Text className="text-[14px] font-outfit-medium text-white">
                    Soporte prioritario y sin anuncios
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Panel Inferior Flotante Sticky */}
      <View className="absolute bottom-0 inset-x-0 bg-[#0e1117]/95 border-t border-white/10 py-6 px-6 z-20">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-[16px] font-outfit-bold text-white">
              {selectedPlan === "PREMIUM" ? "Premium" : "Básico"}
            </Text>

            <Text className="text-[12px] font-outfit-regular text-text-2">
              {selectedPlan === "PREMIUM"
                ? billingCycle === "MENSUAL"
                  ? "Los primeros 2 meses, luego $4.00 ARS facturados mensualmente."
                  : "$15.00 ARS facturado anualmente de manera única."
                : "Uso gratuito y limitado para siempre."}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[20px] font-outfit-bold text-white">
              {selectedPlan === "PREMIUM"
                ? billingCycle === "MENSUAL"
                  ? prices.PREMIUM.monthly.promo
                  : prices.PREMIUM.annual.promo
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
    </View>
  );
}
