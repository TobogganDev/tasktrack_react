import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { Task } from "@/types/Task";
import { useAuth } from "@/context/AuthContext";

export default function TasksManager() {
    const { session } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase.from("tasks").select("*").eq("user_id", session?.user.id);
            if (error) {
                console.error("Error fetching tasks:", error);
            } else {
                setTasks(data);
            }
            setLoading(false);
        };
        fetchTasks();
    }, []);

    const handleAddTask = async (task: Task) => {
        const { error } = await supabase.from("tasks").insert([task]);
        if (error) {
            console.error("Error adding task:", error);
        } else {
            setTasks((prevTasks) => [...prevTasks, task]);
        }
    };

    return (
        <View style={{ padding: 20 }}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View>
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <Text key={task.id} style={{ marginVertical: 5 }}>
                                {task.title}
                            </Text>
                        ))
                    ) : (
                        <Text>No tasks available</Text>
                    )}
                </View>
            )}

            <Text
                onPress={() => {
                    if (session && session.user) {
                        handleAddTask({
                            user_id: session.user.id,
                            title: "New Task",
                            done: false,
                        });
                    } else {
                        console.log("User is not authenticated");
                    }
                }}
                style={{ marginTop: 20, color: "blue" }}
            >
                Add Task
            </Text>
        </View>
    );
}
