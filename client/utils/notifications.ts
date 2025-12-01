import * as Notifications from "expo-notifications";

export async function configureNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    console.log("Permiso de notificaciones denegado");
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}