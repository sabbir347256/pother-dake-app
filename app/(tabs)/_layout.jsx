import "../../global.css";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Platform } from "react-native";
import { Octicons, Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/AuthProvider/AuthProvider";

const TabLayout = () => {
    const { user } = useAuth();
    const isDriver = user?.role === "DRIVER";

    return (
        <SafeAreaProvider style={{ backgroundColor: "#000000" }}>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#000000" },
                    tabBarShowLabel: true,
                    tabBarActiveTintColor: "#10B981",
                    tabBarInactiveTintColor: "#64748B",
                    tabBarStyle: {
                        position: "absolute",
                        bottom: Platform.OS === "ios" ? 25 : 15,
                        left: 16,
                        right: 16,
                        backgroundColor: "#0F172A",
                        borderRadius: 28,
                        height: 72,
                        paddingBottom: 8,
                        paddingTop: 8,
                        borderTopWidth: 1,
                        borderTopColor: "rgba(255, 255, 255, 0.1)",
                        ...Platform.select({
                            ios: {
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.4,
                                shadowRadius: 16,
                            },
                            android: {
                                elevation: 20,
                            },
                        }),
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: "700",
                        marginTop: 2,
                    },
                }}
            >
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl ${focused
                                    ? "bg-emerald-950/80 border border-emerald-500/30"
                                    : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Octicons
                                    name="home"
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="search"
                    options={{
                        title: "Search",
                        href: isDriver ? null : undefined,
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl ${focused
                                    ? "bg-emerald-950/80 border border-emerald-500/30"
                                    : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Octicons
                                    name="search"
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="search/[id]"
                    options={{
                        href: null,
                    }}
                />

                <Tabs.Screen
                    name="my-bookings"
                    options={{
                        title: "My Ride",
                        href: isDriver ? undefined : null,
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl ${focused
                                    ? "bg-emerald-950/80 border border-emerald-500/30"
                                    : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Octicons
                                    name="list-unordered"
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="create"
                    options={{
                        title: "Create",
                        href: isDriver ? undefined : null,
                        tabBarIcon: () => (
                            <View
                                className="items-center justify-center w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-full -mt-8 border-4 border-[#0F172A]"
                                style={{
                                    elevation: 12,
                                    shadowColor: "#10B981",
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.5,
                                    shadowRadius: 10,
                                }}
                            >
                                <Octicons name="plus" size={26} color="#FFFFFF" />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="chat"
                    options={{
                        title: "Chat",
                        href: undefined,
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl relative ${focused ? "bg-emerald-950/80 border border-emerald-500/30" : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Ionicons
                                    name={focused ? "chatbubble" : "chatbubble-outline"}
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                                <View className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0F172A]" />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="bookings"
                    options={{
                        title: "Bookings",
                        href: isDriver ? null : undefined,
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl ${focused ? "bg-emerald-950/80 border border-emerald-500/30" : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Octicons
                                    name="bookmark"
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        tabBarIcon: ({ focused }) => (
                            <View
                                className={`items-center justify-center w-11 h-11 rounded-2xl ${focused
                                    ? "bg-emerald-950/80 border border-emerald-500/30"
                                    : "bg-transparent"
                                    }`}
                                style={
                                    focused && {
                                        elevation: 6,
                                        shadowColor: "#10B981",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 6,
                                    }
                                }
                            >
                                <Octicons
                                    name="person"
                                    size={20}
                                    color={focused ? "#10B981" : "#64748B"}
                                />
                            </View>
                        ),
                    }}
                />

                <Tabs.Screen
                    name="auth/index"
                    options={{
                        href: null,
                        tabBarStyle: { display: "none" },
                    }}
                />
            </Tabs>
        </SafeAreaProvider>
    );
};

export default TabLayout;