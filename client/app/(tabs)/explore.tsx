import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; // Para los íconos
import { useLocation } from '@/context/extension/LocationContext';



export default function MapScreen() {
  const mapRef = useRef(null);
  
  const { location } = useLocation();
  


;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        // ... (otras props como initialRegion)
      >
        {/* --- AQUÍ ESTÁ EL MARCADOR PERSONALIZADO --- */}
        <Marker
          coordinate={location}
        >
          {/* Este es el componente que se renderiza */}
          <View style={styles.customMarker}>
            <Ionicons name="people" size={16} color="#4A4A4A" />
            <Text style={styles.markerText}>1</Text>
          </View>
        </Marker>
      </MapView>

      {/* ... (Aquí van los botones) ... */}
    </View>
  );
};

// --- ESTILOS para el marcador ---
const styles = StyleSheet.create({
  // ... (tus otros estilos)
  customMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E0FF', // Un color violeta claro
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderColor: '#B3A1FF', // Borde violeta más oscuro
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  // ... (aquí van los estilos de los botones del paso 3)
});