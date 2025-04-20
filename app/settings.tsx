import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Switch, TouchableOpacity, Alert, Platform, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { startLocationTracking, stopLocationTracking } from "@/services/NotificationService";
import { useTheme } from "@/context/ThemeContext";

const PROXIMITY_ALERTS_KEY = "@proximity_alerts_enabled";

export default function SettingsScreen() {
    const router = useRouter();
    const { theme } = useTheme();

    const [proximityAlertsEnabled, setProximityAlertsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const value = await AsyncStorage.getItem(PROXIMITY_ALERTS_KEY);
                setProximityAlertsEnabled(value === "true");
            } catch (e) {
                console.error("Failed to load proximity alert settings", e);
            } finally {
                setLoading(false);
            }
        })();
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
            console.error("Error toggling proximity alerts:", error);
            Alert.alert("Error", "Failed to update proximity alert settings");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
                <View style={styles.backButton} />
            </View>

            <View style={styles.content}>
                <View style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}>
                    <View style={styles.settingTextContainer}>
                        <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Proximity Alerts</Text>
                        <Text style={[styles.settingDescription, { color: theme.colors.text }]}>
                            Get notified when you're near tasks that need to be completed
                        </Text>
                    </View>
                    <Switch
                        trackColor={{
                            false: theme.colors.border,
                            true: theme.colors.primary,
                        }}
                        thumbColor={proximityAlertsEnabled ? theme.colors.card : theme.colors.text}
                        ios_backgroundColor={theme.colors.border}
                        onValueChange={toggleProximityAlerts}
                        value={proximityAlertsEnabled}
                        disabled={loading}
                    />
                </View>

                <View style={[styles.settingInfo, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.infoText, { color: theme.colors.text }]}>
                        When enabled, MemoMap will check your location every 5 minutes in the background and notify you
                        when you're within 500 meters of a task.
                    </Text>

                    {Platform.OS === "ios" && (
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>
                            Note: For best results on iOS, make sure location services are set to "Always" in your
                            device settings for MemoMap.
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    content: {
        padding: 20,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },

    settingInfo: {
        padding: 16,
        borderRadius: 8,
        marginTop: 24,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 12,
    },
});
