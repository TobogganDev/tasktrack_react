import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import LogOutButton from "@/components/utils/LogOutButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import TasksManager from "@/components/TasksManager";

export default function HomePage() {
    const { session } = useAuth();
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

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
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (!session) {
        return <Auth />;
    }

    if (session && !profileComplete) {
        return <Account key={session.user.id} onProfileUpdated={() => setProfileComplete(true)} />;
    }

    return (
        <View style={styles.center}>
            <Text style={styles.welcome}>Welcome Home!</Text>
            <Text style={{ marginTop: 20 }}>You are logged in as {session.user.email}</Text>
            <LogOutButton />

            <TasksManager />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    welcome: { fontSize: 24, fontWeight: "bold" },
});
