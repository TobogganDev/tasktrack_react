import { DarkTheme as NavigationDark, DefaultTheme as NavigationLight } from "@react-navigation/native";

export const LightTheme = {
    ...NavigationLight,
    colors: {
        ...NavigationLight.colors,
        background: "#ffffff",
        card: "#f5f5f5",
        text: "#333333",
        primary: "#000000",
        border: "#e5e5e5",
        notification: "#ff453a",
    },
};

export const DarkTheme = {
    ...NavigationDark,
    colors: {
        ...NavigationDark.colors,
        background: "#1c1c1e",
        card: "#1c1c1e",
        text: "#ffffff",
        primary: "#ffffff",
        border: "#272729",
        notification: "#ff453a",
    },
};
