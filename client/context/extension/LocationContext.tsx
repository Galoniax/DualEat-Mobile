import React, { useState, useEffect, createContext, useContext } from "react";
import * as Location from "expo-location";

interface LocationContextType {
  location: Location.LocationObject | null;
  setLocation: (location: Location.LocationObject | null) => void;
  clearLocation: () => void;
  updateLocation: () => void;
  address: CustomAddress | null;
}

interface CustomAddress {
  street: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
}

const LocationContext = createContext<LocationContextType | null>(null);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [address, setAddress] = useState<CustomAddress | null>(null);

  const clearLocation = () => {
    setLocation(null);
    setAddress(null);
  };

  async function getCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);

    try {
      const addressResponse = await Location.reverseGeocodeAsync(loc.coords);
      if (addressResponse.length > 0) {
        const { street, city, country, region } = addressResponse[0];
        setAddress({ street, city, country, region });
      }
    } catch (e) {
      console.log("No se pudo traducir la ubicación");
      console.log(e);
    }
  }

  const updateLocation = () => getCurrentLocation();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, setLocation, clearLocation, address, updateLocation }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation debe usarse dentro de LocationProvider");
  }
  return context;
};
