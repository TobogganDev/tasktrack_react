import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
            <TouchableOpacity onPress={toggleTheme}>
                <Feather name="sun" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
});
