import React from 'react';
import { Montserrat_100Thin, Montserrat_400Regular, Montserrat_600SemiBold, useFonts } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect as reactUseEffect } from 'react';

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
            <Slot />
        </AuthProvider>
    );
}
