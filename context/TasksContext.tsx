import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Task } from "@/types/Task";

interface TasksContextType {
    tasks: Task[];
    loading: boolean;
    page: number;
    nextPage: () => void;
    prevPage: () => void;
    setPage: (p: number) => void;
    fetchTasks: (page?: number) => Promise<void>;
    addTask: (title: string, description: string, coordinates?: { latitude: number, longitude: number }) => Promise<void>;
    toggleTaskDone: (taskId: number, isDone: boolean) => Promise<void>; // New function
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);
export const useTasksContext = () => {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasksContext must be used within TasksProvider");
    return ctx;
};

const STORAGE_KEY_PREFIX = "@tasks_page_";

export const TasksProvider = ({ children }: { children: ReactNode }) => {
    const { session } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const PAGE_SIZE = 10;

    const loadLocalPage = async (p: number): Promise<Task[]> => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFIX + p);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("loadLocalPage failed", e);
            return [];
        }
    };

    const saveLocalPage = async (p: number, arr: Task[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY_PREFIX + p, JSON.stringify(arr));
        } catch (e) {
            console.error("saveLocalPage failed", e);
        }
    };

    const fetchTasks = async (p: number = page) => {
        setLoading(true);
        const local = await loadLocalPage(p);
        setTasks(local);

        if (session?.user) {
            const from = (p - 1) * PAGE_SIZE;
            const to = p * PAGE_SIZE - 1;
            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", session.user.id)
                .order("created_at", { ascending: false })
                .range(from, to);

            if (error) {
                console.error("fetchTasks supabase error", error);
            } else if (data) {
                setTasks(data);
                await saveLocalPage(p, data);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        setPage(1);
    }, [session]);

    useEffect(() => {
        fetchTasks(page);
    }, [page, session]);

    const nextPage = () => setPage((prev) => prev + 1);
    const prevPage = () => setPage((prev) => Math.max(1, prev - 1));

    const addTask = async (
        title: string, 
        description: string, 
        coordinates?: { latitude: number, longitude: number } | null
    ) => {
        setLoading(true);
        if (!session?.user) {
            console.warn("no session!");
            setLoading(false);
            return;
        }
        
        let locationData = null;
        
        if (coordinates) {
            locationData = `POINT(${coordinates.longitude} ${coordinates.latitude})`;
        }

        const { error } = await supabase.from("tasks").insert({
            title,
            description,
            done: false,
            user_id: session.user.id,
            location: locationData,
        });
        if (error) console.error("addTask error", error);
        await fetchTasks(1);
    };

    const toggleTaskDone = async (taskId: number, isDone: boolean) => {
        setLoading(true);
        if (!session?.user) {
            console.warn("no session!");
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from("tasks")
            .update({ done: isDone })
            .eq("id", taskId)
            .eq("user_id", session.user.id);

        if (error) {
            console.error("toggleTaskDone error", error);
        } else {
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task.id === taskId ? { ...task, done: isDone } : task
                )
            );

            const updatedLocalTasks = await loadLocalPage(page);
            const newLocalTasks = updatedLocalTasks.map(task =>
                task.id === taskId ? { ...task, done: isDone } : task
            );
            await saveLocalPage(page, newLocalTasks);
        }
        setLoading(false);
    };

    return (
        <TasksContext.Provider
            value={{
                tasks,
                loading,
                page,
                setPage,
                nextPage,
                prevPage,
                fetchTasks,
                addTask,
                toggleTaskDone,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};
