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

    // Load from AsyncStorage
    const loadLocalPage = async (p: number): Promise<Task[]> => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFIX + p);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("loadLocalPage failed", e);
            return [];
        }
    };

    // Save to AsyncStorage
    const saveLocalPage = async (p: number, arr: Task[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY_PREFIX + p, JSON.stringify(arr));
        } catch (e) {
            console.error("saveLocalPage failed", e);
        }
    };

    // Fetch from Supabase and sync local
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
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};
