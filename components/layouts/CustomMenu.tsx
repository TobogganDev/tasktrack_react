import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer";
import LogOutButton from "../utils/LogOutButton";
import { View, Text, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "../utils/ThemToggle";

export default function CustomMenu(props: any) {
    const { theme } = useTheme();
    const { top, bottom } = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} scrollEnabled={false}>
                <View
                    style={{ paddingVertical: 40, flexDirection: "row", alignItems: "center", paddingHorizontal: 20 }}
                >
                    <Image
                        source={require("@/assets/images/memomap.png")}
                        style={{ width: 50, height: 50, borderRadius: 8 }}
                    />
                    <Text style={[{ fontSize: 24, fontWeight: "bold", marginLeft: 10, color: theme.colors.text }]}>
                        MemoMap
                    </Text>
                </View>

                <DrawerItemList {...props} />

                <ThemeToggle />
            </DrawerContentScrollView>
            <View style={{ paddingBottom: 20 + bottom, paddingHorizontal: 20 }}>
                <LogOutButton />
            </View>
        </View>
    );
}
