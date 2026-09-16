import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import config from "../../../src/Utils/envConfig";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";

export default function ProfileScreen() {
    const { token, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(`${config?.backendUrl}/user/profile`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (result?.data) {
                setUser(result.data);
            } else if (result?.result) {
                setUser(result.result);
            } else {
                setUser(result);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };



    useEffect(() => {
        fetchUserProfile();
    }, []);

    console.log(user)

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserProfile();
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#090D16] justify-center items-center">
                <ActivityIndicator size="large" color="#00B16A" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-[#090D16]"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00B16A" />
            }
        >
            <View className="bg-[#00B16A] pt-8 pb-20 px-6 rounded-b-[36px] items-center">
                <View className="relative">
                    <Image
                        source={{ uri: user?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                        className="w-28 h-28 rounded-full border-4 border-[#090D16]"
                    />
                    {user?.isVerified && (
                        <View className="absolute bottom-1 right-1 bg-blue-500 rounded-full p-1 border-2 border-[#090D16]">
                            <MaterialIcons name="verified" size={18} color="#FFFFFF" />
                        </View>
                    )}
                </View>

                <Text className="text-white text-2xl font-extrabold mt-3">{user?.fullName || "N/A"}</Text>
                <Text className="text-emerald-100 text-sm font-medium mt-0.5">{user?.email || "N/A"}</Text>

                <View className="flex-row items-center mt-3 gap-2">
                    <View className="bg-[#090D16]/40 px-3 py-1 rounded-full border border-emerald-300/30">
                        <Text className="text-emerald-200 text-xs font-bold uppercase">{user?.role || "USER"}</Text>
                    </View>
                    <View className="bg-[#090D16]/40 px-3 py-1 rounded-full border border-emerald-300/30">
                        <Text className="text-emerald-200 text-xs font-bold">{user?.userID || "N/A"}</Text>
                    </View>
                </View>
            </View>

            <View className="px-5 -mt-10 mb-6">
                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-4 flex-row justify-between items-center">
                    <View className="flex-1 items-center border-r border-slate-800 py-1">
                        <FontAwesome5 name="wallet" size={18} color="#10B981" />
                        <Text className="text-white font-extrabold text-lg mt-1">৳ {user?.mainWalletBalance ?? 0}</Text>
                        <Text className="text-slate-400 text-xs font-medium">Main Wallet</Text>
                    </View>

                    <View className="flex-1 items-center border-r border-slate-800 py-1">
                        <Ionicons name="cash-outline" size={20} color="#3B82F6" />
                        <Text className="text-white font-extrabold text-lg mt-1">৳ {user?.totalAmount ?? 0}</Text>
                        <Text className="text-slate-400 text-xs font-medium">Total Amount</Text>
                    </View>

                    <View className="flex-1 items-center py-1">
                        <Ionicons name="star" size={20} color="#F59E0B" />
                        <Text className="text-white font-extrabold text-lg mt-1">{user?.walletPoints ?? 0}</Text>
                        <Text className="text-slate-400 text-xs font-medium">Points</Text>
                    </View>
                </View>
            </View>

            <View className="px-5 mb-6">
                <Text className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-wider">Personal Information</Text>

                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-4 gap-y-4">
                    <View className="flex-row items-center justify-between border-b border-slate-800/80 pb-3">
                        <View className="flex-row items-center">
                            <Ionicons name="call-outline" size={18} color="#94A3B8" />
                            <Text className="text-slate-400 text-sm ml-3">Contact Number</Text>
                        </View>
                        <Text className="text-white font-semibold text-sm">{user?.contactNo || "N/A"}</Text>
                    </View>

                    <View className="flex-row items-center justify-between border-b border-slate-800/80 pb-3">
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={18} color="#94A3B8" />
                            <Text className="text-slate-400 text-sm ml-3">Gender</Text>
                        </View>
                        <Text className="text-white font-semibold text-sm">{user?.gender || "N/A"}</Text>
                    </View>

                    <View className="flex-row items-center justify-between border-b border-slate-800/80 pb-3">
                        <View className="flex-row items-center">
                            <Ionicons name="briefcase-outline" size={18} color="#94A3B8" />
                            <Text className="text-slate-400 text-sm ml-3">Profession</Text>
                        </View>
                        <Text className="text-white font-semibold text-sm capitalize">{user?.profession || "N/A"}</Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <Ionicons name="card-outline" size={18} color="#94A3B8" />
                            <Text className="text-slate-400 text-sm ml-3">NID Number</Text>
                        </View>
                        <Text className="text-white font-semibold text-sm">{user?.nidNo || "N/A"}</Text>
                    </View>
                </View>
            </View>

            <View className="px-5 mb-6">
                <Text className="text-slate-400 font-bold text-sm mb-3 uppercase tracking-wider">Verification Documents</Text>

                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-slate-300 font-medium text-sm">Document Verification</Text>
                        <View className={`px-2.5 py-1 rounded-full ${user?.isDocumentVerification ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-amber-500/10 border border-amber-500/30"}`}>
                            <Text className={`text-xs font-bold ${user?.isDocumentVerification ? "text-emerald-400" : "text-amber-400"}`}>
                                {user?.isDocumentVerification ? "Approved" : "Pending"}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between gap-3">
                        {user?.nidFront && (
                            <View className="flex-1">
                                <Text className="text-slate-400 text-xs mb-1.5 font-medium">NID Front</Text>
                                <Image
                                    source={{ uri: user.nidFront }}
                                    className="w-full h-24 rounded-2xl bg-slate-800 border border-slate-700"
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        {user?.nidBack && (
                            <View className="flex-1">
                                <Text className="text-slate-400 text-xs mb-1.5 font-medium">NID Back</Text>
                                <Image
                                    source={{ uri: user.nidBack }}
                                    className="w-full h-24 rounded-2xl bg-slate-800 border border-slate-700"
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View className="px-5 mb-28">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={logout}
                    className="bg-red-500/10 border border-red-500/30 py-4 rounded-2xl flex-row justify-center items-center"
                >
                    <Feather name="log-out" size={18} color="#EF4444" />
                    <Text className="text-red-500 font-bold text-base ml-2">Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};