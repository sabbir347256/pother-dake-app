import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, Octicons } from "@expo/vector-icons";
import axios from "axios";
import Toast from "react-native-toast-message";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";
import config from "../../../src/Utils/envConfig";

export default function MyBookingsScreen() {
  const router = useRouter();
  const { token, user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyBookings = async () => {
    try {
      const response = await axios.get(
        `${config?.backendUrl}/tripBookedRoute/my-bookings`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = response.data;
      if (Array.isArray(result)) {
        setBookings(result);
      } else if (Array.isArray(result?.data)) {
        setBookings(result.data);
      } else if (Array.isArray(result?.result)) {
        setBookings(result.result);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch your bookings.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyBookings();
  };

  const handleChatWithDriver = (driver) => {
    const driverId = driver?._id || (typeof driver === "string" ? driver : null);
    
    if (!driverId) {
      Toast.show({
        type: "error",
        text1: "Driver info missing",
        text2: "Cannot initiate chat with driver.",
      });
      return;
    }

    router.push({
      pathname: `/chat/${driverId}`,
      params: {
        name: driver?.fullName || driver?.name || "Driver",
        avatar: driver?.profileImage || driver?.avatar || "",
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#090D16] justify-center items-center">
        <ActivityIndicator size="large" color="#00B16A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#090D16]">
      <View className="pt-12 pb-4 px-5 flex-row items-center justify-between border-b border-slate-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-[#111827] p-2.5 rounded-full border border-slate-800"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">My Bookings</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-2 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00B16A"
          />
        }
      >
        {bookings.length === 0 ? (
          <View className="items-center justify-center py-20">
            <FontAwesome5 name="car-side" size={48} color="#334155" />
            <Text className="text-slate-400 font-medium text-base mt-4">
              No bookings found.
            </Text>
          </View>
        ) : (
          bookings.map((item, index) => {
            const trip = item?.tripId || item;
            const driver = typeof trip?.driverId === "object" ? trip.driverId : null;

            return (
              <View
                key={item?._id || index}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-3 mb-4"
              >
                <View className="flex-row justify-between items-center pb-3 border-b border-slate-800">
                  <View className="flex-row items-center">
                    <Image
                      source={{
                        uri:
                          driver?.profileImage ||
                          "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                      }}
                      className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700"
                    />
                    <View className="ml-3">
                      <Text className="text-white font-bold text-sm">
                        {driver?.fullName || "Driver"}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {trip?.vehicleType || "Vehicle"}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <Text className="text-emerald-400 font-bold text-xs uppercase">
                      {item?.status || trip?.status || "CONFIRMED"}
                    </Text>
                  </View>
                </View>

                <View className="my-4 flex-row items-start">
                  <View className="items-center mr-3 mt-1">
                    <Ionicons name="location-sharp" size={18} color="#10B981" />
                    <View className="w-0.5 h-6 bg-slate-700 my-1" />
                    <Ionicons name="location-sharp" size={18} color="#EF4444" />
                  </View>

                  <View className="flex-1 justify-between h-16">
                    <View>
                      <Text className="text-slate-400 text-[10px]">Pickup</Text>
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                        {trip?.startingPoint?.addressName || "N/A"}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-slate-400 text-[10px]">Destination</Text>
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>
                        {trip?.destination?.addressName || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-slate-800 mb-4">
                  <View className="flex-row items-center">
                    <Octicons name="calendar" size={14} color="#94A3B8" />
                    <Text className="text-slate-300 text-xs ml-1.5">
                      {trip?.date || "N/A"}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#94A3B8" />
                    <Text className="text-slate-300 text-xs ml-1.5">
                      {trip?.departureTime || "N/A"}
                    </Text>
                  </View>

                  <Text className="text-emerald-400 font-extrabold text-base">
                    ৳ {trip?.pricePerSeat || 0}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleChatWithDriver(driver || trip?.driverId)}
                  className="bg-[#1E293B] border border-slate-700 py-3 rounded-2xl flex-row justify-center items-center"
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-sm ml-2">Chat with Driver</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}