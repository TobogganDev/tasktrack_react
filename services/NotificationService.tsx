import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types/Task';

const LOCATION_TASK_NAME = 'background-location-task';
const PROXIMITY_THRESHOLD = 500;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c;
  return distance;
};

const parsePointGeometry = (pointStr: string | null): { latitude: number; longitude: number } | null => {
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

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error("Background location task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          return BackgroundFetch.BackgroundFetchResult.NoData;
        }
        
        const userId = session.session.user.id;
        
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .eq("done", false)
          .not("location", "is", null);
        
        if (error) {
          console.error("Error fetching tasks:", error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
        
        if (tasks && tasks.length > 0) {
          for (const task of tasks) {
            const taskCoords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
            
            if (taskCoords) {
              const distance = calculateDistance(
                location.coords.latitude,
                location.coords.longitude,
                taskCoords.latitude,
                taskCoords.longitude
              );

              if (distance < PROXIMITY_THRESHOLD) {
                await sendTaskProximityNotification(task, Math.round(distance));
              }
            }
          }
        }
        
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } catch (err) {
        console.error("Error in background task:", err);
        return BackgroundFetch.BackgroundFetchResult.Failed;
      }
    }
  }
  
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

export const sendTaskProximityNotification = async (task: Task, distance: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Prêt de Vous',
      body: `"${task.title}" est à ${distance}m de vous !`,
      data: { taskId: task.id },
    },
    trigger: null,
  });
};

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return false;
  }
  
  return true;
};

export const startLocationTracking = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }
  
  if (Platform.OS === 'android') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      return false;
    }
  }
  
  await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
    minimumInterval: 5 * 60, // 5 Min
    stopOnTerminate: false,
    startOnBoot: true,
  });
  
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 5 * 60 * 1000, // 5 Min
    distanceInterval: 100,
    foregroundService: {
      notificationTitle: 'MemoMap is running in background',
      notificationBody: 'Monitoring for nearby tasks',
    },
    pausesUpdatesAutomatically: false,
  });
  
  return true;
};

export const stopLocationTracking = async () => {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  await BackgroundFetch.unregisterTaskAsync(LOCATION_TASK_NAME);
};

export const setNotificationTapHandler = (handler: (taskId: number) => void) => {
  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data && data.taskId) {
      handler(data.taskId);
    }
  });
};
