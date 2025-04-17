import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Feather } from "@expo/vector-icons";
import AddTaskModal from "@/components/modals/AddTaskModal";

export default function MapViewComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setErrorMsg('Could not fetch location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, isFullscreen && styles.fullscreenMapContainer]}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description="Your current location"
            />
          </MapView>
        ) : (
          <View style={styles.center}>
            <Text style={styles.loadingText}>No location data available</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.fullscreenButton}
          onPress={() => setIsFullscreen(!isFullscreen)}
        >
          <Feather name={isFullscreen ? "minimize" : "maximize"} size={22} color="black" />
        </TouchableOpacity>
      </View>
      
      {!isFullscreen && (
        <View style={styles.ctaContainer}>
          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={() => setIsAddTaskModalVisible(true)}
          >
            <Text style={styles.addTaskButtonText}>Add New Task</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <AddTaskModal 
        isVisible={isAddTaskModalVisible} 
        onClose={() => setIsAddTaskModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',

  },
  fullscreenMapContainer: {
    padding: 0,
    borderRadius: 0,
    flex: 1, 
  },
  map: {
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ctaContainer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  addTaskButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  addTaskButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});