import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTasksContext } from "@/context/TasksContext";
import { useLocation } from "@/context/LocationContext";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

interface AddTaskModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isVisible, onClose }) => {
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDescription, setTaskDescription] = useState("");
    const [includeLocation, setIncludeLocation] = useState(false);
    const [locationMode, setLocationMode] = useState<"current" | "map">("current");
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
    const [showMap, setShowMap] = useState(false);

    const mapRef = useRef<MapView>(null);
    const { addTask } = useTasksContext();
    const { 
        userCoordinates, 
        loading, 
        getCurrentLocation 
    } = useLocation();

    useEffect(() => {
        if (isVisible) {
            getCurrentLocation(false);
        }
    }, [isVisible]);

    useEffect(() => {
        if (locationMode === "current" && includeLocation) {
            getCurrentLocation(true).then(coords => {
                if (coords) {
                    setCoordinates(coords);
                }
            });
        }
    }, [locationMode, includeLocation]);

    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setCoordinates(coordinate);
    };

    const handleAddTask = () => {
        if (!taskTitle.trim()) {
            Alert.alert("Error", "Please enter a task title");
            return;
        }

        if (includeLocation && !coordinates) {
            Alert.alert("Error", "Please select a location");
            return;
        }

        addTask(taskTitle.trim(), taskDescription, coordinates || undefined);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setTaskTitle("");
        setTaskDescription("");
        setIncludeLocation(false);
        setLocationMode("current");
        setCoordinates(null);
        setShowMap(false);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => {
                resetForm();
                onClose();
            }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.centeredView}
                keyboardVerticalOffset={50}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Task</Text>
                        <TouchableOpacity
                            onPress={() => {
                                resetForm();
                                onClose();
                            }}
                        >
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
                        style={styles.inputMultiline}
                        placeholder="Description (optional)"
                        value={taskDescription}
                        onChangeText={setTaskDescription}
                        multiline
                        numberOfLines={3}
                    />

                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Include Location</Text>
                        <Switch
                            trackColor={{ false: "#575757", true: "#dcdcdc" }}
                            thumbColor={includeLocation ? "#000" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={() => {
                                const newValue = !includeLocation;
                                setIncludeLocation(newValue);
                                if (newValue && locationMode === "current") {
                                    getCurrentLocation(true).then(coords => {
                                        if (coords) {
                                            setCoordinates(coords);
                                        }
                                    });
                                }
                            }}
                            value={includeLocation}
                        />
                    </View>

                    {includeLocation && (
                        <>
                            <View style={styles.locationOptions}>
                                <TouchableOpacity
                                    style={[
                                        styles.locationOption,
                                        locationMode === "current" && styles.locationOptionActive,
                                    ]}
                                    onPress={() => {
                                        setLocationMode("current");
                                        setShowMap(false);
                                    }}
                                >
                                    <Feather
                                        name="compass"
                                        size={20}
                                        color={locationMode === "current" ? "white" : "black"}
                                    />
                                    <Text
                                        style={[
                                            styles.locationOptionText,
                                            locationMode === "current" && styles.locationOptionTextActive,
                                        ]}
                                    >
                                        Current Location
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.locationOption,
                                        locationMode === "map" && styles.locationOptionActive,
                                    ]}
                                    onPress={() => {
                                        setLocationMode("map");
                                        setShowMap(true);
                                    }}
                                >
                                    <Feather
                                        name="map-pin"
                                        size={20}
                                        color={locationMode === "map" ? "white" : "black"}
                                    />
                                    <Text
                                        style={[
                                            styles.locationOptionText,
                                            locationMode === "map" && styles.locationOptionTextActive,
                                        ]}
                                    >
                                        Select on Map
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {locationMode === "map" && (
                                <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(!showMap)}>
                                    <Text style={styles.mapToggleText}>{showMap ? "Hide Map" : "Show Map"}</Text>
                                    <Feather name={showMap ? "chevron-up" : "chevron-down"} size={20} color="black" />
                                </TouchableOpacity>
                            )}

                            {showMap && userCoordinates && (
                                <View style={styles.mapContainer}>
                                    <MapView
                                        ref={mapRef}
                                        style={styles.map}
                                        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                                        initialRegion={{
                                            latitude: userCoordinates.latitude,
                                            longitude: userCoordinates.longitude,
                                            latitudeDelta: 0.01,
                                            longitudeDelta: 0.01,
                                        }}
                                        onPress={handleMapPress}
                                    >
                                        <Marker coordinate={userCoordinates} pinColor="blue" title="Your Location" />

                                        {coordinates && (
                                            <Marker
                                                coordinate={coordinates}
                                                pinColor="red"
                                                title="Task Location"
                                                draggable
                                                onDragEnd={(e) => setCoordinates(e.nativeEvent.coordinate)}
                                            />
                                        )}
                                    </MapView>

                                    {locationMode === "map" && (
                                        <TouchableOpacity
                                            style={styles.centerMapButton}
                                            onPress={() => {
                                                if (userCoordinates && mapRef.current) {
                                                    mapRef.current.animateToRegion({
                                                        ...userCoordinates,
                                                        latitudeDelta: 0.01,
                                                        longitudeDelta: 0.01,
                                                    });
                                                }
                                            }}
                                        >
                                            <Feather name="navigation" size={20} color="black" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {loading && <Text style={styles.loadingText}>Getting your location...</Text>}
                        </>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.addButton,
                            (!taskTitle.trim() || (includeLocation && !coordinates)) && styles.disabledButton,
                        ]}
                        onPress={handleAddTask}
                        disabled={!taskTitle.trim() || (includeLocation && !coordinates) || loading}
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
        maxHeight: "90%",
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
        marginBottom: 20,
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
    inputMultiline: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
        textAlignVertical: "top",
        minHeight: 80,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    toggleText: {
        fontSize: 16,
        color: "#333",
    },
    locationOptions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    locationOption: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        flex: 1,
        maxWidth: "48%",
    },
    locationOptionActive: {
        backgroundColor: "black",
        borderColor: "black",
    },
    locationOptionText: {
        marginLeft: 8,
        fontSize: 14,
        color: "#333",
    },
    locationOptionTextActive: {
        color: "white",
    },
    mapToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        marginBottom: 16,
    },
    mapToggleText: {
        fontSize: 14,
        color: "#333",
        marginRight: 8,
    },
    mapContainer: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    centerMapButton: {
        position: "absolute",
        bottom: 16,
        right: 16,
        backgroundColor: "white",
        borderRadius: 8,
        padding: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    coordinatesContainer: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    coordinatesText: {
        fontSize: 14,
        color: "#333",
    },
    addButton: {
        backgroundColor: "#000",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    disabledButton: {
        backgroundColor: "#E0E0E0",
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 10,
        fontStyle: "italic",
        textAlign: "center",
    },
});

export default AddTaskModal;
