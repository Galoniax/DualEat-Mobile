import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useAuth } from "@/context/auth/AuthContext";
import { subscriptionPlans } from "@/interface/global";
import { Check } from "lucide-react-native";
import { formatPrice } from "@/utils/distance";
import { StatusBar } from "expo-status-bar";
import { useSubscriptionCheckout } from "@/hooks/api/payment/usePayment";

export default function SubscriptionView() {
  const router = useRouter();
  const { user } = useAuth();

  const insets = useSafeAreaInsets();

  const { mutate: subscribe, isPending } = useSubscriptionCheckout();

  const [billingCycle, setBillingCycle] = useState<"MENSUAL" | "ANUAL">(
    "MENSUAL",
  );
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">(
    "PREMIUM",
  );

  const handleSubscribe = async () => {
    if (selectedPlan === "BASIC") return;

    const planKey =
      billingCycle === "MENSUAL"
        ? "COMMUNITY_USER_MONTHLY"
        : "COMMUNITY_USER_ANNUAL";

    subscribe(
      { plan: planKey },
      
    );
  };

  const isUserPremium =
    user?.subscription_status === "ACTIVE" ||
    user?.subscription_status === "TRIAL";

  let slicedPlans = subscriptionPlans.slice(0, 2);

  if (!user?.is_business) {
    slicedPlans = subscriptionPlans.slice(0, 2);
  } else {
    slicedPlans = subscriptionPlans.slice(0, 3);
  }

  const getFooterPrice = () => {
    const selectedPlanObj = subscriptionPlans.find(
      (p) =>
        p.title.toLowerCase() ===
        (selectedPlan === "PREMIUM" ? "premium" : "básico"),
    );
    if (!selectedPlanObj) return { priceString: "$ 0", periodString: "/ mes" };
    const cycleKey = billingCycle === "MENSUAL" ? "monthly" : "annual";
    const pData = selectedPlanObj.prices[cycleKey];
    return {
      priceString: `${formatPrice(pData.price)} ${pData.currency}`,
      periodString: billingCycle === "MENSUAL" ? "/ mes" : "/ año",
    };
  };

  const footerPrice = getFooterPrice();

  return (
    <SafeAreaView
      className="flex-1 bg-black px-6"
      edges={["bottom", "top", "left", "right"]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View className="flex-row justify-start items-center py-2 z-10">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/5 items-center justify-center"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 220 }}
        className="flex-1"
      >
        {/* Badge + Title */}
        <View className="items-center flex-col gap-y-3">
          <View className="w-20 h-20 rounded-full border-2 border-bg-red items-center justify-center">
            <MaterialCommunityIcons name="decagram" size={44} color="#B53325" />
            <Ionicons
              name="checkmark"
              size={20}
              color="#ffffff"
              style={{ position: "absolute" }}
            />
          </View>

          <Text className="text-2xl font-outfit-bold text-white text-center">
            DualEat premium
          </Text>
          <Text className="text-sm font-outfit-light text-text-2 text-center">
            Elige el plan ideal para ti y comienza a disfrutar de los beneficios
            de DualEat Premium
          </Text>
        </View>

        {/* Switcher */}
        <View className="flex-row justify-center mt-8">
          <View className="flex-row bg-[#161616] p-1.5 rounded-full border border-white/5 w-64 justify-between">
            {(["Anual", "Mensual"] as const).map((item, idx) => {
              const cycleValue = idx === 0 ? "ANUAL" : "MENSUAL";
              const isActive = billingCycle === cycleValue;

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => setBillingCycle(cycleValue)}
                  className={`flex-1 py-2.5 rounded-full items-center ${
                    isActive ? "bg-white" : "bg-transparent"
                  }`}
                >
                  <Text
                    className={`text-sm font-outfit-bold ${
                      isActive ? "text-black" : "text-text-2"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tarjetas de Planes */}
        <View className="flex-col gap-y-5 w-full mt-10">
          {slicedPlans.map((item, idx) => {
            const isPremium = item.title.toLowerCase() === "premium";
            const planKey = isPremium ? "PREMIUM" : "BASIC";
            const isSelected = selectedPlan === planKey;

            const cycleKey = billingCycle === "MENSUAL" ? "monthly" : "annual";
            const priceData = item.prices[cycleKey];
            const priceString = `${formatPrice(priceData.price)} ${priceData.currency}`;
            const periodString = billingCycle === "MENSUAL" ? "/ mes" : "/ año";

            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(planKey)}
                className={`relative flex-col rounded-2xl p-5 border ${
                  isSelected
                    ? isPremium
                      ? "bg-bg-red/20 border-bg-red"
                      : "border-text-2 bg-white/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {/* Plan Header */}
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-4">
                    <Text className="text-lg font-outfit-bold text-white mb-1">
                      {item.title}
                    </Text>
                    <Text className="text-text-6 text-sm font-outfit-regular">
                      {item.description}
                    </Text>
                  </View>

                  {/* Selector */}
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? isPremium
                          ? "bg-bg-red border-bg-red"
                          : "border-white bg-white"
                        : "border-white/20 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        color={isPremium ? "#ffffff" : "#000000"}
                      />
                    )}
                  </View>
                </View>

                {/* Precio */}
                <View className="mt-5 mb-4">
                  <View className="flex-row items-baseline">
                    <Text className="text-2xl font-outfit-extrabold text-white">
                      {priceString}
                    </Text>
                    <Text className="text-text-6 text-sm font-outfit-regular ml-2">
                      {periodString}
                    </Text>
                  </View>
                </View>

                {/* Benefits */}
                <View className="gap-y-3">
                  {item.benefits.map((benefit, bIdx) => (
                    <View key={bIdx} className="flex-row items-start">
                      <Check
                        size={16}
                        strokeWidth={2.5}
                        color={
                          isSelected
                            ? isPremium
                              ? "#B53325"
                              : "#ffffff"
                            : "#707070"
                        }
                        style={{ marginTop: 1 }}
                      />
                      <Text className="text-[13px] font-outfit-regular text-zinc-200 ml-3 flex-1">
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 20 }}
        className="absolute bottom-0 left-0 right-0 bg-[#0e1117] border-t border-white/10 pt-5 pb-6 px-6 z-20"
      >
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-1 mr-4">
            <Text className="text-base font-outfit-bold text-white">
              Plan {selectedPlan === "PREMIUM" ? "Premium" : "Básico"}
            </Text>
            <Text className="text-sm font-outfit-regular text-text-4">
              {billingCycle === "MENSUAL" ? "Mensual" : "Anual"}
            </Text>
          </View>

          <View className="items-end mr-4">
            <Text className="text-xl font-outfit-bold text-white">
              {footerPrice.priceString}
            </Text>
            <Text className="text-xs font-outfit-regular text-text-4">
              {footerPrice.periodString}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        {isUserPremium && selectedPlan === "PREMIUM" ? (
          <View className="w-full bg-[#1b2a1e] border border-[#2e7d32]/40 py-3.5 rounded-xl items-center justify-center flex-row gap-x-2">
            <Ionicons name="checkmark-circle" size={20} color="#2e7d32" />
            <Text className="text-[#2e7d32] font-outfit-bold text-[15px]">
              Ya eres miembro Premium
            </Text>
          </View>
        ) : selectedPlan === "BASIC" ? (
          <View className="w-full bg-white/5 border border-white/10 py-3.5 rounded-xl items-center justify-center">
            <Text className="text-text-2 font-outfit-bold text-[15px]">
              Plan actual habilitado
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubscribe}
            disabled={isPending}
            className={`w-full bg-white py-3.5 rounded-xl items-center justify-center flex-row gap-x-2 ${
              isPending ? "opacity-50" : ""
            }`}
          >
            {isPending ? (
              <>
                <ActivityIndicator size="small" color="#000000" />
                <Text className="text-black font-outfit-bold text-[15px]">
                  Conectando...
                </Text>
              </>
            ) : (
              <Text className="text-black font-outfit-bold text-[15px]">
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
