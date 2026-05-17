import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import ScannerView from "@/components/features/qr/ScannerView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGlobalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useQRParser } from "@/utils/qr";

export default function QRScannerScreen() {
  const [isScanning, setIsScanning] = useState(true);
  const { local_id } = useGlobalSearchParams();
  const router = useRouter();
  const { parseQR } = useQRParser();

  // Resetear el escáner al volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
    }, [])
  );

  const handleScan = (data: string) => {
    setIsScanning(false);
    
    const result = parseQR(data);
    
    if (!result.success) {
      Alert.alert("Error al escanear", result.error, [
        { text: "OK", onPress: () => setIsScanning(true) }
      ]);
      return;
    }

    if (result.type === "order") {
      // Es un código QR de orden, navegamos a la pantalla de órdenes pasando el payload
      router.push({
        pathname: `/(staff)/local/${local_id}/orders`,
        params: { tab: 'new', qrPayload: JSON.stringify(result.data.i) }
      });
    } else {
      Alert.alert("Formato Incorrecto", "Este código QR no corresponde a un pedido.");
      setIsScanning(true);
    }
  };

  const handleClose = () => {
    // Si necesitas manejar el cierre
    setIsScanning(false);
  };

  return (
    <View style={styles.container}>
      {isScanning ? (
        <ScannerView
          onScan={handleScan}
          onClose={handleClose}
          isScanningEnabled={isScanning}
          permissionType="QR_STAFF"
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Apunta a un código QR</Text>
          </View>
        </ScannerView>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>Cámara pausada</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "transparent",
    borderRadius: 16,
    marginBottom: 20,
  },
  scanText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Dosis-Medium",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
  },
  placeholderText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Dosis-SemiBold",
  }
});
