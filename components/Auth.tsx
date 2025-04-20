import React, { useState } from "react";
import { Alert, StyleSheet, View, Image, Text } from "react-native";
import { Button, Input } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/context/ThemeContext";

export default function Auth() {
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);

        if (error) {
            Alert.alert("Error", error.message);
        }
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        setLoading(false);

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Account has been created");
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={{ paddingVertical: 40, flexDirection: "row", alignItems: "center" }}>
                <Image
                    source={require("@/assets/images/memomap.png")}
                    style={{ width: 50, height: 50, borderRadius: 8 }}
                />
                <Text style={[{ fontSize: 24, fontWeight: "bold", marginLeft: 10, color: theme.colors.text }]}>
                    MemoMap
                </Text>
            </View>
            <Input
                label="Email"
                leftIcon={{ type: "font-awesome", name: "envelope", color: theme.colors.primary }}
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                placeholderTextColor={theme.colors.text}
                autoCapitalize="none"
                labelStyle={{ color: theme.colors.text }}
                inputStyle={{ color: theme.colors.text }}
                containerStyle={{ marginBottom: 16 }}
            />

            <Input
                label="Password"
                leftIcon={{ type: "font-awesome", name: "lock", color: theme.colors.primary }}
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholder="Password"
                placeholderTextColor={theme.colors.text}
                autoCapitalize="none"
                labelStyle={{ color: theme.colors.text }}
                inputStyle={{ color: theme.colors.text }}
                containerStyle={{ marginBottom: 16 }}
            />

            <Button
                title={loading ? "Loading..." : "Sign In"}
                onPress={signInWithEmail}
                disabled={loading}
                buttonStyle={{ backgroundColor: theme.colors.primary }}
                titleStyle={{ color: theme.colors.card }}
                containerStyle={styles.button}
            />

            <Button
                title={loading ? "Loading..." : "Sign Up"}
                onPress={signUpWithEmail}
                disabled={loading}
                buttonStyle={{ backgroundColor: theme.colors.primary }}
                titleStyle={{ color: theme.colors.card }}
                containerStyle={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        paddingTop: 40,
        flex: 1,
    },
    button: {
        marginTop: 10,
    },
});
