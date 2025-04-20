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
import { AuthProvider } from "@/context/AuthContext";
import { TasksProvider } from "@/context/TasksContext";
import { LocationProvider } from "@/context/LocationContext";
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
        if (loaded || error) {
            SplashScreen.hideAsync();
        }
    }, [loaded, error]);

    if (!loaded && !error) {
        return null;
    }

    return (
        <AuthProvider>
            <TasksProvider>
                <LocationProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <NotificationManager />
                        <Drawer drawerContent={CustomMenu} screenOptions={{ drawerHideStatusBarOnOpen: true, headerStyle: { borderBottomColor: '#fff'} }}>
                            <Drawer.Screen
                                name="index"
                                options={{
                                    title: "Your Tasks",
                                    drawerLabel: "Home",
                                    drawerIcon: () => null,
                                }}
                            />
                        </Drawer>
                    </GestureHandlerRootView>
                </LocationProvider>
            </TasksProvider>
        </AuthProvider>
    );
}
