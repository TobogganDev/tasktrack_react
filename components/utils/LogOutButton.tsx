import React from "react";
import { Alert, StyleSheet, Touchable, TouchableOpacity, Text } from "react-native";
import { Button } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function LogOutButton() {
    const { setSession } = useAuth();

    async function handleSignOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            setSession(null);
        } catch (error: any) {
            Alert.alert("Error signing out", error.message);
        }
    }

    return (
        <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "black",
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
