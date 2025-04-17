import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTasksContext } from "@/context/TasksContext";
import TaskItem from "@/components/utils/TaskItem";
import EmptyStateIllustration from "@/components/EmptyStateIllustration";
import { Feather } from "@expo/vector-icons";
import AddTaskModal from "@/components/modals/AddTaskModal";

export default function TasksManager() {
    const { tasks, loading, page, nextPage, prevPage } = useTasksContext();
    const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator size="small"/>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {tasks.length > 0 ? (
                            tasks.map((task) => <TaskItem key={String(task.id)} task={task} />)
                        ) : (
                            <View style={styles.emptyContainer}>
                                <EmptyStateIllustration />
                                <Text style={styles.emptyTitle}>No tasks yet</Text>
                                <Text style={styles.emptySubtitle}>
                                    Add your to‑dos by tapping the plus button below
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={prevPage}
                    disabled={page === 1}
                    style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
                >
                    <Text style={styles.pageText}>Prev</Text>
                </TouchableOpacity>
                <Text style={styles.pageNumber}>Page {page}</Text>
                <TouchableOpacity
                    onPress={nextPage}
                    disabled={tasks.length < 10}
                    style={[styles.pageButton, tasks.length < 10 && styles.pageButtonDisabled]}
                >
                    <Text style={styles.pageText}>Next</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.fab} onPress={() => setIsAddTaskModalVisible(true)}>
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>

            <AddTaskModal isVisible={isAddTaskModalVisible} onClose={() => setIsAddTaskModalVisible(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    content: { flex: 1 },
    scrollContent: { paddingBottom: 80 },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#757575",
        textAlign: "center",
        marginTop: 8,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#E5E5E5",
    },
    pageButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: "black",
        borderRadius: 4,
        marginHorizontal: 20,
    },
    pageButtonDisabled: {
        backgroundColor: "#ccc",
    },
    pageText: {
        color: "white",
        fontSize: 14,
    },
    pageNumber: {
        fontSize: 16,
        fontWeight: "500",
    },

    fab: {
        position: "absolute",
        right: 24,
        bottom: 24 + 60,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
