import React from "react";
import { Alert, StyleSheet, TouchableOpacity, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function LogOutButton() {
    const { setSession } = useAuth();
    const { theme } = useTheme();

    async function handleSignOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setSession(null);
        } catch (err: any) {
            Alert.alert("Error signing out", err.message);
        }
    }

    return (
        <TouchableOpacity onPress={handleSignOut} style={[styles.button, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.text, { color: theme.colors.card }]}>Log Out</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        width: "100%",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
