import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import config from '../../../src/Utils/envConfig';
import { useAuth } from '../../../src/AuthProvider/AuthProvider';

export default function DriverBookingsScreen() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const fetchDriverBookings = async () => {
    const response = await axios.get(`${config.backendUrl}/tripBookedRoute/driver-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  };

  const updateStatusRequest = async ({ bookingId, status }) => {
    const response = await axios.patch(
      `${config.backendUrl}/tripBookedRoute/status/${bookingId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  };

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ['driverBookings', token],
    queryFn: fetchDriverBookings,
    enabled: !!token
  });

  const mutation = useMutation({
    mutationFn: updateStatusRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driverBookings'] });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: data?.message || 'Booking status updated successfully'
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Something went wrong';
      Toast.show({
        type: 'error',
        text1: 'Notice',
        text2: errorMessage
      });
    }
  });

  const handleStatusChange = (bookingId, status) => {
    mutation.mutate({ bookingId, status });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-950">
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-950 px-4">
        <Text className="text-red-400 font-semibold text-lg text-center">Failed to load bookings</Text>
      </View>
    );
  }

  const activeBookings = bookings?.filter((item) => item.status !== 'CANCELLED') || [];

  const renderBookingCard = ({ item }) => {
    const passenger = item.passengerId || {};
    const trip = item.tripId || {};

    return (
      <View className="bg-zinc-900 border border-zinc-800 m-3 p-5 rounded-2xl shadow-xl">
        <View className="flex-row items-center mb-4">
          <Image
            source={{
              uri: passenger.profileImage || 'https://via.placeholder.com/150'
            }}
            className="w-14 h-14 rounded-full border-2 border-indigo-500 mr-3"
          />
          <View className="flex-1">
            <Text className="text-lg font-bold text-zinc-100">{passenger.name || 'Passenger Name'}</Text>
            <Text className="text-xs text-zinc-400">{passenger.email || 'passenger@example.com'}</Text>
            <Text className="text-xs text-zinc-500 mt-0.5">{passenger.phone || 'N/A'}</Text>
          </View>

          <View className={`px-3 py-1.5 rounded-full border ${
            item.status === 'CONFIRMED' ? 'bg-emerald-950 border-emerald-800' :
            item.status === 'COMPLETED' ? 'bg-indigo-950 border-indigo-800' : 'bg-amber-950 border-amber-800'
          }`}>
            <Text className={`text-xs font-bold tracking-wider ${
              item.status === 'CONFIRMED' ? 'text-emerald-400' :
              item.status === 'COMPLETED' ? 'text-indigo-400' : 'text-amber-400'
            }`}>
              {item.status}
            </Text>
          </View>
        </View>

        <View className="bg-zinc-800/60 p-4 rounded-xl border border-zinc-700/50 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Trip Route</Text>
            <Text className="text-xs text-indigo-400 font-medium">Seats: {item.seatsBooked}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-base font-bold text-zinc-200">{trip.from || 'Start'}</Text>
            <Text className="text-indigo-500 font-bold mx-2">➔</Text>
            <Text className="text-base font-bold text-zinc-200">{trip.to || 'Destination'}</Text>
          </View>

          <View className="flex-row items-center justify-between pt-2 border-t border-zinc-700/40 mt-1">
            <Text className="text-xs text-zinc-400">Departure: {trip.departureTime || 'N/A'}</Text>
            <Text className="text-base font-extrabold text-emerald-400">${item.totalPrice}</Text>
          </View>
        </View>

        {item.status === 'CONFIRMED' ? (
          <View className="bg-emerald-950/60 border border-emerald-800/60 py-3 rounded-xl items-center">
            <Text className="text-emerald-400 font-bold text-sm tracking-wide">
              You confirmed this ride
            </Text>
          </View>
        ) : (
          <View className="flex-row justify-between space-x-3">
            <TouchableOpacity
              onPress={() => handleStatusChange(item._id, 'CANCELLED')}
              disabled={mutation.isPending}
              className="flex-1 bg-rose-600/90 active:bg-rose-700 py-3 rounded-xl items-center border border-rose-500/30"
            >
              <Text className="text-white font-bold tracking-wide">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleStatusChange(item._id, 'CONFIRMED')}
              disabled={mutation.isPending}
              className="flex-1 bg-emerald-600/90 active:bg-emerald-700 py-3 rounded-xl items-center border border-emerald-500/30"
            >
              <Text className="text-white font-bold tracking-wide">Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
        <Toast></Toast>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-zinc-950 pt-6">
      <View className="px-5 pb-4 mb-2 border-b border-zinc-800/80 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-extrabold text-zinc-100 tracking-tight">
            Booking Ride
          </Text>
          <Text className="text-xs text-zinc-400 font-medium mt-0.5">
            Manage passenger booking requests
          </Text>
        </View>
        <View className="bg-indigo-950/80 border border-indigo-800/60 px-3 py-1.5 rounded-full">
          <Text className="text-xs font-bold text-indigo-400">
            {activeBookings.length} {activeBookings.length === 1 ? 'Ride' : 'Rides'}
          </Text>
        </View>
      </View>

      <FlatList
        data={activeBookings}
        keyExtractor={(item) => item._id}
        renderItem={renderBookingCard}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-zinc-500 font-medium">No bookings available</Text>
          </View>
        }
      />
      <Toast></Toast>
    </View>
  );
}