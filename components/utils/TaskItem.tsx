import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Task } from "@/types/Task";
import { Ionicons } from "@expo/vector-icons";
import { useTasksContext } from "@/context/TasksContext";

interface TaskItemProps {
    task: Task;
}

export default function TaskItem({ task }: TaskItemProps) {
    const { toggleTaskDone } = useTasksContext();
    const taskDate = new Date(task.created_at!);
    const taskDateString = taskDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });

    const handleToggleDone = () => {
        if (task.id) {
            toggleTaskDone(task.id, !task.done);
        }
    };

    return (
        <View style={[styles.container, task.done && styles.taskDone]}>
            <View style={styles.header}>
                <Text style={[styles.title, task.done && styles.titleDone]}>
                    {task.title}
                </Text>
                <TouchableOpacity 
                    style={[styles.checkButton, task.done && styles.checkButtonDone]} 
                    onPress={handleToggleDone}
                >
                    {task.done ? (
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    ) : (
                        <Ionicons name="checkmark-circle-outline" size={24} color="#000" />
                    )}
                </TouchableOpacity>
            </View>
            
            <View style={styles.row}>
                <Ionicons name="calendar" size={16} color={task.done ? "#999" : "#666"} style={styles.icon} />
                <Text style={[styles.info, task.done && styles.infoDone]}>{taskDateString}</Text>
                {task.done && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>Completed</Text>
                    </View>
                )}
            </View>

            {task.description ? (
                <Text style={[styles.description, task.done && styles.descriptionDone]}>
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
        backgroundColor: "#FFF",
        borderRadius: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    taskDone: {
        backgroundColor: "#F5F5F5",
        borderColor: "#E0E0E0",
        borderWidth: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 8,
        flex: 1,
    },
    titleDone: {
        color: "#999",
        textDecorationLine: "line-through",
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
    infoDone: {
        color: "#999",
    },
    description: {
        fontSize: 16,
        color: "#333",
        marginTop: 4,
    },
    descriptionDone: {
        color: "#999",
    },
    checkButton: {
        padding: 4,
        borderRadius: 20,
    },
    checkButtonDone: {
        backgroundColor: "#4CAF50",
    },
    statusBadge: {
        backgroundColor: "#4CAF50",
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    statusText: {
        color: "white",
        fontSize: 12,
        fontWeight: "500",
    }
});
