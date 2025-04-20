// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Appearance, ColorSchemeName, Platform } from "react-native";
import { DarkTheme, LightTheme } from "@/lib/theme";

interface ThemeContextType {
    theme: typeof LightTheme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemScheme = Appearance.getColorScheme();
    const [scheme, setScheme] = useState<ColorSchemeName>(systemScheme);

    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setScheme(colorScheme);
        });
        return () => sub.remove();
    }, []);

    const toggleTheme = () => {
        setScheme((s) => (s === "dark" ? "light" : "dark"));
    };

    const theme = scheme === "dark" ? DarkTheme : LightTheme;

    return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
