import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

interface AccountProps {
    onProfileUpdated: () => void;
}

export default function Account({ onProfileUpdated }: AccountProps) {
    const { session } = useAuth();
    const { theme } = useTheme();
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleUpdateUsername() {
        try {
            setLoading(true);
            if (!session || !session.user) {
                throw new Error("User not authenticated.");
            }

            const { error } = await supabase.from("users").upsert({
                id: session.user.id,
                email: session.user.email,
                name: username.trim(),
            });
            if (error) throw error;

            Alert.alert("Success", "Username updated successfully!");
            onProfileUpdated();
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Input
                label="Username"
                placeholder="Enter your username"
                placeholderTextColor={theme.colors.text}
                value={username}
                onChangeText={setUsername}
                labelStyle={{ color: theme.colors.text }}
                inputStyle={{ color: theme.colors.text }}
                containerStyle={{ marginBottom: 16 }}
            />

            <Button
                title={loading ? "Updating..." : "Update Username"}
                onPress={handleUpdateUsername}
                disabled={loading || !username.trim()}
                buttonStyle={{ backgroundColor: theme.colors.primary }}
                titleStyle={{ color: theme.colors.card }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        marginTop: 40,
    },
});
