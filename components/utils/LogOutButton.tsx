import React from "react";
import { Alert } from "react-native";
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

    return <Button title="Sign Out" onPress={handleSignOut} />;
}
