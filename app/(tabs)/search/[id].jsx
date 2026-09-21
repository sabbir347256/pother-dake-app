import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Ionicons,
    Octicons,
    FontAwesome5,
    MaterialIcons,
} from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import config from "../../../src/Utils/envConfig";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";

export default function RideDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { token, user } = useAuth();

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchTripDetails = async () => {
        try {
            const response = await axios.get(
                `${config?.backendUrl}/tripRoute/getDetailsTrip/${id}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const result = response.data;
            if (result?.data) {
                setTrip(result.data);
            } else if (result?.result) {
                setTrip(result.result);
            } else {
                setTrip(result);
            }
        } catch (error) {
            console.error("Error fetching trip details:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to fetch trip details.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTripDetails();
        }
    }, [id]);

    const confirmBooking = async () => {
        try {
            setBookingLoading(true);
            const passengerId = user?._id || user?.id || user?.userId;
            const payload = {
                tripId: id,
                passengerId: passengerId,
                seatsBooked: 1,
                driverId: trip?.driverId?._id || trip?.driverId,
            };

            const response = await axios.post(
                `${config?.backendUrl}/tripBookedRoute/tripBooked`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data) {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: "Trip booked successfully!",
                });
                await fetchTripDetails();
            }
        } catch (error) {
            console.error("Error booking trip:", error?.response?.data || error?.message || error);
            Toast.show({
                type: "error",
                text1: "Booking Failed",
                text2: error?.response?.data?.message || "Failed to book the ride.",
            });
        } finally {
            setBookingLoading(false);
        }
    };

    const handleChatWithDriver = () => {
        const driverId = trip?.driverId?._id || trip?.driverId;
        if (driverId) {
            router.push(`/chat/${driverId}`);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-[#090D16] justify-center items-center">
                <ActivityIndicator size="large" color="#00B16A" />
            </View>
        );
    }

    if (!trip) {
        return (
            <View className="flex-1 bg-[#090D16] justify-center items-center px-5">
                <Text className="text-slate-400 text-base">Trip details not found.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-4 bg-[#00B16A] px-6 py-2.5 rounded-2xl"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const driver = typeof trip.driverId === "object" ? trip.driverId : null;

    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <Toast></Toast>
            <View className="pt-8 px-5 flex-row items-center justify-between mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-[#111827] p-2.5 rounded-full border border-slate-800"
                >
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Ride Details</Text>
                <View className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 font-extrabold text-xs uppercase">
                        {trip.status || "PENDING"}
                    </Text>
                </View>
            </View>

            <View className="px-5 mb-6 flex-row gap-3">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleChatWithDriver}
                    className="flex-1 bg-[#1E293B] border border-slate-700 py-3.5 rounded-2xl flex-row justify-center items-center"
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white font-bold text-base ml-2">Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={confirmBooking}
                    disabled={bookingLoading}
                    className="flex-1 bg-[#00B16A] py-3.5 rounded-2xl flex-row justify-center items-center"
                >
                    {bookingLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <FontAwesome5 name="car" size={16} color="#FFFFFF" />
                            <Text className="text-white font-bold text-base ml-2">Book Ride</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View className="px-5 mb-6">
                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
                    <View className="flex-row items-center pb-4 border-b border-slate-800/80">
                        <Image
                            source={{
                                uri: driver?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                            }}
                            className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <View className="ml-4 flex-1">
                            <Text className="text-white font-extrabold text-lg">
                                {driver?.fullName || "Driver"}
                            </Text>
                            <Text className="text-slate-400 text-xs mt-0.5">
                                {driver?.contactNo || "Contact N/A"}
                            </Text>
                        </View>
                        <View className="bg-[#1E293B] px-3 py-1.5 rounded-xl flex-row items-center">
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text className="text-amber-400 text-xs font-bold ml-1">5.0</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center mt-4">
                        <View className="flex-row items-center bg-[#1E293B] px-3 py-1.5 rounded-xl">
                            <FontAwesome5 name="car-side" size={14} color="#10B981" />
                            <Text className="text-slate-200 text-xs font-semibold ml-2">
                                {trip.vehicleType}
                            </Text>
                        </View>
                        <View className="flex-row items-center bg-[#1E293B] px-3 py-1.5 rounded-xl">
                            <MaterialIcons name="flash-on" size={14} color="#3B82F6" />
                            <Text className="text-blue-400 text-xs font-bold ml-1">
                                {trip.bookingType} Booking
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="px-5 mb-6">
                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4">
                        Route & Schedule
                    </Text>

                    <View className="flex-row items-start mb-4">
                        <View className="items-center mr-3 mt-1">
                            <Ionicons name="location-sharp" size={20} color="#10B981" />
                            <View className="w-0.5 h-8 bg-slate-700 my-1" />
                            <Ionicons name="location-sharp" size={20} color="#EF4444" />
                        </View>

                        <View className="flex-1 justify-between h-20">
                            <View>
                                <Text className="text-slate-400 text-xs">Pickup Location</Text>
                                <Text className="text-white font-bold text-base">
                                    {trip.startingPoint?.addressName || "N/A"}
                                </Text>
                            </View>

                            <View>
                                <Text className="text-slate-400 text-xs">Destination</Text>
                                <Text className="text-white font-bold text-base">
                                    {trip.destination?.addressName || "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {trip.stopPoints && trip.stopPoints.length > 0 && (
                        <View className="mt-2 pt-3 border-t border-slate-800">
                            <Text className="text-slate-400 text-xs mb-2">Stoppages</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {trip.stopPoints.map((point, idx) => (
                                    <View key={idx} className="bg-[#1E293B] px-3 py-1 rounded-lg">
                                        <Text className="text-slate-300 text-xs">{point}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View className="flex-row justify-between items-center mt-5 pt-4 border-t border-slate-800">
                        <View className="flex-row items-center">
                            <Octicons name="calendar" size={16} color="#94A3B8" />
                            <Text className="text-slate-300 text-xs ml-2">
                                {trip.date || "Flexible Date"}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="time-outline" size={16} color="#94A3B8" />
                            <Text className="text-slate-300 text-xs ml-2">
                                {trip.departureTime || "Flexible Time"}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="px-5 mb-6">
                <View className="bg-[#111827] border border-slate-800 rounded-3xl p-5 flex-row justify-between items-center">
                    <View>
                        <Text className="text-slate-400 text-xs">Price Per Seat</Text>
                        <Text className="text-emerald-400 font-extrabold text-2xl mt-0.5">
                            ৳ {trip.pricePerSeat}
                        </Text>
                    </View>

                    <View className="items-end">
                        <Text className="text-slate-400 text-xs">Available Seats</Text>
                        <View className="flex-row items-center mt-1">
                            <FontAwesome5 name="chair" size={14} color="#10B981" />
                            <Text className="text-white font-bold text-lg ml-2">
                                {trip.availableSeats}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {trip.preferences && (
                <View className="px-5 mb-6">
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
                        Ride Preferences
                    </Text>
                    <View className="bg-[#111827] border border-slate-800 rounded-3xl p-5 flex-row flex-wrap gap-3">
                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.ac ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <MaterialIcons name="ac-unit" size={16} color={trip.preferences.ac ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.ac ? "text-emerald-400" : "text-slate-500"}`}>AC</Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.music ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <Ionicons name="musical-notes" size={16} color={trip.preferences.music ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.music ? "text-emerald-400" : "text-slate-500"}`}>Music</Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.helmet ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <MaterialIcons name="security" size={16} color={trip.preferences.helmet ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.helmet ? "text-emerald-400" : "text-slate-500"}`}>Helmet</Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.luggage ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <FontAwesome5 name="luggage-cart" size={14} color={trip.preferences.luggage ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.luggage ? "text-emerald-400" : "text-slate-500"}`}>
                                Luggage ({trip.preferences.maxLuggageWeight || 0} kg)
                            </Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.womenOnly ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <Ionicons name="woman" size={16} color={trip.preferences.womenOnly ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.womenOnly ? "text-emerald-400" : "text-slate-500"}`}>Women Only</Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.smoking ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <MaterialIcons name="smoke-free" size={16} color={trip.preferences.smoking ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.smoking ? "text-emerald-400" : "text-slate-500"}`}>Smoking Allowed</Text>
                        </View>

                        <View className={`px-3 py-2 rounded-xl flex-row items-center ${trip.preferences.pets ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-slate-800/40"}`}>
                            <Ionicons name="paw" size={16} color={trip.preferences.pets ? "#10B981" : "#64748B"} />
                            <Text className={`text-xs ml-2 font-medium ${trip.preferences.pets ? "text-emerald-400" : "text-slate-500"}`}>Pets Allowed</Text>
                        </View>
                    </View>
                </View>
            )}

            {trip.description && (
                <View className="px-5 mb-28">
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
                        Driver Note
                    </Text>
                    <View className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
                        <Text className="text-slate-300 text-sm leading-6">
                            "{trip.description}"
                        </Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}