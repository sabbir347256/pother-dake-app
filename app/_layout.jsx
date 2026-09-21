import "../global.css";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/AuthProvider/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();


export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <SafeAreaProvider>
                <AuthProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="auth" />
                    </Stack>
                </AuthProvider>
            </SafeAreaProvider>
        </QueryClientProvider>

    );
}