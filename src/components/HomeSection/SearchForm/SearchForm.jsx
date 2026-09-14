import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons, Octicons, Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function SearchForm() {
    const { control, handleSubmit } = useForm({
        defaultValues: {
            from: "Dhaka",
            to: "Chittagong",
            date: "",
            passengers: "1",
        },
    });

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <View className="bg-[#00B16A] pt-14 pb-16 px-6 rounded-b-[32px]">
                <Text className="text-white text-3xl font-extrabold">Pother Dake</Text>
                <Text className="text-emerald-100 text-sm mt-1">Find your perfect ride companion</Text>
            </View>

            <View className="px-5 -mt-10 mb-20">
                <View className="bg-[#111827] p-5 rounded-3xl border border-slate-800">
                    <Text className="text-slate-400 font-semibold mb-2">From</Text>
                    <View className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-4 py-3 mb-4">
                        <Ionicons name="location-sharp" size={20} color="#10B981" />
                        <Controller
                            control={control}
                            name="from"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="From location"
                                    placeholderTextColor="#64748B"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    <Text className="text-slate-400 font-semibold mb-2">To</Text>
                    <View className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-4 py-3 mb-4">
                        <Ionicons name="location-sharp" size={20} color="#EF4444" />
                        <Controller
                            control={control}
                            name="to"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <TextInput
                                    className="flex-1 ml-3 text-white text-base"
                                    placeholder="To destination"
                                    placeholderTextColor="#64748B"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>

                    <View className="flex-row justify-between mb-5">
                        <View className="w-[48%]">
                            <Text className="text-slate-400 font-semibold mb-2">Date</Text>
                            <Controller
                                control={control}
                                name="date"
                                render={({ field: { onChange, value } }) => {
                                    const [showPicker, setShowPicker] = useState(false);
                                    const selectedDate = value ? new Date(value) : new Date();

                                    const handleDateChange = (event, date) => {
                                        setShowPicker(Platform.OS === "ios");
                                        if (date) {
                                            const formattedDate = date.toLocaleDateString("en-US");
                                            onChange(formattedDate);
                                        }
                                    };

                                    return (
                                        <View>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => setShowPicker(true)}
                                                className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-3 py-3"
                                            >
                                                <Octicons name="calendar" size={16} color="#64748B" />
                                                <Text className={`ml-2 text-sm ${value ? "text-white" : "text-[#64748B]"}`}>
                                                    {value || "mm/dd/yyyy"}
                                                </Text>
                                            </TouchableOpacity>

                                            {showPicker && (
                                                <DateTimePicker
                                                    value={selectedDate}
                                                    mode="date"
                                                    display="default"
                                                    onChange={handleDateChange}
                                                    minimumDate={new Date()}
                                                />
                                            )}
                                        </View>
                                    );
                                }}
                            />
                        </View>

                        <View className="w-[48%]">
                            <Text className="text-slate-400 font-semibold mb-2">Passengers</Text>
                            <View className="flex-row items-center justify-between bg-[#1E293B] border border-slate-700/60 rounded-2xl px-3">
                                <View className="flex-row items-center flex-1">
                                    <Octicons name="people" size={16} color="#64748B" />
                                    <Controller
                                        control={control}
                                        name="passengers"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                className="flex-1 ml-2 text-white text-sm"
                                                keyboardType="numeric"
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                            />
                                        )}
                                    />
                                </View>
                                <Feather name="chevron-down" size={16} color="#64748B" />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="bg-[#00B16A] py-4 rounded-2xl flex-row items-center justify-center"
                        onPress={handleSubmit(onSubmit)}
                    >
                        <Octicons name="search" size={20} color="#FFFFFF" />
                        <Text className="text-white text-base font-bold ml-2">Search Rides</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between mt-5">
                    <TouchableOpacity className="w-[31%] bg-[#111827] border border-slate-800 py-3.5 rounded-2xl items-center">
                        <Ionicons name="time-outline" size={22} color="#10B981" />
                        <Text className="text-slate-400 text-xs font-semibold mt-1">Tomorrow</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[31%] bg-[#111827] border border-slate-800 py-3.5 rounded-2xl items-center">
                        <Octicons name="calendar" size={20} color="#10B981" />
                        <Text className="text-slate-400 text-xs font-semibold mt-1">Weekend</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-[31%] bg-[#111827] border border-slate-800 py-3.5 rounded-2xl items-center">
                        <Feather name="trending-up" size={20} color="#10B981" />
                        <Text className="text-slate-400 text-xs font-semibold mt-1">Return</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}