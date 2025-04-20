import "react-native-gesture-handler";
import React from "react";
import {
    Montserrat_100Thin,
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    useFonts,
} from "@expo-google-fonts/montserrat";
import * as SplashScreen from "expo-splash-screen";
import { useEffect as reactUseEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { Feather } from "@expo/vector-icons";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import { LocationProvider } from "@/context/locationContext";
import NotificationManager from "@/components/utils/NotificationManager";
import CustomMenu from "@/components/layouts/CustomMenu";
import Auth from "@/components/Auth";

SplashScreen.preventAutoHideAsync();

export default function App() {
    const [loaded, error] = useFonts({
        Montserrat_100Thin,
        Montserrat_400Regular,
        Montserrat_600SemiBold,
    });

    reactUseEffect(() => {
        if (loaded || error) SplashScreen.hideAsync();
    }, [loaded, error]);

    if (!loaded && !error) return null;

    return (
        <ThemeProvider>
            <AuthProvider>
                <TasksProvider>
                    <LocationProvider>
                        <NotificationManager />
                        <GestureHandlerRootView style={{ flex: 1 }}>
                            <ThemedDrawer />
                        </GestureHandlerRootView>
                    </LocationProvider>
                </TasksProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function ThemedDrawer() {
    const { session } = useAuth();
    const { theme } = useTheme();

    if (!session) {
        return <Auth />;
    }

    return (
        <Drawer
            drawerContent={CustomMenu}
            screenOptions={{
                drawerHideStatusBarOnOpen: true,
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
                drawerStyle: { backgroundColor: theme.colors.background },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.text,
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: "Your Tasks",
                    drawerLabel: "Home",
                    drawerIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
                }}
            />
            <Drawer.Screen
                name="settings"
                options={{
                    title: "Settings",
                    drawerLabel: "Settings",
                    drawerIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
                }}
            />
        </Drawer>
    );
}
