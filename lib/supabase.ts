import { Platform } from "react-native";

if (Platform.OS !== "web") {
    require("react-native-url-polyfill/auto");
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL or Anon Key is not defined in environment variables.");
}

const isWeb = Platform.OS === "web";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: isWeb
        ? {
              storage: localStorage,
              detectSessionInUrl: true,
          }
        : {
              storage: AsyncStorage,
              autoRefreshToken: true,
              persistSession: true,
              detectSessionInUrl: false,
          },
});