import { useLocalSearchParams, useRouter } from "expo-router";
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
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, X, Receipt, ChevronRight } from "lucide-react-native";

import { useAuth } from "@/context/auth/AuthContext";
import { getOrderById } from "@/services/order.api";
import { Order } from "@/interface/global";
import { formatPrice } from "@/utils/distance";
import { ROUTES } from "@/constants/constants";
import { format } from "date-fns";
import { useOrdering } from "@/context/cart/OrderingContext";

type PaymentStatus = "approved" | "rejected" | "pending";
type PaymentType = "SUBSCRIPTION" | "ORDER" | "PRE_ORDER";
type PlanType = "COMMUNITY_USER_MONTHLY" | "COMMUNITY_USER_ANNUAL";

interface StatusConfig {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  statusLabel: string;
  statusColor: string;
}

function getStatusConfig(
  status: PaymentStatus,
  type: PaymentType,
): StatusConfig {
  const isSubscription = type === "SUBSCRIPTION";
  const typeLabel = isSubscription ? "suscripción" : "pedido";

  if (status === "approved") {
    return {
      icon: <Check size={32} strokeWidth={3} color="#ffffff" />,
      iconBgColor: "#166534",
      title: isSubscription ? "¡Bienvenido a Premium!" : "¡Pago exitoso!",
      description: isSubscription
        ? "Tu suscripción ha sido activada correctamente. Ya podés disfrutar de todos los beneficios Premium."
        : "Tu pago ha sido procesado con éxito y tu pedido ya está confirmado en el local.",
      statusLabel: "Aprobado",
      statusColor: "#166534",
    };
  }

  if (status === "pending") {
    return {
      icon: <Clock size={32} strokeWidth={2.5} color="#ffffff" />,
      iconBgColor: "#92400e",
      title: "Pago pendiente",
      description: `Tu ${typeLabel} está siendo procesado por Mercado Pago. Te notificaremos cuando se complete.`,
      statusLabel: "Pendiente",
      statusColor: "#e5a657",
    };
  }

  return {
    icon: <X size={32} strokeWidth={3} color="#ffffff" />,
    iconBgColor: "#991b1b",
    title: "Pago rechazado",
    description: `No pudimos procesar el pago de tu ${typeLabel}. Intentá de nuevo o seleccioná otro método de pago.`,
    statusLabel: "Rechazado",
    statusColor: "#B53325",
  };
}

