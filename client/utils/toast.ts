import Toast from "react-native-toast-message";

export const showToast = (
  type: "success" | "error" | "info",
  message: string,
  title?: string,
) => {
  Toast.show({
    type,
    text1:
      title ??
      (type === "success"
        ? "Éxito"
        : type === "error"
          ? "Error"
          : "Información"),
    text2: message,
    position: "top",
    autoHide: true,
    visibilityTime: 3000,
    swipeable: true,
  });
};