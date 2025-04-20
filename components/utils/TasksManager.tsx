import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useTasksContext } from "@/context/TasksContext";
import TaskItem from "@/components/utils/TaskItem";
import EmptyStateIllustration from "@/components/EmptyStateIllustration";
import { Feather } from "@expo/vector-icons";
import AddTaskModal from "@/components/modals/AddTaskModal";
import SortTile from "@/components/utils/SortTile";
import { useLocation } from "@/context/LocationContext";
import { Task } from "@/types/Task";

export default function TasksManager() {
    const { tasks, loading, page, nextPage, prevPage } = useTasksContext();
    const { userCoordinates, parsePointGeometry } = useLocation();

    const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
    const [isDateAscending, setIsDateAscending] = useState(false);
    const [isDistanceAscending, setIsDistanceAscending] = useState(false);
    const [activeSortMethod, setActiveSortMethod] = useState<"date" | "distance" | "none">("date");
    const [sortedTasks, setSortedTasks] = useState<Task[]>([]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const distance = R * c;
        return distance;
    };

    useEffect(() => {
        const sortTasks = () => {
            let sorted = [...tasks];

            if (activeSortMethod === "date") {
                sorted.sort((a, b) => {
                    const aTime = new Date(a.created_at || "").getTime();
                    const bTime = new Date(b.created_at || "").getTime();
                    return isDateAscending ? aTime - bTime : bTime - aTime;
                });
            } else if (activeSortMethod === "distance" && userCoordinates) {
                sorted = sorted.filter(task => {
                    const taskCoords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
                    return taskCoords !== null;
                });
                
                sorted.sort((a, b) => {
                    const aCoords = parsePointGeometry(typeof a.location === 'string' ? a.location : null);
                    const bCoords = parsePointGeometry(typeof b.location === 'string' ? b.location : null);
                    
                    if (!aCoords && !bCoords) return 0;
                    if (!aCoords) return isDistanceAscending ? 1 : -1;
                    if (!bCoords) return isDistanceAscending ? -1 : 1;
                    
                    const aDistance = calculateDistance(
                        userCoordinates.latitude, 
                        userCoordinates.longitude, 
                        aCoords.latitude, 
                        aCoords.longitude
                    );
                    
                    const bDistance = calculateDistance(
                        userCoordinates.latitude, 
                        userCoordinates.longitude, 
                        bCoords.latitude, 
                        bCoords.longitude
                    );
                    
                    return isDistanceAscending ? aDistance - bDistance : bDistance - aDistance;
                });
                
                const tasksWithoutLocation = tasks.filter(task => {
                    const taskCoords = parsePointGeometry(typeof task.location === 'string' ? task.location : null);
                    return taskCoords === null;
                });
                
                sorted = [...sorted, ...tasksWithoutLocation];
            }
            
            setSortedTasks(sorted);
        };
        
        sortTasks();
    }, [tasks, activeSortMethod, isDateAscending, isDistanceAscending, userCoordinates]);

    const handleDateSort = () => {
        if (activeSortMethod === "date") {
            setIsDateAscending(!isDateAscending);
        } else {
            setActiveSortMethod("date");
            setIsDateAscending(false);
        }
    };
    
    const handleDistanceSort = () => {
        if (activeSortMethod === "distance") {
            setIsDistanceAscending(!isDistanceAscending);
        } else {
            setActiveSortMethod("distance");
            setIsDistanceAscending(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.sortRow}>
                <SortTile
                    title="Date"
                    ascending={isDateAscending}
                    onToggle={handleDateSort}
                />
                <SortTile
                    title="Distance"
                    ascending={isDistanceAscending}
                    onToggle={handleDistanceSort}
                />
            </View>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="small" />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        {sortedTasks.length > 0 ? (
                            sortedTasks.map((task) => <TaskItem key={String(task.id)} task={task} />)
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
    container: { flex: 1, paddingVertical: 20 },
    sortRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 20,
    },
    content: { flex: 1 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },
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
        bottom: 84,
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
