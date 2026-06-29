import Toast from "react-native-toast-message";

export const globalToast = {
  success(title: string, message?: string, duration: number = 4000) {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  },

  error(title: string, message?: string, duration: number = 4000) {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  },

  info(title: string, message?: string, duration: number = 4000) {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  },

  warning(title: string, message?: string, duration: number = 4000) {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: duration,
      autoHide: true,
    });
  },

  hide() {
    Toast.hide();
  }
};

export const showToast = globalToast.success;
export default globalToast;