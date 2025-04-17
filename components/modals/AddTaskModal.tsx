import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTasksContext } from "@/context/TasksContext";

interface AddTaskModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isVisible, onClose }) => {
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const { addTask } = useTasksContext();
    
    const handleAddTask = () => {
        if (taskTitle.trim()) {
            addTask(taskTitle.trim(), taskDescription);
            setTaskTitle("");
            onClose();
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Task</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Title"
                        value={taskTitle}
                        onChangeText={setTaskTitle}
                        autoFocus
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        value={taskDescription}
                        onChangeText={setTaskDescription}
                        autoFocus
                    />

                    <TouchableOpacity
                        style={[styles.addButton, !taskTitle.trim() && styles.disabledButton]}
                        onPress={handleAddTask}
                        disabled={!taskTitle.trim()}
                    >
                        <Text style={styles.addButtonText}>Add Task</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: "#000",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    disabledButton: {
        backgroundColor: "#E0E0E0",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default AddTaskModal;
