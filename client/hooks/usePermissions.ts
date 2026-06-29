import { useAuth } from "@/context/auth/AuthContext";
import { useMemo } from "react";

export function usePermissions(lID?: string, oUID?: string) {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    const userWorkplaceIds = user?.workplaces?.map((w) => w.id) || [];

    const isStaff = Boolean(
      user?.is_business && lID && userWorkplaceIds.includes(lID)
    );

    const isCustomer = Boolean(user?.id && oUID && user.id === oUID);

    return {
      isStaff,
      isCustomer,
    };
  }, [user, lID, oUID]);

  return permissions;
}