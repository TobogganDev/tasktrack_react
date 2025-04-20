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
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import { LocationProvider } from "@/context/locationContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import CustomMenu from "@/components/layouts/CustomMenu";
import NotificationManager from "@/components/utils/NotificationManager";

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

// Put like this because of the useTheme hook
function ThemedDrawer() {
    const { theme } = useTheme();

    return (
        <Drawer
            drawerContent={CustomMenu}
            screenOptions={{
                drawerHideStatusBarOnOpen: true,
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                drawerStyle: {
                    backgroundColor: theme.colors.background,
                },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.text,
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: "Your Tasks",
                    drawerLabel: "Home",
                    drawerIcon: () => null,
                }}
            />
        </Drawer>
    );
}
