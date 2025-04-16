import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "@rneui/themed";
import { supabase } from "@/lib/supabase";

export default function Auth() {
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
            return;
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
            return;
        }
        Alert.alert("Success", "Account has been created");
    }

    return (
        <View style={styles.container}>
            <Input
                label="Email"
                leftIcon={{ type: "font-awesome", name: "envelope" }}
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
            />
            <Input
                label="Password"
                leftIcon={{ type: "font-awesome", name: "lock" }}
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholder="Password"
                autoCapitalize="none"
            />
            <Button
                title={loading ? "Loading..." : "Sign In"}
                onPress={signInWithEmail}
                disabled={loading}
                containerStyle={styles.button}
            />
            <Button
                title={loading ? "Loading..." : "Sign Up"}
                onPress={signUpWithEmail}
                disabled={loading}
                containerStyle={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
    },
    button: {
        marginTop: 10,
    },
});
