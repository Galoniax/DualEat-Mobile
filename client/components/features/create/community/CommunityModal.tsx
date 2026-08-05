import { useMyCommunities } from "@/hooks/api/useMyCommunities";
import { Community, CommunityMember } from "@/interface/global";
import { getByName } from "@/services/community.api";
import { EvilIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  ref: React.RefObject<BottomSheetModal | null>;
  setCommunity: (community: Community | null) => void;
}

export default function CommunityModal({ ref, setCommunity }: Props) {
  const { data: myCommunities } = useMyCommunities();

  const [search, setSearch] = useState("");
  const snapPoint = useMemo(() => ["90%"], []);

  const {
    data: communities,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["communities", "search", search],

    queryFn: async () => {
      if (!search.trim()) return true;

      const response = await getByName(search);
      return response.data;
    },

    enabled: search.trim().length > 0,
    placeholderData: true,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (search.trim()) {
      refetch();
    }
  }, [search, refetch]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearch("");
      };
    }, []),
  );

  const renderItem = useCallback(
    ({ item }: { item: Community }) => {
      const isMember =
        myCommunities?.some(
          (cm: CommunityMember) => cm?.community_id === item.id,
        ) ?? false;

      return (
        <TouchableOpacity
          onPress={() => {
            setCommunity(item);
            ref.current?.dismiss();
          }}
          key={item.id}
          className="w-full flex flex-row items-center justify-start px-6 py-3 border-b border-gray-200 gap-x-4"
        >
          {item.image_url ? (
            <View  className="h-8 w-8 flex-shrink-0">
            <Image
              className="rounded-full w-full h-full object-cover"
              source={{
                uri: item.image_url,
              }}
              resizeMode="cover"
              alt={item.name}
            />
            </View>
          ) : (
            <View className="h-8 w-8 rounded-full flex-shrink-0 bg-bg-semi-black" />
          )}

          <View className="flex-1 flex-col gap-y-1 min-w-0 gap-y-0.5 text-left">
            <Text className="font-outfit-bold text-sm text-text-5 truncate">
              {item.name}
            </Text>
            <Text
              ellipsizeMode="tail"
              numberOfLines={2}
              className="font-outfit-light text-xs text-text-5 truncate"
            >
              {item.description}
            </Text>
            <Text className="font-dosis-light text-xs text-text-5">
              {item.total_members} miembros {isMember && " • Te uniste"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [ref, setCommunity, myCommunities],
  );

  const data = useMemo(() => {
    if (search.trim().length > 0) {
      if (!communities) return [];

      if (!Array.isArray(communities)) {
        return [communities];
      }

      return communities;
    }
    return (
      myCommunities?.map((community: CommunityMember) => community.community) ||
      []
    );
  }, [search, communities, myCommunities]);

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoint}
      style={{ flex: 1 }}
      enablePanDownToClose={true}
      enableOverDrag={true}
      enableDynamicSizing={false}
      handleIndicatorStyle={{
        backgroundColor: "#e5a657",
        width: 35,
        height: 4,
        borderRadius: 9999,
        marginTop: 5,
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetFlatList
        data={data}
        keyExtractor={(item: Community) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={renderItem}
        ListHeaderComponent={
          <View
            style={{
              marginVertical: 16,
            }}
            className="items-center mx-6 px-4 py-0.5 justify-start flex-row border border-gray-200 rounded-full"
          >
            <TextInput
              className="flex-1 text-base text-text-5 font-outfit-light py-2"
              returnKeyType="search"
              placeholder="Buscar una comunidad"
              placeholderTextColor={"#4A4947"}
              value={search}
              onSubmitEditing={({ nativeEvent }) => {
                setSearch(nativeEvent.text);
                Keyboard.dismiss();
              }}
            />
            <EvilIcons name="search" size={26} color="#4A4947" />
          </View>
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isFetching ? (
              <ActivityIndicator size={30} color="#e5a657" />
            ) : (
              <Text className="text-gray-500 font-outfit-light text-base">
                {search.trim().length > 0
                  ? "No se encontraron comunidades."
                  : "No perteneces a ninguna comunidad."}
              </Text>
            )}
          </View>
        }
      />
    </BottomSheetModal>
  );
}
