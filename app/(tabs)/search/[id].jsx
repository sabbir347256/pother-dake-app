import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RideDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <View className="pt-12 px-5 flex-row items-center mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-[#111827] p-2.5 rounded-full border border-slate-800"
                >
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-4">Ride Details</Text>
            </View>

            <View className="px-5">
                <View className="bg-[#111827] p-6 rounded-3xl border border-slate-800">
                    <Text className="text-emerald-400 font-bold text-lg mb-2">Ride ID: #{id}</Text>
                    <Text className="text-slate-300 text-base">
                        Detailed information for ride ID {id} will be loaded here.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}