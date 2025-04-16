// app/index.tsx
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, Button } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import LogOutButton from "@/components/utils/LogOutButton";

export default function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch the current session and listen for auth state changes.
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (session && session.user) {
                const { data, error } = await supabase.from("users").select("name").eq("id", session.user.id).single();

                if (data && data.name) {
                    setProfileComplete(true);
                } else {
                    setProfileComplete(false);
                }
            }
            setLoading(false);
        };
        if (session) {
            fetchProfile();
        } else {
            setLoading(false);
        }
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
        return <Account key={session.user.id} session={session} onProfileUpdated={() => setProfileComplete(true)} />;
    }

    return (
        <View style={styles.center}>
            <Text style={styles.welcome}>Welcome Home!</Text>
            {/* Additional home page content can go here */}
            <Text style={{ marginTop: 20 }}>You are logged in as {session.user.email}</Text>
            {/* Add a button to sign out */}
            <LogOutButton />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    welcome: { fontSize: 24, fontWeight: "bold" },
});
