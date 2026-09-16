import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Modal,
    FlatList,
    Platform,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Octicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import config from "../../../src/Utils/envConfig";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";

const BANGLADESH_DISTRICTS = [
    "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogra", "Brahmanbaria",
    "Chandpur", "Chittagong", "Chuadanga", "Comilla", "Cox's Bazar", "Dhaka",
    "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
    "Jamalpur", "Jessore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
    "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat",
    "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
    "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore",
    "Nawabganj", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
    "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur",
    "Satkhira", "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet",
    "Tangail", "Thakurgaon"
];

const DISTRICT_COORDINATES = {
    "Dhaka": { lat: 23.8103, lng: 90.4125 },
    "Chittagong": { lat: 22.3569, lng: 91.8317 },
    "Bagerhat": { lat: 22.6515, lng: 89.7859 },
    "Bandarban": { lat: 21.8311, lng: 92.3686 },
    "Barguna": { lat: 22.1570, lng: 90.1251 },
    "Sylhet": { lat: 24.8949, lng: 91.8687 },
    "Cox's Bazar": { lat: 21.4272, lng: 92.0058 },
};

export default function SearchScreen() {
    const { token } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
    const [isSearched, setIsSearched] = useState(false);
    const [searchFilterParams, setSearchFilterParams] = useState(null);

    const [districtModal, setDistrictModal] = useState({ visible: false, targetField: "" });
    const [districtSearchQuery, setDistrictSearchQuery] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const { control, handleSubmit, setValue, watch, reset } = useForm({
        defaultValues: {
            from: "",
            to: "",
            date: null,
            time: null,
            vehicleType: "",
        },
    });

    const selectedFrom = watch("from");
    const selectedTo = watch("to");

    const filteredDistricts = BANGLADESH_DISTRICTS.filter((district) =>
        district.toLowerCase().includes(districtSearchQuery.toLowerCase())
    );

    const fetchTrips = async (searchParams = null, pageNum = 1) => {
        setLoading(true);
        try {
            let endpoint = `${config?.backendUrl}/tripRoute/find-rides`;
            const queryParams = new URLSearchParams();

            queryParams.append("page", pageNum.toString());
            queryParams.append("limit", "10");

            if (searchParams) {
                if (searchParams.from && DISTRICT_COORDINATES[searchParams.from]) {
                    const fromCoords = DISTRICT_COORDINATES[searchParams.from];
                    queryParams.append("fromLat", fromCoords.lat.toString());
                    queryParams.append("fromLng", fromCoords.lng.toString());
                }
                if (searchParams.to && DISTRICT_COORDINATES[searchParams.to]) {
                    const toCoords = DISTRICT_COORDINATES[searchParams.to];
                    queryParams.append("toLat", toCoords.lat.toString());
                    queryParams.append("toLng", toCoords.lng.toString());
                }
                if (searchParams.date instanceof Date) {
                    queryParams.append("date", searchParams.date.toISOString().split("T")[0]);
                }
                if (searchParams.vehicleType) {
                    queryParams.append("vehicleType", searchParams.vehicleType);
                }
            }

            const queryString = queryParams.toString();
            const fullUrl = queryString ? `${endpoint}?${queryString}` : endpoint;

            const response = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (result?.data) {
                const fetchedDocs = result.data.docs || result.data || [];
                setTrips(Array.isArray(fetchedDocs) ? fetchedDocs : []);
                setPagination({
                    page: result.data.page || pageNum,
                    totalPages: result.data.totalPages || 1,
                    limit: 10,
                });
            } else {
                setTrips([]);
            }
        } catch (error) {
            console.error("Fetch Trips Error:", error);
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips(null, 1);
    }, []);

    const onSubmit = (data) => {
        setIsSearched(true);
        setSearchFilterParams(data);
        fetchTrips(data, 1);
    };

    const handleResetSearch = () => {
        setIsSearched(false);
        setSearchFilterParams(null);
        reset();
        fetchTrips(null, 1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchTrips(searchFilterParams, newPage);
        }
    };

    const formatDisplayTime = (time) => {
        if (!time) return "Select Time";
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${hours}:${formattedMinutes} ${ampm}`;
    };

    const openDistrictModal = (targetField) => {
        setDistrictSearchQuery("");
        setDistrictModal({ visible: true, targetField });
    };

    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <View className="bg-[#00B16A] pt-8 pb-16 px-6 rounded-b-[32px]">
                <Text className="text-white text-3xl font-extrabold">Pother Dake</Text>
                <Text className="text-emerald-100 text-sm mt-1">Find your perfect ride companion</Text>
            </View>

            <View className="px-5 -mt-10 mb-8">
                <View className="bg-[#111827] p-5 rounded-3xl border border-slate-800">
                    <Text className="text-slate-400 font-semibold mb-2">From</Text>
                    <TouchableOpacity
                        onPress={() => openDistrictModal("from")}
                        className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-4 py-3 mb-4 justify-between"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="location-sharp" size={20} color="#10B981" />
                            <Text className="ml-3 text-white text-base">{selectedFrom || "Select Starting District"}</Text>
                        </View>
                        <Feather name="chevron-down" size={18} color="#64748B" />
                    </TouchableOpacity>

                    <Text className="text-slate-400 font-semibold mb-2">To</Text>
                    <TouchableOpacity
                        onPress={() => openDistrictModal("to")}
                        className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-4 py-3 mb-4 justify-between"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="location-sharp" size={20} color="#EF4444" />
                            <Text className="ml-3 text-white text-base">{selectedTo || "Select Destination District"}</Text>
                        </View>
                        <Feather name="chevron-down" size={18} color="#64748B" />
                    </TouchableOpacity>

                    <View className="flex-row justify-between mb-5">
                        <View className="w-[48%]">
                            <Text className="text-slate-400 font-semibold mb-2">Date</Text>
                            <Controller
                                control={control}
                                name="date"
                                render={({ field: { value, onChange } }) => (
                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => setShowDatePicker(true)}
                                            className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-3 py-3"
                                        >
                                            <Octicons name="calendar" size={16} color="#64748B" />
                                            <Text className="ml-2 text-xs text-white">
                                                {value ? value.toISOString().split("T")[0] : "Select Date"}
                                            </Text>
                                        </TouchableOpacity>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={value || new Date()}
                                                mode="date"
                                                display="default"
                                                onChange={(event, selectedDate) => {
                                                    setShowDatePicker(Platform.OS === "ios");
                                                    if (selectedDate) onChange(selectedDate);
                                                }}
                                                minimumDate={new Date()}
                                            />
                                        )}
                                    </View>
                                )}
                            />
                        </View>

                        <View className="w-[48%]">
                            <Text className="text-slate-400 font-semibold mb-2">Time</Text>
                            <Controller
                                control={control}
                                name="time"
                                render={({ field: { value, onChange } }) => (
                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            onPress={() => setShowTimePicker(true)}
                                            className="flex-row items-center bg-[#1E293B] border border-slate-700/60 rounded-2xl px-3 py-3"
                                        >
                                            <Ionicons name="time-outline" size={16} color="#64748B" />
                                            <Text className="ml-2 text-xs text-white">
                                                {formatDisplayTime(value)}
                                            </Text>
                                        </TouchableOpacity>
                                        {showTimePicker && (
                                            <DateTimePicker
                                                value={value || new Date()}
                                                mode="time"
                                                display="default"
                                                onChange={(event, selectedTime) => {
                                                    setShowTimePicker(Platform.OS === "ios");
                                                    if (selectedTime) onChange(selectedTime);
                                                }}
                                            />
                                        )}
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className={`bg-[#00B16A] py-4 rounded-2xl flex-row items-center justify-center ${isSearched ? "w-[68%]" : "w-full"}`}
                            onPress={handleSubmit(onSubmit)}
                        >
                            <Octicons name="search" size={20} color="#FFFFFF" />
                            <Text className="text-white text-base font-bold ml-2">Search Rides</Text>
                        </TouchableOpacity>

                        {isSearched && (
                            <TouchableOpacity
                                activeOpacity={0.8}
                                className="bg-slate-800 border border-slate-700 py-4 px-4 rounded-2xl flex-row items-center justify-center w-[28%]"
                                onPress={handleResetSearch}
                            >
                                <Text className="text-slate-300 text-sm font-semibold">Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* District Selection Modal with Search Input */}
            <Modal visible={districtModal.visible} transparent animationType="slide">
                <View className="flex-1 bg-black/70 justify-end">
                    <View className="bg-[#111827] h-[75%] rounded-t-3xl p-5 border-t border-slate-800">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white text-lg font-bold">
                                Select {districtModal.targetField === "from" ? "Starting" : "Destination"} District
                            </Text>
                            <TouchableOpacity onPress={() => setDistrictModal({ visible: false, targetField: "" })}>
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Input Field */}
                        <View className="flex-row items-center bg-[#1E293B] border border-slate-700 rounded-2xl px-3 py-2.5 mb-4">
                            <Octicons name="search" size={18} color="#64748B" />
                            <TextInput
                                value={districtSearchQuery}
                                onChangeText={setDistrictSearchQuery}
                                placeholder="Search district name..."
                                placeholderTextColor="#64748B"
                                className="flex-1 ml-2 text-white text-base p-0"
                                autoCapitalize="none"
                            />
                            {districtSearchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setDistrictSearchQuery("")}>
                                    <Ionicons name="close-circle" size={18} color="#64748B" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* District List */}
                        <FlatList
                            data={filteredDistricts}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={() => (
                                <View className="items-center py-8">
                                    <Text className="text-slate-400">No district matches "{districtSearchQuery}"</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="py-3.5 border-b border-slate-800/80 flex-row items-center justify-between"
                                    onPress={() => {
                                        setValue(districtModal.targetField, item);
                                        setDistrictModal({ visible: false, targetField: "" });
                                    }}
                                >
                                    <Text className="text-slate-200 text-base">{item}</Text>
                                    <Feather name="chevron-right" size={16} color="#475569" />
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            <View className="px-5 pb-28">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-bold">
                        {isSearched ? "Search Results" : "All Available Rides"}
                    </Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#00B16A" className="my-10" />
                ) : trips.length === 0 ? (
                    <View className="items-center py-10">
                        <Text className="text-slate-400">
                            {isSearched ? "No trips found matching your search." : "No available trips found."}
                        </Text>
                    </View>
                ) : (
                    trips.map((ride) => (
                        <TouchableOpacity
                            key={ride._id}
                            activeOpacity={0.8}
                            onPress={() => router.push(`/search/${ride._id}`)}
                            className="bg-[#111827] border border-slate-800 rounded-2xl p-4 mb-4"
                        >
                            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-slate-800">
                                <View className="flex-row items-center">
                                    <Image
                                        source={{ uri: ride.driverId?.profileImage || "https://i.pravatar.cc/150" }}
                                        className="w-10 h-10 rounded-full bg-slate-700"
                                    />
                                    <View className="ml-3">
                                        <Text className="text-white font-semibold text-base">{ride.driverId?.fullName || "Driver"}</Text>
                                        <Text className="text-slate-400 text-xs">{ride.vehicleType}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center bg-[#1E293B] px-2.5 py-1 rounded-full">
                                    <Ionicons name="star" size={12} color="#F59E0B" />
                                    <Text className="text-amber-400 text-xs font-bold ml-1">5.0</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="location-sharp" size={16} color="#10B981" />
                                        <Text className="text-white font-medium ml-2">{ride.startingPoint?.addressName || "N/A"}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Ionicons name="location-sharp" size={16} color="#EF4444" />
                                        <Text className="text-white font-medium ml-2">{ride.destination?.addressName || "N/A"}</Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-emerald-400 text-xl font-extrabold">৳ {ride.pricePerSeat}</Text>
                                    <Text className="text-slate-400 text-xs">per seat</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center bg-[#1E293B]/60 rounded-xl px-3 py-2.5">
                                <View className="flex-row items-center">
                                    <Octicons name="calendar" size={14} color="#94A3B8" />
                                    <Text className="text-slate-300 text-xs ml-2">{ride.date || "Flexible Date"}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="chair" size={12} color="#10B981" />
                                    <Text className="text-emerald-400 text-xs font-semibold ml-1.5">
                                        {ride.availableSeats} seat{ride.availableSeats > 1 ? "s" : ""} left
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                {pagination.totalPages > 1 && (
                    <View className="flex-row justify-between items-center mt-4 px-2">
                        <TouchableOpacity
                            disabled={pagination.page === 1}
                            onPress={() => handlePageChange(pagination.page - 1)}
                            className={`px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 ${pagination.page === 1 ? "opacity-40" : "opacity-100"}`}
                        >
                            <Text className="text-white text-sm font-semibold">Previous</Text>
                        </TouchableOpacity>

                        <Text className="text-slate-400 text-sm">
                            Page {pagination.page} of {pagination.totalPages}
                        </Text>

                        <TouchableOpacity
                            disabled={pagination.page === pagination.totalPages}
                            onPress={() => handlePageChange(pagination.page + 1)}
                            className={`px-4 py-2 rounded-xl bg-[#111827] border border-slate-800 ${pagination.page === pagination.totalPages ? "opacity-40" : "opacity-100"}`}
                        >
                            <Text className="text-white text-sm font-semibold">Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}