export default function PaymentResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, setToken } = useAuth();

  const { clear } = useOrdering();

  const params = useLocalSearchParams<{
    status: PaymentStatus;
    type: PaymentType;
    id: string;
    user_id: string;
    plan: PlanType;
  }>();

  const status = (params.status ?? "rejected") as PaymentStatus;
  const type = (params.type ?? "ORDER") as PaymentType;
  const orderId = params.id;
  const plan = params.plan;

  const isSubscription = type === "SUBSCRIPTION";
  const isOrder = type === "ORDER" || type === "PRE_ORDER";
  const config = useMemo(() => getStatusConfig(status, type), [status, type]);

  useEffect(() => {
    if (isSubscription && status === "approved") {
      setToken(null);
    }
  }, [isSubscription, status, setToken]);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["payment-result-order", orderId],
    enabled: isOrder && !!orderId,
    queryFn: async () => {
      if (!orderId) throw new Error("No order ID");
      const response = await getOrderById(orderId);
      if (!response?.success) return null;
      return response.data as Order;
    },
    retry: 2,
  });

  const planDisplayName = useMemo(() => {
    if (!plan) return "Premium";
    if (plan.includes("MONTHLY")) return "Premium Mensual";
    if (plan.includes("ANNUAL")) return "Premium Anual";
    return "Premium";
  }, [plan]);

  const formattedDate = useMemo(() => {
    try {
      return format(new Date(), "dd/MM/yyyy · HH:mm");
    } catch {
      return new Date().toLocaleDateString();
    }
  }, []);

  const orderDate = useMemo(() => {
    if (!order?.created_at) return null;
    try {
      return format(new Date(order.created_at), "dd/MM/yyyy · HH:mm");
    } catch {
      return null;
    }
  }, [order]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
        <Text className="text-xs font-outfit-bold text-text-4 tracking-widest uppercase">
          {isSubscription
            ? "Confirmación de suscripción"
            : type === "PRE_ORDER"
              ? "Confirmación de pre-orden"
              : "Confirmación de orden"}
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
          className="w-8 h-8 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={22} color="#2F2F2F" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        className="flex-1"
      >
        <View className="items-center pt-10 pb-8 px-6">
          <View
            style={{ backgroundColor: config.iconBgColor }}
            className="w-16 h-16 rounded-full items-center justify-center mb-5"
          >
            {config.icon}
          </View>

          <Text className="text-[26px] font-outfit-bold text-text-3 text-center mb-2">
            {config.title}
          </Text>

          <Text className="text-sm font-outfit-regular text-text-4 text-center leading-5 px-4">
            {config.description}
          </Text>
        </View>

        {/* Carta de recibo */}
        <View className="mx-5 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <View className="border-b border-dashed border-gray-200" />

          <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
            <Text className="text-sm font-outfit-regular text-text-4">
              Estado
            </Text>
            <View className="flex-row items-center gap-x-1.5">
              <View
                style={{ backgroundColor: config.statusColor }}
                className="w-2 h-2 rounded-full"
              />
              <Text
                style={{ color: config.statusColor }}
                className="text-sm font-outfit-bold"
              >
                {config.statusLabel}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
            <Text className="text-sm font-outfit-regular text-text-4">
              Fecha
            </Text>
            <Text className="text-sm font-outfit-regular text-text-3">
              {orderDate || formattedDate}
            </Text>
          </View>

          <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
            <Text className="text-sm font-outfit-regular text-text-4">
              Tipo
            </Text>
            <Text className="text-sm font-outfit-regular text-text-3">
              {isSubscription
                ? "Suscripción"
                : type === "PRE_ORDER"
                  ? "Pre-orden"
                  : "Orden"}
            </Text>
          </View>

          {/* Detalles de suscripción */}
          {isSubscription && (
            <>
              <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
                <Text className="text-sm font-outfit-regular text-text-4">
                  Plan
                </Text>
                <View className="flex-row items-center gap-x-1.5">
                  <Text className="text-sm font-outfit-bold text-text-3">
                    {planDisplayName}
                  </Text>
                </View>
              </View>

              {user && (
                <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
                  <Text className="text-sm font-outfit-regular text-text-4">
                    Titular
                  </Text>
                  <Text className="text-sm font-outfit-regular text-text-3">
                    {user.name}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Detalles de orden */}
          {isOrder && orderId && (
            <View className="flex-row justify-between items-center px-5 py-3.5 border-b border-gray-50">
              <Text className="text-sm font-outfit-regular text-text-4">
                Nro. de orden
              </Text>
              <Text
                numberOfLines={1}
                className="text-sm font-outfit-regular text-text-3 max-w-[180px]"
              >
                {orderId.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="border-b border-dashed border-gray-200" />

          {/* Order items */}
          {isOrder && orderLoading && (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color="#B53325" />
            </View>
          )}

          {isOrder &&
            order &&
            order.order_items &&
            order.order_items.length > 0 && (
              <>
                <View className="px-5 pt-4 pb-2">
                  <Text className="text-xs font-outfit-bold text-text-4 tracking-widest uppercase">
                    {order.order_items.length}{" "}
                    {order.order_items.length === 1 ? "producto" : "productos"}
                  </Text>
                </View>

                {order.order_items.map((item, idx) => (
                  <View
                    key={item.id || idx}
                    className={`flex-row justify-between items-center px-5 py-3 ${
                      idx < order.order_items.length - 1
                        ? "border-b border-gray-50"
                        : ""
                    }`}
                  >
                    <View className="flex-1 mr-4">
                      <Text className="text-sm font-outfit-bold text-text-3">
                        {item.food?.name || "Producto"}
                      </Text>
                      <Text className="text-xs font-outfit-regular text-text-4 mt-0.5">
                        x{item.quantity} · {formatPrice(item.unit_price)} c/u
                      </Text>
                    </View>
                    <Text className="text-sm font-outfit-bold text-text-3">
                      {formatPrice(item.subtotal)} ARS
                    </Text>
                  </View>
                ))}

                {/* Dotted separator */}
                <View className="border-b border-dashed border-gray-200" />

                {/* Total */}
                <View className="flex-row justify-between items-center px-5 py-4">
                  <Text className="text-base font-outfit-bold text-text-3">
                    Total
                  </Text>
                  <Text className="text-lg font-outfit-extrabold text-text-3">
                    {formatPrice(order.total)} ARS
                  </Text>
                </View>
              </>
            )}

          {/* Order local info */}
          {isOrder && order?.local && (
            <>
              <View className="border-b border-dashed border-gray-200" />
              <View className="px-5 py-4">
                <Text className="text-xs font-outfit-bold text-text-4 tracking-widest uppercase mb-2">
                  Local
                </Text>
                <Text className="text-sm font-outfit-bold text-text-3">
                  {order.local.name}
                </Text>
                {order.local.address && (
                  <Text className="text-xs font-outfit-regular text-text-4 mt-1">
                    {order.local.address}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Método de pago */}
        <View className="mx-5 mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <View className="flex-row justify-between items-center px-5 py-3.5">
            <Text className="text-sm font-outfit-regular text-text-4">
              Método de pago
            </Text>
            <Text className="text-sm font-outfit-bold text-text-3">
              Mercado Pago
            </Text>
          </View>
        </View>

        <Text className="text-[11px] font-outfit-light text-text-4 text-center mt-6 px-10 leading-4">
          {isSubscription
            ? "Tu suscripción fue procesada mediante Mercado Pago. Cancelación sin cargos automáticos recurrentes."
            : "Tu pago fue procesado mediante Mercado Pago. Si tenés algún problema, contactá al local."}
        </Text>
      </ScrollView>

      {/* Footer */}
      <View
        style={{ paddingBottom: insets.bottom + 16 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
      >
        {/* Botón primario */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (status === "approved" && isOrder && orderId) {
              clear();
              router.replace({
                pathname: ROUTES.USER.ORDER_INFO,
                params: {
                  order_id: orderId,
                },
              });
            } else {
              router.replace("/");
            }
          }}
          className="w-full bg-bg-red py-3.5 rounded-xl items-center justify-center flex-row gap-x-2"
        >
          {status === "approved" && isOrder ? (
            <>
              <Receipt size={18} color="#ffffff" strokeWidth={2} />
              <Text className="text-white font-outfit-bold text-[15px]">
                Ver mi pedido
              </Text>
            </>
          ) : status === "approved" && isSubscription ? (
            <>
              <Text className="text-white font-outfit-bold text-[15px]">
                Ir al inicio
              </Text>
            </>
          ) : (
            <>
              <Text className="text-white font-outfit-bold text-[15px]">
                Entendido
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Rechazado */}
        {status === "rejected" && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (isSubscription) {
                router.replace(ROUTES.SHARED.SUBSCRIPTION);
              } else {
                router.back();
              }
            }}
            className="w-full py-3 mt-2 rounded-xl items-center justify-center flex-row gap-x-1.5"
          >
            <Text className="text-bg-red font-outfit-bold text-sm">
              Intentar de nuevo
            </Text>
            <ChevronRight size={16} color="#B53325" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
