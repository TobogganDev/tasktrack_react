import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import EmptyStateIllustration from '@/components/EmptyStateIllustration';
import TasksManager from '@/components/utils/TasksManager';
import { useTasksContext, TaskCategory } from '@/context/TasksContext';
import Auth from "@/components/Auth";
import Account from "@/components/Account";
import LogOutButton from "@/components/utils/LogOutButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
    const { session } = useAuth();
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'All' | TaskCategory>('All');
    const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
    const { getFilteredTasks, toggleTaskCompletion } = useTasksContext();
  
    const tabs: ('All' | TaskCategory)[] = ['All', 'Work', 'Personal', 'Other'];

    useEffect(() => {
        const fetchProfile = async () => {
            if (session && session.user) {
                const { data } = await supabase.from("users").select("name").eq("id", session.user.id).single();

                setProfileComplete(data && data.name ? true : false);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [session]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    if (!session) {
        return <Auth />;
    }

    if (session && !profileComplete) {
        return <Account key={session.user.id} onProfileUpdated={() => setProfileComplete(true)} />;
    }

    const filteredTasks = getFilteredTasks(activeTab);
  
    const renderTaskItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.taskItem}
            onPress={() => toggleTaskCompletion(item.id)}
        >
            <TouchableOpacity 
                style={[
                    styles.checkbox, 
                    item.completed && styles.checkboxChecked
                ]}
                onPress={() => toggleTaskCompletion(item.id)}
            >
                {item.completed && (
                    <Feather name="check" size={16} color="white" />
                )}
            </TouchableOpacity>
            <View style={styles.taskContent}>
                <Text 
                    style={[
                        styles.taskTitle, 
                        item.completed && styles.taskTitleCompleted
                    ]}
                >
                    {item.title}
                </Text>
                <Text style={styles.taskCategory}>{item.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            <View style={styles.header}>
                <TouchableOpacity>
                    <Feather name="menu" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Tasks</Text>
                <TouchableOpacity>
                    <Feather name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.userInfo}>
                <Text>Logged in as {session.user.email}</Text>
                <LogOutButton />
            </View>
            
            <View style={styles.tabsContainer}>
                <View style={styles.tabs}>
                    {tabs.map((tab) => (
                        <TouchableOpacity 
                            key={tab} 
                            style={[
                                styles.tab, 
                                activeTab === tab && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text 
                                style={[
                                    styles.tabText, 
                                    activeTab === tab && styles.activeTabText
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.addCategoryButton}>
                    <Feather name="plus" size={24} color="black" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            {filteredTasks.length > 0 ? (
                <FlatList
                    data={filteredTasks}
                    renderItem={renderTaskItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.taskList}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <EmptyStateIllustration />
                    <Text style={styles.emptyTitle}>No tasks yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Add your to-dos tapping the plus button below
                    </Text>
                </View>
            )}
            
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => setIsAddTaskModalVisible(true)}
            >
                <Feather name="plus" size={24} color="white" />
            </TouchableOpacity>
            
            <TasksManager 
                isVisible={isAddTaskModalVisible}
                onClose={() => setIsAddTaskModalVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    center: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
    welcome: { 
        fontSize: 24, 
        fontWeight: "bold" 
    },
    
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    userInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
    },
    tabsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    tabs: {
        flexDirection: 'row',
        flex: 1,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 20,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: 'black',
    },
    tabText: {
        fontSize: 16,
        color: '#9E9E9E',
    },
    activeTabText: {
        color: 'black',
        fontWeight: '500',
    },
    addCategoryButton: {
        padding: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginTop: 8,
    },
    taskList: {
        padding: 16,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#9E9E9E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    taskTitleCompleted: {
        textDecorationLine: 'line-through',
        color: '#9E9E9E',
    },
    taskCategory: {
        fontSize: 14,
        color: '#757575',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
