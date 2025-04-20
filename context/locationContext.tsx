import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as Location from 'expo-location';
import { Alert } from "react-native";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: Location.LocationObject | null;
  userCoordinates: Coordinates | null;
  errorMsg: string;
  loading: boolean;
  hasPermission: boolean;
  getCurrentLocation: (setAsCoordinates?: boolean) => Promise<Coordinates | null>;
  requestLocationPermission: () => Promise<boolean>;
  parsePointGeometry: (pointStr: string | null) => Coordinates | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<Coordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      const permissionGranted = status === 'granted';
      setHasPermission(permissionGranted);
      
      if (!permissionGranted) {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          "Location Permission Required",
          "This app needs access to your location to show you on the map. Please grant location permission in your device settings."
        );
      }
      
      return permissionGranted;
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setErrorMsg('Could not request location permission');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async (setAsCoordinates: boolean = true): Promise<Coordinates | null> => {
    try {
      setLoading(true);
      
      if (!hasPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          return null;
        }
      }
      
      const locationResult = await Location.getCurrentPositionAsync({});
      setLocation(locationResult);
      
      const coordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };
      
      if (setAsCoordinates) {
        setUserCoordinates(coordinates);
      }
      
      setErrorMsg('');
      return coordinates;
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg('Could not fetch location');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const parsePointGeometry = (pointStr: string | null): Coordinates | null => {
    if (!pointStr) return null;
    
    try {
      if (typeof pointStr === 'string' && pointStr.startsWith('POINT')) {
        const match = pointStr.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (match && match.length === 3) {
          const longitude = parseFloat(match[1]);
          const latitude = parseFloat(match[2]);
          
          if (!isNaN(longitude) && !isNaN(latitude)) {
            return { latitude, longitude };
          }
        }
      }
      
      if (typeof pointStr === 'string' && pointStr.startsWith('0101000020E6100000')) {
        const xHex = pointStr.substring(18, 34);
        const yHex = pointStr.substring(34, 50);
        
        const xBytes: number[] = [];
        const yBytes: number[] = [];
        
        for (let i = 0; i < 16; i += 2) {
          xBytes.push(parseInt(xHex.substring(i, i + 2), 16));
          yBytes.push(parseInt(yHex.substring(i, i + 2), 16));
        }
        
        const xBuffer = new ArrayBuffer(8);
        const yBuffer = new ArrayBuffer(8);
        const xView = new DataView(xBuffer);
        const yView = new DataView(yBuffer);
        
        for (let i = 0; i < 8; i++) {
          xView.setUint8(i, xBytes[7 - i]);
          yView.setUint8(i, yBytes[7 - i]);
        }
        
        const longitude = xView.getFloat64(0);
        const latitude = yView.getFloat64(0);
        
        if (!isNaN(longitude) && !isNaN(latitude) && 
            Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90) {
          return { latitude, longitude };
        }
      }
      return null;
    } catch (error) {
      console.error("Error parsing point geometry:", error);
      return null;
    }
  };

  useEffect(() => {
    requestLocationPermission().then(granted => {
      if (granted) {
        getCurrentLocation();
      }
    });
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        userCoordinates,
        errorMsg,
        loading,
        hasPermission,
        getCurrentLocation,
        requestLocationPermission,
        parsePointGeometry
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
