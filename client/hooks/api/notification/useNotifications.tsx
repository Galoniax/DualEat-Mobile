import { useContext } from "react";
import { NotificationContext } from "@/context/other/NotificationsProvider";

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications debe usarse dentro de un NotificationsProvider",
    );
  return ctx;
};
