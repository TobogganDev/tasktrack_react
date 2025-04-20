import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "@/types/Task";
import { Ionicons } from "@expo/vector-icons";
import { useTasksContext } from "@/context/TasksContext";
import { useTheme } from "@/context/ThemeContext";

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const { toggleTaskDone } = useTasksContext();
    const { theme } = useTheme();

    const taskDate = new Date(task.created_at!);
    const taskDateString = taskDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });

    const handleToggleDone = () => {
        if (task.id != null) {
            toggleTaskDone(task.id, !task.done);
        }
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                task.done && {
                    backgroundColor: theme.colors.card,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.header}>
                <Text
                    style={[
                        styles.title,
                        { color: theme.colors.text },
                        task.done && { color: theme.colors.border, textDecorationLine: "line-through" },
                    ]}
                >
                    {task.title}
                </Text>

                <TouchableOpacity
                    onPress={handleToggleDone}
                    style={[styles.checkButton, task.done && { backgroundColor: theme.colors.primary }]}
                >
                    {task.done ? (
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.card} />
                    ) : (
                        <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <Ionicons
                    name="calendar"
                    size={16}
                    color={task.done ? theme.colors.border : theme.colors.text}
                    style={styles.icon}
                />
                <Text style={[styles.info, { color: task.done ? theme.colors.border : theme.colors.text }]}>
                    {taskDateString}
                </Text>
            </View>

            {task.description ? (
                <Text style={[styles.description, { color: task.done ? theme.colors.border : theme.colors.text }]}>
                    {task.description}
                </Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        flex: 1,
        marginBottom: 8,
    },
    checkButton: {
        padding: 4,
        borderRadius: 20,
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
    },
    description: {
        fontSize: 16,
        marginTop: 4,
    },
    statusBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "500",
    },
});
