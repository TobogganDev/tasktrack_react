import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Task } from "@/types/Task";
import { Ionicons } from "@expo/vector-icons";

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const taskDate = new Date(task.created_at!);
    const taskDateString = taskDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{task.title}</Text>
            <View style={styles.row}>
                <Ionicons name="calendar" size={16} color="#666" style={styles.icon} />
                <Text style={styles.info}>{taskDateString}</Text>
            </View>

            {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        marginHorizontal: 20,
        padding: 12,
        backgroundColor: "#FFF",
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    info: {
        fontSize: 14,
        color: "#666",
    },
    description: {
        fontSize: 16,
        color: "#333",
        marginTop: 4,
    },
});
