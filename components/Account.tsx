// app/components/Account.tsx
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

interface AccountProps {
    onProfileUpdated: () => void;
}

export default function Account({ onProfileUpdated }: AccountProps) {
    const { session } = useAuth();
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
                name: username,
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
        <View style={styles.container}>
            <Input label="Username" placeholder="Enter your username" value={username} onChangeText={setUsername} />
            <Button
                title={loading ? "Updating..." : "Update Username"}
                onPress={handleUpdateUsername}
                disabled={loading || !username.trim()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginTop: 40, padding: 12 },
});
