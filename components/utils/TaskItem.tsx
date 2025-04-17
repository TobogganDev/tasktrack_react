import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Task } from "@/types/Task";

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const taskDate = new Date(task.created_at!);
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {task.title} ({task.id})
            </Text>
            <Text style={styles.text}>{task.description}</Text>
            <Text style={styles.text}>{taskDate.toLocaleDateString()}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        padding: 8,
        backgroundColor: "#f2f2f2",
        borderRadius: 4,
    },
    text: {
        fontSize: 16,
        color: "#333",
    },
});
