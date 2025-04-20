import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import TasksManager from "@/components/utils/TasksManager";
import MapViewComponent from "@/components/utils/MapsManager";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

export default function HomePage() {
    const { session } = useAuth();
    const { theme } = useTheme();
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"Tasks" | "Map">("Tasks");

    useEffect(() => {
        const fetchProfile = async () => {
            if (session && session.user) {
                const { data } = await supabase.from("users").select("name").eq("id", session.user.id).single();
                setProfileComplete(data && data.name ? true : false);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [session]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }
    if (!session) return <Auth />;
    if (!profileComplete) return <Account key={session.user.id} onProfileUpdated={() => setProfileComplete(true)} />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    {(["Tasks", "Map"] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && {
                                    borderBottomColor: theme.colors.primary,
                                },
                                styles.halfWidthTab,
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: theme.colors.text },
                                    activeTab === tab && {
                                        color: theme.colors.primary,
                                        fontWeight: "600",
                                    },
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {activeTab === "Tasks" ? <TasksManager /> : <MapViewComponent />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
    },
    tabsContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    tabs: {
        flexDirection: "row",
        width: "100%",
    },
    tab: {
        paddingVertical: 12,
        alignItems: "center",
    },
    halfWidthTab: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
    },
    tabText: {
        fontSize: 16,
    },
    divider: {
        height: 1,
    },
});
