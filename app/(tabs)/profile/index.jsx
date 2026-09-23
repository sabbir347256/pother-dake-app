import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    Modal,
    Alert,
    Platform
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import config from "../../../src/Utils/envConfig";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
    const { token, logout } = useAuth();
    console.log(token)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [imageUploading, setImageUploading] = useState(false);

    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [rechargeAmount, setRechargeAmount] = useState("");
    const [isRecharging, setIsRecharging] = useState(false);

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
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUserProfile();
    };

    const handlePickAndUploadImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert("Permission Required", "Permission to access camera roll is required!");
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (pickerResult.canceled || !pickerResult.assets?.[0]?.uri) {
                return;
            }

            setImageUploading(true);
            const asset = pickerResult.assets[0];

            const formData = new FormData();

            // Web Platform সাপোর্ট করার জন্য Blob Handling
            if (Platform.OS === 'web') {
                const response = await fetch(asset.uri);
                const blob = await response.blob();
                formData.append("profileImage", blob, "profile.jpg");
            } else {
                // Native (Android / iOS) Platform
                const fileName = asset.uri.split("/").pop() || "profile.jpg";
                const match = /\.(\w+)$/.exec(fileName);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append("profileImage", {
                    uri: asset.uri,
                    name: fileName,
                    type: type,
                });
            }

            const response = await fetch(`${config?.backendUrl}/user/update-profile-image`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    // 'Content-Type' হেডার দেওয়া যাবে না! ব্রাউজার/ইঞ্জিন নিজে সেট করবে
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result?.success) {
                Alert.alert("Success", "Profile image updated successfully!");
                fetchUserProfile();
            } else {
                Alert.alert("Error", result?.message || "Failed to update profile image.");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setImageUploading(false);
        }
    };

    const handleRechargeWallet = async () => {
        if (!rechargeAmount || isNaN(rechargeAmount) || Number(rechargeAmount) <= 0) {
            Alert.alert("Invalid Input", "Please enter a valid amount!");
            return;
        }

        try {
            setIsRecharging(true);
            const response = await fetch(`${config?.backendUrl}/user/recharge-wallet`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ amount: Number(rechargeAmount) }),
            });

            const result = await response.json();

            if (response.ok && result?.success) {
                Toast.show({
                    type: "success",
                    text1: "Wallet recharged successfully!",
                });
                Alert.alert("Success", "Wallet recharged successfully!");
                setRechargeAmount("");
                setIsRechargeModalOpen(false);
                fetchUserProfile();
            } else {
                Alert.alert("Error", result?.message || "Failed to recharge wallet.");
            }
        } catch (error) {
            console.error("Error recharging wallet:", error);
            Alert.alert("Error", "An unexpected error occurred.");
        } finally {
            setIsRecharging(false);
        }
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
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handlePickAndUploadImage}
                        disabled={imageUploading}
                        className="absolute bottom-0 right-[#090D16] bg-[#090D16] p-2 rounded-full border border-emerald-400 items-center justify-center"
                    >
                        {imageUploading ? (
                            <ActivityIndicator size="small" color="#00B16A" />
                        ) : (
                            <Feather name="camera" size={14} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>

                    {user?.isVerified && (
                        <View className="absolute top-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-[#090D16]">
                            <MaterialIcons name="verified" size={16} color="#FFFFFF" />
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

            {user?.role === 'DRIVER' && (
                <View className="px-5 -mt-10 mb-6">
                    <View className="bg-[#111827] border border-slate-800 rounded-3xl p-4">
                        <View className="flex-row justify-between items-center pb-3 mb-3 border-b border-slate-800">
                            <View className="flex-1 items-center border-r border-slate-800 py-1">
                                <FontAwesome5 name="wallet" size={18} color="#10B981" />
                                <Text className="text-white font-extrabold text-lg mt-1">৳ {user?.mainWalletBalance ?? 0}</Text>
                                <Text className="text-slate-400 text-xs font-medium">Main Wallet</Text>
                            </View>

                            <View className="flex-1 items-center border-r border-slate-800 py-1">
                                <Ionicons name="cash-outline" size={20} color="#3B82F6" />
                                <Text className="text-white font-extrabold text-lg mt-1">৳ {user?.totalAmount ?? 0}</Text>
                                <Text className="text-slate-400 text-xs font-medium">Total Income</Text>
                            </View>

                            <View className="flex-1 items-center py-1">
                                <Ionicons name="star" size={20} color="#F59E0B" />
                                <Text className="text-white font-extrabold text-lg mt-1">{user?.walletPoints ?? 0}</Text>
                                <Text className="text-slate-400 text-xs font-medium">Points</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsRechargeModalOpen(true)}
                            className="bg-[#00B16A] py-2.5 rounded-xl flex-row justify-center items-center"
                        >
                            <FontAwesome5 name="plus-circle" size={14} color="#FFFFFF" />
                            <Text className="text-white font-bold text-sm ml-2">Recharge Wallet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

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

            <Modal
                visible={isRechargeModalOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsRechargeModalOpen(false)}
            >
                <View className="flex-1 bg-black/70 justify-center items-center px-6">
                    <View className="bg-[#111827] border border-slate-800 w-full rounded-3xl p-5">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white font-bold text-lg">Recharge Main Wallet</Text>
                            <TouchableOpacity onPress={() => setIsRechargeModalOpen(false)}>
                                <Ionicons name="close" size={22} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-400 text-xs mb-2">Enter Recharge Amount (৳)</Text>
                        <TextInput
                            keyboardType="numeric"
                            placeholder="e.g. 500"
                            placeholderTextColor="#64748B"
                            value={rechargeAmount}
                            onChangeText={setRechargeAmount}
                            className="bg-[#1F2937] text-white p-3 rounded-xl border border-slate-700 text-base font-semibold mb-5"
                        />

                        <View className="flex-row justify-end gap-3">
                            <TouchableOpacity
                                onPress={() => setIsRechargeModalOpen(false)}
                                className="bg-slate-800 px-4 py-3 rounded-xl"
                            >
                                <Text className="text-slate-300 font-semibold text-sm">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleRechargeWallet}
                                disabled={isRecharging}
                                className="bg-[#00B16A] px-5 py-3 rounded-xl flex-row items-center justify-center min-w-[100px]"
                            >
                                {isRecharging ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className="text-white font-bold text-sm">Recharge</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Toast />
        </ScrollView>
    );
}