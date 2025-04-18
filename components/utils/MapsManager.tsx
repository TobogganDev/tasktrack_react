import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  Animated,
  Platform,
  Image
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Feather } from "@expo/vector-icons";
import AddTaskModal from "@/components/modals/AddTaskModal";
import { useTasksContext } from "@/context/TasksContext";
import { Task } from "@/types/Task";

interface Coordinates {
  latitude: number;
  longitude: number;
}

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

export default function MapViewComponent() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const panelHeight = useRef(new Animated.Value(0)).current;
  const [mapReady, setMapReady] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const { tasks, fetchTasks } = useTasksContext();
  
  const tasksWithLocation = tasks.filter(task => {
    const coords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
    return coords !== null;
  });

  useEffect(() => {
    fetchTasks();
    getUserLocation();
  }, []);
  
  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: selectedTask ? 150 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [selectedTask]);

  const getUserLocation = async () => {
    try {
      setLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          "Location Permission Required",
          "This app needs access to your location to show you on the map. Please grant location permission in your device settings.",
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
        setLoading(false);
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      console.error("Error getting location:", error);
      setErrorMsg('Could not fetch location');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (task: Task) => {
    setSelectedTask(task);
    
    const coords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    }
  };
  
  const closeTaskPanel = () => {
    setSelectedTask(null);
  };
  
  const centerMapOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    }
  };
  
  const onMapReady = () => {
    setMapReady(true);
    console.log("Map is ready. Task count with location:", tasksWithLocation.length);
    
    tasksWithLocation.forEach((task, index) => {
      const coords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
      console.log(`Task ${index} (${task.id}): ${task.title} - Coords:`, coords);
    });
  };

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
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={getUserLocation}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, isFullscreen && styles.fullscreenMapContainer]}>
        {location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.0222,
              longitudeDelta: 0.0121,
            }}
            onMapReady={onMapReady}
          >
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You are here"
              description="Your current location"
              pinColor="blue"
            />
            
            {mapReady && tasksWithLocation.map(task => {
              const coords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
              if (!coords) return null;
              
              return (
                <Marker
                  key={`task-${task.id}`}
                  coordinate={coords}
                  title={task.title}
                  description={task.description || "No description"}
                  onPress={() => handleMarkerPress(task)}
                  pinColor="red"
                >
                  <Callout tooltip>
                    <View style={styles.calloutContainer}>
                      <Text style={styles.calloutTitle}>{task.title}</Text>
                      {task.description && (
                        <Text style={styles.calloutDescription} numberOfLines={2}>
                          {task.description}
                        </Text>
                      )}
                      <Text style={styles.calloutHint}>Tap to view details</Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>
        ) : (
          <View style={styles.center}>
            <Text style={styles.loadingText}>No location data available</Text>
          </View>
        )}
        
        <View style={styles.mapButtonsContainer}>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => setIsFullscreen(!isFullscreen)}
          >
            <Feather name={isFullscreen ? "minimize" : "maximize"} size={22} color="black" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={centerMapOnUser}
          >
            <Feather name="navigation" size={22} color="black" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => {
              fetchTasks();
            }}
          >
            <Feather name="refresh-cw" size={22} color="black" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tasksCountContainer}>
          <Text style={styles.tasksCountText}>
            {tasksWithLocation.length} task{tasksWithLocation.length !== 1 ? 's' : ''} on map
          </Text>
        </View>
      </View>
      
      <Animated.View 
        style={[
          styles.taskPanel, 
          { height: panelHeight }
        ]}
      >
        {selectedTask && (
          <View style={styles.taskPanelContent}>
            <View style={styles.taskPanelHeader}>
              <Text style={styles.taskPanelTitle} numberOfLines={1}>
                {selectedTask.title}
              </Text>
              <TouchableOpacity onPress={closeTaskPanel}>
                <Feather name="x" size={20} color="black" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.taskPanelDescription} numberOfLines={2}>
              {selectedTask.description || "No description provided"}
            </Text>
            
            {selectedTask.created_at && (
              <Text style={styles.taskPanelDate}>
                Created: {new Date(selectedTask.created_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}
      </Animated.View>
      
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
        onClose={() => {
          setIsAddTaskModalVisible(false);
          fetchTasks();
        }} 
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapButtonsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
    gap: 8,
  },
  mapButton: {
    backgroundColor: 'white',
    borderRadius: 8,
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
  
  taskPanel: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  taskPanelContent: {
    padding: 16,
  },
  taskPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskPanelTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  taskPanelDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  taskPanelDate: {
    fontSize: 12,
    color: '#999',
  },
  
  calloutContainer: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutHint: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  
  tasksCountContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  tasksCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});
