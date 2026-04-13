import { useQuery } from "@tanstack/react-query";

import { getUserCommunities } from "@/services/community.api";
import { Community } from "@/interface/global";

export const useMyCommunities = () => {
  return useQuery({
    queryKey: ["myCommunities"],
    queryFn: async () => {
      const response = await getUserCommunities();

      return (response.data ?? []) as Community[];
    },
    staleTime: 1000 * 60 * 10,
  });
};
