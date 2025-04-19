import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface SortBadgeProps {
    ascending: boolean;
    title: string;
    onToggle: () => void;
}

export default function SortTile({ ascending, title, onToggle }: SortBadgeProps) {
    const icon = ascending ? "arrow-up-outline" : "arrow-down-outline";
    const iconColor = ascending ? "white" : "black";
    return (
        <TouchableOpacity
            style={[
                styles.badge,
                ascending ? styles.badgeActive : styles.badgeInactive,
                { flexDirection: "row", alignItems: "center" },
            ]}
            onPress={onToggle}
        >
            <Text style={[styles.text, ascending ? styles.textActive : styles.textInactive, { marginRight: 4 }]}>
                {title}
            </Text>
            <Ionicons name={icon} style={{ color: iconColor }} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderWidth: 1,
        marginRight: 8,
    },
    badgeActive: {
        backgroundColor: "black",
        borderColor: "black",
    },
    badgeInactive: {
        backgroundColor: "white",
        borderColor: "#ccc",
    },
    text: {
        fontSize: 14,
    },
    textActive: {
        color: "white",
    },
    textInactive: {
        color: "black",
    },
});
