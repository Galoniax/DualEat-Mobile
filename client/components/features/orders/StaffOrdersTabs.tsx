import React, { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image, TextInput, FlatList, RefreshControl, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocalById } from "@/services/discovery.api";
import { createManualOrder, getLocalOrders, updateOrderStatus, updateOrderItems } from "@/services/order.api";
import { Local, Food, Order, OrderStatus } from "@/interface/global";
import { formatPrice } from "@/utils/distance";
import { globalToast as toast } from "@/utils/toast";

interface CartItem {
  food: Food;
  quantity: number;
}

// =============================================
// COMPONENTE: MODAL DE CONFIRMACIÓN CUSTOM
// =============================================
function CustomConfirmModal({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = "Confirmar", 
  cancelLabel = "Cancelar",
  type = "default" 
}: { 
  visible: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
  confirmLabel?: string; 
  cancelLabel?: string;
  type?: "default" | "destructive" | "success"
}) {
  const colors = {
    default: { bg: "#EFF6FF", icon: "#3B82F6", btn: "#3B82F6" },
    destructive: { bg: "#FEF2F2", icon: "#EF4444", btn: "#EF4444" },
    success: { bg: "#F0FDF4", icon: "#22C55E", btn: "#22C55E" }
  };
  const config = colors[type];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <View style={{ backgroundColor: "white", borderRadius: 28, width: "100%", padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: config.bg, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name={type === "destructive" ? "alert-circle" : type === "success" ? "checkmark-circle" : "information-circle"} size={36} color={config.icon} />
          </View>
          <Text style={{ fontSize: 24, fontFamily: "Dosis-Bold", color: "#1F2937", marginBottom: 8, textAlign: "center" }}>{title}</Text>
          <Text style={{ fontSize: 16, fontFamily: "Dosis-Medium", color: "#6B7280", marginBottom: 24, textAlign: "center", lineHeight: 22 }}>{message}</Text>
          
          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity onPress={onCancel} style={{ flex: 1, paddingVertical: 14, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontFamily: "Dosis-Bold", color: "#4B5563" }}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={{ flex: 1, paddingVertical: 14, borderRadius: 18, backgroundColor: config.btn, alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontFamily: "Dosis-Bold", color: "white" }}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// =============================================
// MODAL: EDITAR ORDEN (CON MENÚ PARA AGREGAR)
// =============================================
function EditOrderModal({ order, localId, onClose, onSaved }: { order: Order; localId: string; onClose: () => void; onSaved: () => void }) {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(
    order.order_items?.map((oi) => ({ food_id: oi.food_id, food_name: oi.food?.name || "Producto", unit_price: oi.unit_price, quantity: oi.quantity })) || []
  );
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response } = useQuery({
    queryKey: ["local", localId],
    queryFn: () => getLocalById(localId),
    enabled: !!localId && showMenu,
  });
  const localData = response?.data as Local | undefined;

  const total = useMemo(() => items.reduce((s, i) => s + i.unit_price * i.quantity, 0), [items]);

  const handleQty = (foodId: string, delta: number) => {
    setItems((prev) => prev.map((i) => (i.food_id === foodId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));
  };
  const handleRemove = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.food_id !== foodId));
  };
  const handleAddFromMenu = (food: Food) => {
    setItems((prev) => {
      const existing = prev.find(i => i.food_id === food.id);
      if (existing) return prev.map(i => i.food_id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { food_id: food.id, food_name: food.name, unit_price: food.price, quantity: 1 }];
    });
    setShowMenu(false);
    setSearchQuery("");
  };

  const handleSave = async () => {
    if (items.length === 0) return;
    setSaving(true);
    const res = await updateOrderItems(localId, order.id, items.map((i) => ({ food_id: i.food_id, quantity: i.quantity })));
    setSaving(false);
    if (res.success) onSaved();
  };

  const filteredCategories = localData?.categories?.map(cat => ({
    ...cat,
    foods: cat.foods?.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.foods && cat.foods.length > 0);

  const displayId = order.short_code || order.id.slice(-6).toUpperCase();

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}>
        {/* Header */}
        <View style={{ backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6", paddingHorizontal: 20, paddingVertical: 16, flexDirection: "row", alignItems: "center", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <TouchableOpacity onPress={onClose} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6", borderRadius: 20, marginRight: 12 }}>
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontFamily: "Dosis-Bold", color: "#1F2937" }}>{showMenu ? "Agregar Comida" : "Modificar Pedido"}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="ticket-outline" size={14} color="#B53325" />
              <Text style={{ fontSize: 14, fontFamily: "Dosis-Bold", color: "#B53325" }}>Ticket {displayId}</Text>
            </View>
          </View>
          {!showMenu && (
            <TouchableOpacity onPress={() => setShowMenu(true)} style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="add-circle" size={20} color="#3B82F6" />
              <Text style={{ fontSize: 14, fontFamily: "Dosis-Bold", color: "#3B82F6" }}>Añadir</Text>
            </TouchableOpacity>
          )}
        </View>

        {showMenu ? (
          <View style={{ flex: 1 }}>
            <View style={{ padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
              <View style={{ backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", height: 48 }}>
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <TextInput 
                  placeholder="Buscar comida..." 
                  style={{ flex: 1, marginLeft: 8, fontFamily: "Dosis-Medium", fontSize: 16 }}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
              {filteredCategories?.map(cat => (
                <View key={cat.id} style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontFamily: "Dosis-Bold", color: "#1F2937", marginBottom: 12, marginLeft: 4 }}>{cat.name}</Text>
                  <View style={{ backgroundColor: "white", borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#F3F4F6" }}>
                    {cat.foods?.map((food, idx) => (
                      <TouchableOpacity 
                        key={food.id} 
                        onPress={() => handleAddFromMenu(food)}
                        style={{ padding: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: idx === cat.foods!.length - 1 ? 0 : 1, borderBottomColor: "#F9FAFB" }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontFamily: "Dosis-Bold", color: "#1F2937" }}>{food.name}</Text>
                          <Text style={{ fontSize: 14, fontFamily: "Dosis-SemiBold", color: "#3B82F6" }}>{formatPrice(food.price)}</Text>
                        </View>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#B53325", alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name="add" size={20} color="white" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
              <TouchableOpacity onPress={() => setShowMenu(false)} style={{ marginTop: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 15, fontFamily: "Dosis-Bold", color: "#6B7280" }}>Volver al pedido</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
            {items.map((item) => (
              <View key={item.food_id} style={{ backgroundColor: "white", borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ fontSize: 17, fontFamily: "Dosis-Bold", color: "#1F2937" }} numberOfLines={1}>{item.food_name}</Text>
                  <Text style={{ fontSize: 14, fontFamily: "Dosis-SemiBold", color: "#3B82F6" }}>{formatPrice(item.unit_price)}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4 }}>
                    <TouchableOpacity onPress={() => handleQty(item.food_id, -1)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "white", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="remove" size={18} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={{ width: 36, textAlign: "center", fontFamily: "Dosis-Bold", fontSize: 16, color: "#1F2937" }}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => handleQty(item.food_id, 1)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#B53325", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.food_id)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {items.length === 0 && (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Ionicons name="cart-outline" size={40} color="#D1D5DB" />
                </View>
                <Text style={{ fontSize: 18, fontFamily: "Dosis-Bold", color: "#9CA3AF" }}>Pedido vacío</Text>
                <Text style={{ fontSize: 14, fontFamily: "Dosis-Medium", color: "#D1D5DB", marginTop: 4 }}>Añade algo del menú</Text>
              </View>
            )}
          </ScrollView>
        )}

        {!showMenu && items.length > 0 && (
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", padding: 24, paddingBottom: Math.max(insets.bottom, 24), borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Dosis-Medium", color: "#9CA3AF" }}>Nuevo total</Text>
              <Text style={{ fontSize: 26, fontFamily: "Dosis-Bold", color: "#B53325" }}>{formatPrice(total)}</Text>
            </View>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: saving ? "#D1D5DB" : "#B53325", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
              {saving ? <ActivityIndicator size="small" color="white" /> : (
                <>
                  <Text style={{ color: "white", fontFamily: "Dosis-Bold", fontSize: 18 }}>Guardar</Text>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

// =============================================
// PESTAÑA: PEDIDOS RECIENTES
// =============================================
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: "Pendiente", color: "#92400E", bg: "#FEF3C7", icon: "time-outline" },
  PAID: { label: "Pagado", color: "#1E40AF", bg: "#DBEAFE", icon: "card-outline" },
  READY: { label: "Listo", color: "#5B21B6", bg: "#EDE9FE", icon: "restaurant-outline" },
  COMPLETED: { label: "Entregado", color: "#065F46", bg: "#D1FAE5", icon: "checkmark-done-circle-outline" },
  CANCELLED: { label: "Cancelado", color: "#991B1B", bg: "#FEE2E2", icon: "close-circle-outline" },
};

export function RecentOrdersTab({ localId }: { localId: string }) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; orderId: string; status: OrderStatus; title: string; message: string; type: any } | null>(null);

  const { data: ordersRes, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["local-orders", localId],
    queryFn: () => getLocalOrders(localId),
    enabled: !!localId,
  });

  const orders = (ordersRes?.data as Order[]) || [];

  const handleStatusChange = (orderId: string, status: OrderStatus, label: string) => {
    setConfirmModal({
      visible: true,
      orderId,
      status,
      title: status === "CANCELLED" ? "Anular Pedido" : "Entregar Pedido",
      message: status === "CANCELLED" ? "¿Seguro que deseas cancelar esta orden? Esta acción no se puede deshacer." : "¿Confirmas que el pedido ya fue entregado al cliente?",
      type: status === "CANCELLED" ? "destructive" : "success"
    });
  };

  const executeStatusChange = async () => {
    if (!confirmModal) return;
    const { orderId, status } = confirmModal;
    setConfirmModal(null);
    setActionLoading(orderId);
    const res = await updateOrderStatus(localId, orderId, status);
    setActionLoading(null);
    if (res.success) queryClient.invalidateQueries({ queryKey: ["local-orders", localId] });
  };

  if (isLoading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color="#B53325" /></View>;

  return (
    <>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#B53325" />}
        contentContainerStyle={{ padding: 20, paddingBottom: Math.max(insets.bottom, 40) }}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        renderItem={({ item: order }) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
          const isTerminal = order.status === "COMPLETED" || order.status === "CANCELLED";
          const loading = actionLoading === order.id;
          const displayId = order.short_code || order.id.slice(-6).toUpperCase();
          
          return (
            <View style={{ backgroundColor: "white", borderRadius: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: "#F3F4F6", overflow: "hidden" }}>
              <View style={{ padding: 20 }}>
                {/* Ticket & Badge */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="ticket-outline" size={18} color="#B53325" />
                      <Text style={{ fontSize: 20, fontFamily: "Dosis-Bold", color: "#1F2937" }}>
                        Ticket {displayId}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: "Dosis-Medium", color: "#9CA3AF", marginTop: 2, marginLeft: 24 }}>
                      {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                    {order.notes ? (
                      <View style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 8, alignSelf: "flex-start", marginLeft: 24 }}>
                        <Text style={{ fontSize: 13, fontFamily: "Dosis-Bold", color: "#4B5563" }}>📝 {order.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={{ color: cfg.color, fontSize: 12, fontFamily: "Dosis-Bold", textTransform: "uppercase" }}>{cfg.label}</Text>
                  </View>
                </View>

                {/* Items Summary */}
                <View style={{ backgroundColor: "#F9FAFB", borderRadius: 16, padding: 12, marginBottom: 16 }}>
                  {order.order_items?.map((oi) => (
                    <View key={oi.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                      <Text style={{ fontSize: 14, fontFamily: "Dosis-Medium", color: "#4B5563", flex: 1 }} numberOfLines={1}>
                        <Text style={{ fontFamily: "Dosis-Bold", color: "#1F2937" }}>{oi.quantity}x</Text> {oi.food?.name}
                      </Text>
                      <Text style={{ fontSize: 14, fontFamily: "Dosis-SemiBold", color: "#1F2937", marginLeft: 8 }}>{formatPrice(oi.subtotal)}</Text>
                    </View>
                  ))}
                </View>

                {/* Total & Actions */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View>
                    <Text style={{ fontSize: 12, fontFamily: "Dosis-Medium", color: "#9CA3AF" }}>Total cobrado</Text>
                    <Text style={{ fontSize: 24, fontFamily: "Dosis-Bold", color: "#B53325" }}>{formatPrice(order.total)}</Text>
                  </View>

                  {!isTerminal && (
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity onPress={() => setEditingOrder(order)} disabled={loading} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="create-outline" size={22} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleStatusChange(order.id, "COMPLETED", "Entregada")} disabled={loading} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center" }}>
                        {loading ? <ActivityIndicator size="small" color="#22C55E" /> : <Ionicons name="checkmark-done" size={22} color="#22C55E" />}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleStatusChange(order.id, "CANCELLED", "Anulada")} disabled={loading} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {confirmModal && (
        <CustomConfirmModal 
          visible={confirmModal.visible}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={executeStatusChange}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {editingOrder && (
        <EditOrderModal 
          order={editingOrder} 
          localId={localId} 
          onClose={() => setEditingOrder(null)} 
          onSaved={() => { 
            setEditingOrder(null); 
            queryClient.invalidateQueries({ queryKey: ["local-orders", localId] }); 
          }} 
        />
      )}
    </>
  );
}

// =============================================
// PESTAÑA: NUEVA ORDEN (DETERMINISTIC UI)
// =============================================
export function NewOrderTab({ localId, onOrderCreated, qrPayload }: { localId: string; onOrderCreated: () => void; qrPayload?: string }) {
  const insets = useSafeAreaInsets();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [loadedQrPayload, setLoadedQrPayload] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["local", localId],
    queryFn: () => getLocalById(localId),
    enabled: !!localId,
  });
  const localData = response?.data as Local | undefined;
  const router = useRouter();

  // 1. Detectar si el QR escaneado es una orden ya pagada / existente en base de datos
  const scannedOrder = useMemo(() => {
    if (!qrPayload) return null;
    try {
      const parsed = JSON.parse(qrPayload);
      if (parsed && parsed.t === "order" && parsed.oi !== "create") {
        return parsed; // parsed: { t: "order", oi: "orderId", l: "localId", u: "userId", i: [...], c: "shortCode" }
      }
    } catch (e) {
      console.log("Error parsing scannedOrder in useMemo", e);
    }
    return null;
  }, [qrPayload]);

  useEffect(() => {
    if (localData && qrPayload && loadedQrPayload !== qrPayload) {
      try {
        const parsed = JSON.parse(qrPayload);
        
        let itemsArray: { id: string; q: number }[] = [];
        let isExistingOrder = false;
        
        if (Array.isArray(parsed)) {
          itemsArray = parsed;
        } else if (parsed && parsed.t === "order") {
          if (parsed.oi !== "create") {
            isExistingOrder = true;
          } else {
            itemsArray = parsed.i || [];
          }
        }
        
        if (isExistingOrder) {
          // Si es una orden existente, marcamos el payload como cargado para que se renderice la UI especial
          setLoadedQrPayload(qrPayload);
        } else if (itemsArray.length > 0) {
          const newCart: CartItem[] = [];
          
          itemsArray.forEach(item => {
            let foundFood: Food | undefined;
            localData.categories?.forEach(cat => {
              const f = cat.foods?.find(food => food.id === item.id);
              if (f) foundFood = f;
            });
            
            if (foundFood) {
              newCart.push({ food: foundFood, quantity: item.q });
            }
          });
          
          if (newCart.length > 0) {
            setCart(newCart);
            setLoadedQrPayload(qrPayload);
            // Limpiamos el payload de los params de la ruta para que no se recargue al cambiar de tab
            router.setParams({ qrPayload: "" });
          }
        }
      } catch (e) {
         console.log("Error parsing qrPayload", e);
      }
    }
  }, [localData, qrPayload, loadedQrPayload, router]);

  const handleAdd = (food: Food) => {
    setCart((prev) => {
      const existing = prev.find(i => i.food.id === food.id);
      if (existing) return prev.map(i => i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { food, quantity: 1 }];
    });
  };

  const handleRemove = (foodId: string) => {
    setCart((prev) => {
      const existing = prev.find(i => i.food.id === foodId);
      if (existing && existing.quantity > 1) return prev.map(i => i.food.id === foodId ? { ...i, quantity: i.quantity - 1 } : i);
      return prev.filter(i => i.food.id !== foodId);
    });
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.food.price * item.quantity), 0);

  const handleSubmit = async () => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    const result = await createManualOrder(localId, cart.map(i => ({ food_id: i.food.id, quantity: i.quantity })), notes);
    setSubmitting(false);
    if (result.success) {
      setNotes("");
      setCart([]);
      onOrderCreated();
    }
  };

  const filteredCategories = localData?.categories?.map(cat => ({
    ...cat,
    foods: cat.foods?.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.foods && cat.foods.length > 0);

  if (isLoading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" color="#B53325" /></View>;

  // RENDERIZADO 1: VISTA DE DETALLES DE ORDEN EXISTENTE (MARCAR COMO LISTA / COMPLETADA)
  if (scannedOrder) {
    const itemsToShow = (scannedOrder.i || []).map((item: any) => {
      let foundFood: Food | undefined;
      localData?.categories?.forEach((cat) => {
        const f = cat.foods?.find((food) => food.id === item.id);
        if (f) foundFood = f;
      });
      return {
        food: foundFood || { id: item.id, name: `Producto #${item.id}`, price: 0, image_url: "" },
        quantity: item.q,
      };
    });

    const handleUpdateStatus = async (status: "READY" | "COMPLETED") => {
      setSubmitting(true);
      try {
        const res = await updateOrderStatus(localId, scannedOrder.oi, status);
        if (res.success) {
          toast.success(
            "Estado Actualizado",
            `El pedido se marcó como ${status === "READY" ? "LISTO" : "ENTREGADO"}.`
          );
          onOrderCreated(); // Invalida queries de órdenes del local y vuelve a "Pedidos Recientes"
          router.setParams({ qrPayload: "" }); // Restablece el tab
        } else {
          toast.error("Error", res.message || "No se pudo actualizar el estado del pedido.");
        }
      } catch (err: any) {
        console.error("Error actualizando estado del pedido:", err);
        toast.error("Error", err.message || "Ocurrió un error al actualizar el pedido.");
      } finally {
        setSubmitting(false);
      }
    };

    const handleDismiss = () => {
      router.setParams({ qrPayload: "" });
    };

    return (
      <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          {/* Tarjeta de Resumen de Pedido */}
          <View style={{ backgroundColor: "white", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, marginBottom: 20, alignItems: "center" }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Ionicons name="receipt-outline" size={32} color="#0284c7" />
            </View>

            <Text style={{ fontSize: 22, fontFamily: "Dosis-Bold", color: "#1F2937" }}>Pedido Existente</Text>
            <Text style={{ fontSize: 14, fontFamily: "Dosis-Medium", color: "#6B7280", marginTop: 4 }}>ID: {scannedOrder.oi}</Text>

            {scannedOrder.c && (
              <View style={{ backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16, alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontFamily: "Dosis-Medium", color: "#6B7280", textTransform: "uppercase" }}>Código de Retiro</Text>
                <Text style={{ fontSize: 32, fontFamily: "Dosis-Bold", color: "#B53325", marginTop: 4, letterSpacing: 1 }}>{scannedOrder.c}</Text>
              </View>
            )}
          </View>

          {/* Lista de Alimentos */}
          <Text style={{ fontSize: 16, fontFamily: "Dosis-Bold", color: "#4B5563", marginBottom: 12, marginLeft: 4 }}>Productos del Pedido</Text>
          <View style={{ backgroundColor: "white", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, padding: 16, gap: 16 }}>
            {itemsToShow.map((item: any, idx: number) => (
              <View key={item.food.id || idx} style={{ flexDirection: "row", alignItems: "center" }}>
                {item.food.image_url ? (
                  <Image source={{ uri: item.food.image_url }} style={{ width: 48, height: 48, borderRadius: 12 }} />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="fast-food-outline" size={20} color="#9CA3AF" />
                  </View>
                )}
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={{ fontSize: 15, fontFamily: "Dosis-Bold", color: "#1F2937" }}>{item.food.name}</Text>
                  <Text style={{ fontSize: 13, fontFamily: "Dosis-Medium", color: "#6B7280", marginTop: 2 }}>Cantidad: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Acciones */}
        <View style={{ padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: "white", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 8, gap: 12 }}>
          <TouchableOpacity
            disabled={submitting}
            onPress={() => handleUpdateStatus("READY")}
            style={{ backgroundColor: "#10B981", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
          >
            {submitting ? <ActivityIndicator size="small" color="white" /> : (
              <>
                <Ionicons name="restaurant-outline" size={20} color="white" />
                <Text style={{ color: "white", fontSize: 16, fontFamily: "Dosis-Bold" }}>Marcar como Listo</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            disabled={submitting}
            onPress={() => handleUpdateStatus("COMPLETED")}
            style={{ backgroundColor: "#3B82F6", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 }}
          >
            {submitting ? <ActivityIndicator size="small" color="white" /> : (
              <>
                <Ionicons name="checkmark-done" size={20} color="white" />
                <Text style={{ color: "white", fontSize: 16, fontFamily: "Dosis-Bold" }}>Entregar / Completar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDismiss}
            style={{ height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ color: "#6B7280", fontSize: 15, fontFamily: "Dosis-Bold" }}>Volver al Menú</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // RENDERIZADO 2: CREACIÓN DE ORDEN MANUAL / MODIFICACIÓN DE ELEMENTOS
  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 20, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}>
        <View style={{ backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", height: 52 }}>
          <Ionicons name="search" size={22} color="#9CA3AF" />
          <TextInput 
            placeholder="Buscar en el menú..." 
            style={{ flex: 1, marginLeft: 10, fontFamily: "Dosis-Medium", fontSize: 17 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: cart.length > 0 ? 220 : 140 }}>
        {filteredCategories?.map(cat => (
          <View key={cat.id} style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontFamily: "Dosis-Bold", color: "#1F2937", marginBottom: 12, marginLeft: 4 }}>{cat.name}</Text>
            <View style={{ backgroundColor: "white", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
              {cat.foods?.map((food, idx) => {
                const qty = cart.find(i => i.food.id === food.id)?.quantity || 0;
                return (
                  <View key={food.id} style={{ padding: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: idx === cat.foods!.length - 1 ? 0 : 1, borderBottomColor: "#F9FAFB" }}>
                    {food.image_url ? (
                      <Image source={{ uri: food.image_url }} style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#F3F4F6" }} />
                    ) : (
                      <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="fast-food-outline" size={28} color="#D1D5DB" />
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text style={{ fontSize: 16, fontFamily: "Dosis-Bold", color: "#1F2937" }} numberOfLines={1}>{food.name}</Text>
                      <Text style={{ fontSize: 15, fontFamily: "Dosis-SemiBold", color: "#3B82F6", marginTop: 2 }}>{formatPrice(food.price)}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4 }}>
                      <TouchableOpacity onPress={() => handleRemove(food.id)} disabled={qty === 0} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: qty > 0 ? "white" : "transparent", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="remove" size={18} color={qty > 0 ? "#1F2937" : "#D1D5DB"} />
                      </TouchableOpacity>
                      <Text style={{ width: 32, textAlign: "center", fontFamily: "Dosis-Bold", fontSize: 16, color: "#1F2937" }}>{qty}</Text>
                      <TouchableOpacity onPress={() => handleAdd(food)} style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#B53325", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="add" size={18} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {cart.length > 0 && (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", padding: 24, paddingBottom: Math.max(insets.bottom, 24), borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10, flexDirection: "column" }}>
          
          {/* Notas Opcionales */}
          <View style={{ backgroundColor: "#F3F4F6", borderRadius: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", height: 48, marginBottom: 16 }}>
            <Ionicons name="document-text-outline" size={20} color="#9CA3AF" />
            <TextInput 
              placeholder="(opcional) número de mesa" 
              placeholderTextColor="#6B7280"
              style={{ flex: 1, marginLeft: 10, fontFamily: "Dosis-Medium", fontSize: 16, color: "#1F2937" }}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: "Dosis-Medium", color: "#9CA3AF" }}>Total orden</Text>
              <Text style={{ fontSize: 26, fontFamily: "Dosis-Bold", color: "#B53325" }}>{formatPrice(totalPrice)}</Text>
            </View>
            <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ backgroundColor: submitting ? "#D1D5DB" : "#B53325", paddingVertical: 16, paddingHorizontal: 32, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8 }}>
              {submitting ? <ActivityIndicator size="small" color="white" /> : (
                <>
                  <Text style={{ color: "white", fontFamily: "Dosis-Bold", fontSize: 18 }}>Confirmar</Text>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
