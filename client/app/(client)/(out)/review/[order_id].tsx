import { useAuth } from "@/context/auth/AuthContext";
import { Order } from "@/interface/global";
import { getOrderById } from "@/services/order.api";

import { formatPrice } from "@/utils/distance";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StarRating from "react-native-star-rating-widget";
import { ReviewDTO } from "@/interface/global.dto";
import { createReview, updateReview } from "@/services/review.api";
import { globalToast as toast } from "@/utils/toast";
import { ErrorView } from "@/components/ui/feedback/ErrorView";

export default function ReviewScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { order_id } = useLocalSearchParams<{ order_id: string }>();

  const { user } = useAuth();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order-id", order_id],

    enabled: !!order_id,
    queryFn: async () => {
      if (!order_id)
        throw new Error("No se proporciono un id de orden", { cause: 400 });

      const response = await getOrderById(order_id);

      if (!response.success) {
        throw new Error(response.message || "Error al obtener la orden", {
          cause: response.status,
        });
      }

      return response.data as Order;
    },
  });

  const isEditing = !!order?.review;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [votes, setVotes] = useState<Record<string, "UP" | "DOWN" | null>>({});

  useEffect(() => {
    if (order?.review) {
      setRating(order.review.rating);
      setComment(order.review.comment || "");
    }
  }, [order]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const dto: ReviewDTO = {
        order_id: order?.id!,
        rating,
        comment,
        votes: Object.entries(votes)
          .filter(([_, type]) => type !== null)
          .map(([food_id, type]) => ({
            id: food_id,
            type: type as "UP" | "DOWN",
          })),
      };

      const response =
        isEditing && order?.review?.id
          ? await updateReview(order.review.id, dto)
          : await createReview(dto);

      if (!response.success) {
        throw new Error(response.message || "Error al procesar la reseña");
      }

      return response;
    },
    onSuccess(data) {
      queryClient.invalidateQueries({ queryKey: ["order-id", order_id] });
      toast.success(
        data?.message || "Reseña enviada correctamente",
        "Su reseña ya ha sido notificada en el local",
      );
      router.back();
    },
    onError(err: any) {
      toast.error("Error al enviar reseña", err.message);
    },
  });

  const handleVote = (food_id: string, type: "UP" | "DOWN") => {
    setVotes((prev) => ({
      ...prev,
      [food_id]: prev[food_id] === type ? null : type,
    }));
  };

  const handleSubmit = () => {
    if (rating === 0 || rating < 1 || rating > 5) {
      toast.error("Error", "La reseña debe tener una puntuación");
      return;
    }

    if (!order) {
      toast.error("Error", "No hay orden para calificar");
      return;
    }

    if (order.status !== "COMPLETED") {
      toast.error(
        "Estado de orden",
        "Solo se pueden dejar reseñas en ordenes completadas",
      );
      return;
    }

    mutate();
  };

  const isOwner = useMemo(() => {
    if (!user) return false;
    return order?.user_id === user.id;
  }, [user, order]);

  const header = (
    <View className="flex-col gap-y-4 mb-6">
      <View
        style={{
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderColor: "#cbd5e0",
          borderStyle: "dashed",
        }}
        className="justify-start gap-y-5 pb-6"
      >
        <View className="flex-col gap-y-1">
          <Text className="font-outfit-bold text-xl text-text-3">
            {isEditing
              ? `Edita tu reseña de ${order?.local.name}`
              : `Califica la experiencia en ${order?.local.name}`}
          </Text>
          <Text className="font-outfit-light text-base text-text-6">
            Comparte tu experiencia con otros usuarios
          </Text>
        </View>

        <StarRating
          rating={rating}
          onChange={setRating}
          color="#2F2F2F"
          emptyColor="#707070"
          starSize={30}
          step={"full"}
          maxStars={5}
          StarIconComponent={(iconProps) => {
            const name = iconProps.type === "empty" ? "star-o" : "star";
            return (
              <FontAwesome
                name={name}
                size={iconProps.size}
                color={iconProps.color}
              />
            );
          }}
        />

        <TextInput
          placeholder="Escribe tu reseña (opcional)"
          placeholderTextColor="#707070"
          multiline
          maxLength={400}
          numberOfLines={5}
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
          className="border border-dotted border-gray-300 bg-white rounded-xl px-3.5 py-3 mt-2 font-outfit-light text-base text-text-5 min-h-[90px] shadow-sm"
        />
      </View>

      {!isEditing && (
        <View className="flex-col gap-y-1">
          <Text className="text-xl text-text-3 font-outfit-bold">
            ¿Qué te pareció la comida?
          </Text>
          <Text className="font-outfit-light text-base text-text-6">
            Dale voto positivo o negativo a cada plato de tu orden
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-bg-semi-white justify-center items-center">
        <ActivityIndicator size="large" color="#B53325" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <ErrorView
        type={error.cause || 404}
        title="Error al obtener la orden"
        message="La orden que estás buscando no existe o ha sido eliminada."
        onAction={() => router.back()}
        actionLabel="Volver"
      />
    );
  }

  return (
    <SafeAreaView
      edges={["bottom", "left", "right", "top"]}
      className="flex-1 bg-bg-semi-white px-4 flex-col justify-between py-2"
    >
      <View className="flex-row items-center justify-start w-full py-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 flex items-center justify-center"
        >
          <Entypo name="chevron-small-left" size={32} color="#2F2F2F" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={order?.order_items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={
          !isEditing
            ? ({ item }) => {
                const isUp = votes[item.food.id] === "UP";
                const isDown = votes[item.food.id] === "DOWN";

                return (
                  <View className="flex-row items-start py-4">
                    {/* Detalles */}
                    <View className="flex-1 justify-center">
                      <View className="flex-row justify-between items-start">
                        <Text
                          className="font-outfit-bold text-lg text-text-3 flex-1 mr-2"
                          numberOfLines={1}
                        >
                          {item.food.name}
                        </Text>
                        <Text className="font-outfit-bold text-lg text-text-3">
                          {item.quantity}x
                        </Text>
                      </View>

                      {/* Precio en bold */}
                      <Text className="font-outfit-bold text-lg text-text-3 mt-0.5">
                        {formatPrice(item.subtotal)}
                      </Text>

                      {item.food.description ? (
                        <Text
                          className="font-outfit-light text-sm text-text-6 mt-1"
                          numberOfLines={2}
                        >
                          {item.food.description}
                        </Text>
                      ) : null}

                      <View className="flex-row items-center mt-3 self-start bg-[#F5F5F5] rounded-full p-0.5 border border-gray-200">
                        <TouchableOpacity
                          onPress={() => handleVote(item.food.id, "UP")}
                          className={`px-3 py-1.5 rounded-full flex-row items-center gap-x-1.5 ${
                            isUp ? "bg-green-100" : "bg-transparent"
                          }`}
                        >
                          <FontAwesome
                            name={isUp ? "thumbs-up" : "thumbs-o-up"}
                            size={14}
                            color={isUp ? "#059669" : "#707070"}
                          />
                          <Text
                            className={`font-outfit-bold text-xs ${isUp ? "text-green-700" : "text-text-5"}`}
                          >
                            Me gustó
                          </Text>
                        </TouchableOpacity>

                        <View className="w-[1px] h-3.5 bg-gray-300" />

                        <TouchableOpacity
                          onPress={() => handleVote(item.food.id, "DOWN")}
                          className={`px-3 py-1.5 rounded-full flex-row items-center gap-x-1.5 ${
                            isDown ? "bg-red-100" : "bg-transparent"
                          }`}
                        >
                          <FontAwesome
                            name={isDown ? "thumbs-down" : "thumbs-o-down"}
                            size={14}
                            color={isDown ? "#DC2626" : "#707070"}
                          />
                          <Text
                            className={`font-outfit-bold text-xs ${isDown ? "text-red-700" : "text-text-5"}`}
                          >
                            No me gustó
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }
            : null
        }
      />

      <TouchableOpacity
        disabled={isPending || !isOwner}
        onPress={handleSubmit}
        className="py-3 rounded-[5px] bg-bg-semi-black justify-center items-center"
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-base font-outfit-bold text-text-1">
            Enviar Reseña
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
