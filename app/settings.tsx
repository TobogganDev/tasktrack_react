import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import { startLocationTracking, stopLocationTracking } from '@/services/NotificationService';

const PROXIMITY_ALERTS_KEY = '@proximity_alerts_enabled';

export default function SettingsScreen() {
  const router = useRouter();
  const [proximityAlertsEnabled, setProximityAlertsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const value = await AsyncStorage.getItem(PROXIMITY_ALERTS_KEY);
        setProximityAlertsEnabled(value === 'true');
      } catch (e) {
        console.error('Failed to load proximity alert settings', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  const toggleProximityAlerts = async (value: boolean) => {
    if (!Device.isDevice) {
      Alert.alert(
        "Simulator Detected",
        "This feature only works on physical devices. Location tracking will be simulated."
      );
    }
    
    try {
      if (value) {
        const started = await startLocationTracking();
        if (!started) {
          Alert.alert(
            "Permission Required",
            "Location permission is required for proximity alerts. Please enable it in your device settings.",
            [{ text: "OK" }]
          );
          return;
        }
      } else {
        await stopLocationTracking();
      }
      
      await AsyncStorage.setItem(PROXIMITY_ALERTS_KEY, value.toString());
      setProximityAlertsEnabled(value);
      
    } catch (error) {
      console.error('Error toggling proximity alerts:', error);
      Alert.alert('Error', 'Failed to update proximity alert settings');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Proximity Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified when you're near tasks that need to be completed
            </Text>
          </View>
          <Switch
            trackColor={{ false: "#E0E0E0", true: "#dcdcdc" }}
            thumbColor={proximityAlertsEnabled ? "#000" : "#f4f3f4"}
            ios_backgroundColor="#E0E0E0"
            onValueChange={toggleProximityAlerts}
            value={proximityAlertsEnabled}
            disabled={loading}
          />
        </View>
        
        <View style={styles.settingInfo}>
          <Text style={styles.infoText}>
            When enabled, MemoMap will check your location every 5 minutes in the background
            and notify you when you're within 500 meters of a task.
          </Text>
          
          {Platform.OS === 'ios' && (
            <Text style={styles.infoText}>
              Note: For best results on iOS, make sure location services are set to "Always"
              in your device settings for MemoMap.
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  settingInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
  },
});
