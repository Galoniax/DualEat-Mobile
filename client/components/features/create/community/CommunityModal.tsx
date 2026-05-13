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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  ref: React.RefObject<BottomSheetModal | null>;
  setCommunity: React.Dispatch<React.SetStateAction<Community | null>>;
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
    queryKey: ["communities", search],
    queryFn: async () => {
      if (!search.trim()) return [];
      const response = await getByName(search);
      return response.data as Community[];
    },
    enabled: search.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!search.trim()) return;

    const timeout = setTimeout(() => {
      refetch();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [search, refetch]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSearch("");
        ref.current?.dismiss();
      };
    }, [ref]),
  );

  const renderItem = useCallback(
    ({ item }: { item: CommunityMember }) => (
      <TouchableOpacity
        onPress={() => {
          setCommunity(item.community);
          ref.current?.dismiss();
        }}
        className="flex-row items-center justify-between px-6 py-3 border-b border-gray-200 gap-x-4"
      >
        {item.community.image_url ? (
          <Image
            style={{ flex: 1 }}
            className="max-h-10 max-w-10 rounded-full w-full h-full flex-shrink-0"
            source={{
              uri: item.community.image_url,
            }}
          />
        ) : (
          <View
            style={{ flex: 1 }}
            className="max-h-10 max-w-10 rounded-full w-full h-full flex-shrink-0 bg-bg-semi-black"
          />
        )}

        <View style={{ flex: 5 }} className="flex-col gap-y-0.5">
          <Text className="font-dosis-bold text-[14px] text-text-5">
            {item.community.name}
          </Text>
          <Text
            ellipsizeMode="tail"
            numberOfLines={2}
            className="font-dosis-regular text-[13px] text-text-5 truncate"
          >
            {item.community.description}
          </Text>
          <Text className="font-dosis-light text-[13px] text-text-5">
            {item.community.total_members} miembros
          </Text>

          {item.community.tags && item.community.tags.length > 0 && (
            <View className="flex-row gap-2">
              {item.community.tags.map((tag) => (
                <Text
                  key={tag.id}
                  className="font-dosis-regular text-[14px] text-text-5"
                >
                  {tag.name}
                </Text>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [ref, setCommunity],
  );

  const data = useMemo(() => {
    if (search.trim().length > 0) {
      if (!communities) return [];

      if (!Array.isArray(communities)) {
        return [communities];
      }

      return communities;
    }
    return myCommunities || [];
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
        ListHeaderComponent={
          <View
            style={{
              marginVertical: 16,
            }}
            className="items-center mx-6 px-4 py-0.5 justify-start flex-row border border-gray-200 rounded-full"
          >
            <TextInput
              className="flex-1 text-[16px] text-text-5 font-dosis-regular py-2"
              returnKeyType="search"
              placeholder="Buscar una comunidad"
              placeholderTextColor={"#4A4947"}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
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
              <Text className="text-gray-500 font-dosis-regular text-[16px]">
                {search.trim().length > 0
                  ? "No se encontraron comunidades."
                  : "No perteneces a ninguna comunidad."}
              </Text>
            )}
          </View>
        }
        renderItem={renderItem}
      />
    </BottomSheetModal>
  );
}
