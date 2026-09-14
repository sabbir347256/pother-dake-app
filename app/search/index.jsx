import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Octicons, FontAwesome5 } from "@expo/vector-icons";
import SearchForm from "../../src/components/HomeSection/SearchForm/SearchForm";

const mockRides = [
    {
        id: "1",
        driverName: "Tanvir Ahmed",
        avatar: "https://i.pravatar.cc/150?img=11",
        rating: "4.9",
        from: "Dhaka",
        to: "Chittagong",
        date: "14 Sep, 08:00 AM",
        price: "৳ 850",
        seatsLeft: 2,
        carModel: "Toyota Premio",
    },
    {
        id: "2",
        driverName: "Rahim Chowdhury",
        avatar: "https://i.pravatar.cc/150?img=12",
        rating: "4.8",
        from: "Dhaka",
        to: "Sylhet",
        date: "14 Sep, 10:30 AM",
        price: "৳ 700",
        seatsLeft: 3,
        carModel: "Honda Vezel",
    },
    {
        id: "3",
        driverName: "Sabbir Hossain",
        avatar: "https://i.pravatar.cc/150?img=33",
        rating: "5.0",
        from: "Dhaka",
        to: "Cox's Bazar",
        date: "15 Sep, 06:00 AM",
        price: "৳ 1200",
        seatsLeft: 1,
        carModel: "Toyota Axio",
    },
];

export default function SearchScreen() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <SearchForm />

            <View className="px-5 pb-28">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-bold">Available Rides</Text>
                    <Text className="text-emerald-400 text-sm font-semibold">See All</Text>
                </View>

                {mockRides.map((ride) => (
                    <TouchableOpacity
                        key={ride.id}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/search/${ride.id}`)}
                        className="bg-[#111827] border border-slate-800 rounded-2xl p-4 mb-4"
                    >
                        <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-slate-800">
                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: ride.avatar }}
                                    className="w-10 h-10 rounded-full bg-slate-700"
                                />
                                <View className="ml-3">
                                    <Text className="text-white font-semibold text-base">{ride.driverName}</Text>
                                    <Text className="text-slate-400 text-xs">{ride.carModel}</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center bg-[#1E293B] px-2.5 py-1 rounded-full">
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text className="text-amber-400 text-xs font-bold ml-1">{ride.rating}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-1">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="location-sharp" size={16} color="#10B981" />
                                    <Text className="text-white font-medium ml-2">{ride.from}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="location-sharp" size={16} color="#EF4444" />
                                    <Text className="text-white font-medium ml-2">{ride.to}</Text>
                                </View>
                            </View>

                            <View className="items-end">
                                <Text className="text-emerald-400 text-xl font-extrabold">{ride.price}</Text>
                                <Text className="text-slate-400 text-xs">per seat</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center bg-[#1E293B]/60 rounded-xl px-3 py-2.5">
                            <View className="flex-row items-center">
                                <Octicons name="calendar" size={14} color="#94A3B8" />
                                <Text className="text-slate-300 text-xs ml-2">{ride.date}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <FontAwesome5 name="chair" size={12} color="#10B981" />
                                <Text className="text-emerald-400 text-xs font-semibold ml-1.5">
                                    {ride.seatsLeft} seat{ride.seatsLeft > 1 ? "s" : ""} left
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}