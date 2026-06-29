import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Toast, { ToastConfigParams } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  title?: string;
  message?: string;
  type: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ title, message, type, onClose }) => {
  const config = {
    success: {
      bgColor: '#F0F9EB',
      borderColor: '#C2E7B0',
      iconBg: '#67C23A',
      iconName: 'checkmark-outline' as const,
      defaultTitle: 'Congratulations!',
    },
    info: {
      bgColor: '#ECF5FF',
      borderColor: '#DCDFE6',
      iconBg: '#409EFF',
      iconName: 'bulb-outline' as const,
      defaultTitle: 'Did you know?',
    },
    warning: {
      bgColor: '#FDF6EC',
      borderColor: '#F5DAB1',
      iconBg: '#E6A23C',
      iconName: 'warning-outline' as const,
      defaultTitle: 'Warning!',
    },
    error: {
      bgColor: '#FEF0F0',
      borderColor: '#FDE2E2',
      iconBg: '#F56C6C',
      iconName: 'close-outline' as const,
      defaultTitle: 'Something went wrong!',
    },
  }[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
      {/* Icono Redondo */}
      <View style={[styles.iconContainer, { backgroundColor: config.iconBg }]}>
        <Ionicons name={config.iconName} size={15} color="#FFF" />
      </View>

      {/* Textos */}
      <View style={styles.textContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title || config.defaultTitle}
        </Text>
        {!!message && (
          <Text style={styles.messageText} numberOfLines={2}>
            {message}
          </Text>
        )}
      </View>

      {/* Botón de Cerrar */}
      <TouchableOpacity onPress={onClose} activeOpacity={0.6} style={styles.closeButton}>
        <Ionicons name="close" size={18} color="#909399" />
      </TouchableOpacity>
    </View>
  );
};

export const toastConfig = {
  success: ({ text1, text2 }: ToastConfigParams<any>) => (
    <CustomToast
      type="success"
      title={text1}
      message={text2}
      onClose={() => Toast.hide()}
    />
  ),
  info: ({ text1, text2 }: ToastConfigParams<any>) => (
    <CustomToast
      type="info"
      title={text1}
      message={text2}
      onClose={() => Toast.hide()}
    />
  ),
  warning: ({ text1, text2 }: ToastConfigParams<any>) => (
    <CustomToast
      type="warning"
      title={text1}
      message={text2}
      onClose={() => Toast.hide()}
    />
  ),
  error: ({ text1, text2 }: ToastConfigParams<any>) => (
    <CustomToast
      type="error"
      title={text1}
      message={text2}
      onClose={() => Toast.hide()}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    minHeight: 65,
    gap: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  titleText: {
    fontSize: 13,
    color: '#2F2F2F',
    fontFamily: 'Outfit-Bold',
  },
  messageText: {
    fontSize: 11,
    color: '#707070',
    lineHeight: 16,
    fontFamily: 'Outfit-Light',
  },
  closeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
