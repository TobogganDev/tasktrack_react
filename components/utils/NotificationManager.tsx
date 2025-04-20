import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import { useAuth } from '@/context/AuthContext';
import { useTasksContext } from '@/context/TasksContext';
import { 
  requestNotificationPermissions, 
  startLocationTracking, 
  stopLocationTracking,
  setNotificationTapHandler
} from '@/services/NotificationService';

export default function NotificationManager() {
  const { session } = useAuth();
  const { fetchTasks } = useTasksContext();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      if (isInitialized) return;
      
      if (!Device.isDevice) {
        console.log("Running on simulator - skipping notification setup");
        return;
      }
      
      const hasPermissions = await requestNotificationPermissions();
      if (!hasPermissions) {
        if (Platform.OS === 'ios') {
          Alert.alert(
            "Notification Permission Required",
            "To receive alerts when near tasks, please enable notifications in your device settings."
          );
        }
        return;
      }
      
      setNotificationTapHandler((taskId) => {
        fetchTasks();
      });
      
      setIsInitialized(true);
    };
    
    setupNotifications();
  }, [isInitialized, fetchTasks]);
  
  useEffect(() => {
    const manageLocationTracking = async () => {
      if (session) {
        await startLocationTracking();
      } else if (isInitialized) {
        await stopLocationTracking();
      }
    };
    
    if (isInitialized || session) {
      manageLocationTracking();
    }
    
    return () => {
      if (session) {
        stopLocationTracking();
      }
    };
  }, [session, isInitialized]);
  
  return null;
}
