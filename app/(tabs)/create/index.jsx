import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Calendar,
  Bike,
  Car,
  Users,
  Shield,
  Briefcase,
  Music,
  Wind,
  Cigarette,
  CheckCircle,
  ChevronDown,
  X,
  Search,
} from "lucide-react-native";
import config from "../../../src/Utils/envConfig";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";

const BANGLADESH_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogra", "Brahmanbaria",
  "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhamrai", "Dhaka",
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

export default function CreateTripScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showArrTimePicker, setShowArrTimePicker] = useState(false);

  // Temporary JavaScript Date Objects for Picker Components
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState(new Date());
  const [tempArrTime, setTempArrTime] = useState(new Date());

  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [searchText, setSearchText] = useState("");

  const {
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startingPoint: "",
      destination: "",
      stopPoints: "",
      departureDate: "",
      departureTime: "",
      estimatedArrivalTime: "",
      vehicleType: "Bike",
      vehicleModel: "",
      vehiclePlateNumber: "",
      availableSeats: "1",
      pricePerSeat: "",
      helmetAvailable: false,
      luggageAllowed: false,
      musicAllowed: false,
      acAvailable: false,
      smokingAllowed: false,
      bookingType: "Instant Booking",
      description: "",
    },
  });

  const selectedVehicle = watch("vehicleType");
  const selectedBookingType = watch("bookingType");
  const departureDateVal = watch("departureDate");
  const departureTimeVal = watch("departureTime");
  const estimatedArrivalTimeVal = watch("estimatedArrivalTime");

  const filteredDistricts = BANGLADESH_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(searchText.toLowerCase())
  );

  const openDistrictModal = (fieldName) => {
    setCurrentField(fieldName);
    setSearchText("");
    setDistrictModalVisible(true);
  };

  const selectDistrict = (district) => {
    if (currentField) {
      setValue(currentField, district, { shouldValidate: true });
    }
    setDistrictModalVisible(false);
  };

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (step === 1) {
      fieldsToValidate = [
        "startingPoint",
        "destination",
        "departureDate",
        "departureTime",
        "estimatedArrivalTime",
      ];
    } else if (step === 2) {
      fieldsToValidate = [
        "vehicleType",
        "vehicleModel",
        "vehiclePlateNumber",
        "pricePerSeat",
      ];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Date Selection Handler
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (event.type === "set" && selectedDate) {
      setTempDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      setValue("departureDate", formattedDate, { shouldValidate: true });
    }
  };

  // Departure Time Handler
  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === "ios");
    if (event.type === "set" && selectedTime) {
      setTempTime(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setValue("departureTime", formattedTime, { shouldValidate: true });
    }
  };

  // Arrival Time Handler
  const onArrTimeChange = (event, selectedTime) => {
    setShowArrTimePicker(Platform.OS === "ios");
    if (event.type === "set" && selectedTime) {
      setTempArrTime(selectedTime);
      const formattedTime = selectedTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setValue("estimatedArrivalTime", formattedTime, { shouldValidate: true });
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);

    const formattedStopPoints = formData.stopPoints
      ? formData.stopPoints.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const bookingTypeMapped =
      formData.bookingType === "Instant Booking" ? "Instant" : "Manual";

    const payload = {
      driverId: user?._id || "664f123456789abcdef01234",
      startingPoint: {
        addressName: formData.startingPoint,
        location: {
          type: "Point",
          coordinates: [90.4125, 23.8103],
        },
      },
      destination: {
        addressName: formData.destination,
        location: {
          type: "Point",
          coordinates: [91.8317, 22.3569],
        },
      },
      stopPoints: formattedStopPoints,
      date: formData.departureDate,
      departureTime: formData.departureTime,
      estimatedArrivalTime: formData.estimatedArrivalTime,
      vehicleType: formData.vehicleType,
      availableSeats: parseInt(formData.availableSeats, 10) || 1,
      preferences: {
        ac: formData.acAvailable,
        music: formData.musicAllowed,
        luggage: formData.luggageAllowed,
        pets: false,
        smoking: formData.smokingAllowed,
        helmet: formData.helmetAvailable,
        womenOnly: false,
        maxLuggageWeight: 10,
      },
      pricePerSeat: Number(formData.pricePerSeat),
      bookingType: bookingTypeMapped,
      description: formData.description || "Driving safely.",
    };

    try {
      const response = await axios.post(
        `${config.backendUrl}/tripRoute/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response)

      if (response.data?.success || response.status === 200 || response.status === 201) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: response.data?.message || "Trip created successfully!",
        });

        setTimeout(() => {
          setLoading(false);
          router.replace("/");
        }, 1000);
      } else {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response.data?.message || "Failed to create trip",
        });
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to create trip. Please try again.",
      });
    }
  };

  return (
    <View className="flex-1 bg-[#050B14] pt-12 relative">
      <View className="px-5 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (step > 1 ? handlePrevious() : router.back())}
          className="p-1"
          disabled={loading}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Create Trip</Text>
        <View className="w-6" />
      </View>

      <View className="px-5 my-4">
        <View className="flex-row justify-between mb-2">
          <View
            className={`h-1.5 flex-1 rounded-full mr-2 ${
              step >= 1 ? "bg-[#10B981]" : "bg-[#1E293B]"
            }`}
          />
          <View
            className={`h-1.5 flex-1 rounded-full mr-2 ${
              step >= 2 ? "bg-[#10B981]" : "bg-[#1E293B]"
            }`}
          />
          <View
            className={`h-1.5 flex-1 rounded-full ${
              step >= 3 ? "bg-[#10B981]" : "bg-[#1E293B]"
            }`}
          />
        </View>
        <Text className="text-slate-400 text-xs mt-1">Step {step} of 3</Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <View>
            <Text className="text-white text-2xl font-bold mb-6">
              Route & Schedule
            </Text>

            <Text className="text-slate-300 font-medium mb-2">Starting Point</Text>
            <Controller
              control={control}
              name="startingPoint"
              rules={{ required: "Starting point is required" }}
              render={({ field: { value } }) => (
                <TouchableOpacity
                  onPress={() => openDistrictModal("startingPoint")}
                  className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center justify-between px-4 py-3.5 mb-1"
                >
                  <View className="flex-row items-center flex-1">
                    <MapPin size={20} color="#10B981" />
                    <Text className={`ml-3 text-base ${value ? "text-white" : "text-slate-500"}`}>
                      {value || "Select pickup location"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            />
            {errors.startingPoint && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.startingPoint.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Destination</Text>
            <Controller
              control={control}
              name="destination"
              rules={{ required: "Destination is required" }}
              render={({ field: { value } }) => (
                <TouchableOpacity
                  onPress={() => openDistrictModal("destination")}
                  className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center justify-between px-4 py-3.5 mb-1"
                >
                  <View className="flex-row items-center flex-1">
                    <MapPin size={20} color="#EF4444" />
                    <Text className={`ml-3 text-base ${value ? "text-white" : "text-slate-500"}`}>
                      {value || "Select drop-off location"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            />
            {errors.destination && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.destination.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">
              Stop Points
            </Text>
            <Controller
              control={control}
              name="stopPoints"
              render={({ field: { value } }) => (
                <TouchableOpacity
                  onPress={() => openDistrictModal("stopPoints")}
                  className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center justify-between px-4 py-3.5 mb-4"
                >
                  <Text className={`text-base ${value ? "text-white" : "text-slate-500"}`}>
                    {value || "Select stop point"}
                  </Text>
                  <ChevronDown size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            />

            <View className="flex-row mb-4">
              {/* Departure Date */}
              <View className="flex-1 mr-2">
                <Text className="text-slate-300 font-medium mb-2">
                  Departure Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5"
                >
                  <Calendar size={18} color="#64748B" />
                  <Text className={`ml-2 text-base ${departureDateVal ? "text-white" : "text-slate-500"}`}>
                    {departureDateVal || "YYYY-MM-DD"}
                  </Text>
                </TouchableOpacity>
                {errors.departureDate && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.departureDate.message}
                  </Text>
                )}
              </View>

              {/* Departure Time */}
              <View className="flex-1 ml-2">
                <Text className="text-slate-300 font-medium mb-2">
                  Departure Time
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(true)}
                  className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5"
                >
                  <Clock size={18} color="#64748B" />
                  <Text className={`ml-2 text-base ${departureTimeVal ? "text-white" : "text-slate-500"}`}>
                    {departureTimeVal || "08:00 AM"}
                  </Text>
                </TouchableOpacity>
                {errors.departureTime && (
                  <Text className="text-red-500 text-xs mt-1">
                    {errors.departureTime.message}
                  </Text>
                )}
              </View>
            </View>

            {/* Estimated Arrival Time */}
            <Text className="text-slate-300 font-medium mb-2">
              Estimated Arrival Time
            </Text>
            <TouchableOpacity
              onPress={() => setShowArrTimePicker(true)}
              className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1"
            >
              <Clock size={18} color="#64748B" />
              <Text className={`ml-2 text-base ${estimatedArrivalTimeVal ? "text-white" : "text-slate-500"}`}>
                {estimatedArrivalTimeVal || "01:00 PM"}
              </Text>
            </TouchableOpacity>
            {errors.estimatedArrivalTime && (
              <Text className="text-red-500 text-xs mb-4">
                {errors.estimatedArrivalTime.message}
              </Text>
            )}

            {/* DateTimePickers */}
            {showDatePicker && (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={new Date()}
                onChange={onDateChange}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}

            {showArrTimePicker && (
              <DateTimePicker
                value={tempArrTime}
                mode="time"
                is24Hour={false}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onArrTimeChange}
              />
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="text-white text-2xl font-bold mb-6">
              Vehicle & Pricing
            </Text>

            <Text className="text-slate-300 font-medium mb-3">Vehicle Type</Text>
            <View className="flex-row mb-5">
              {["Bike", "Car", "Microbus"].map((type, index) => {
                const isSelected = selectedVehicle === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setValue("vehicleType", type)}
                    style={{ flex: 1, marginRight: index < 2 ? 12 : 0 }}
                    className={`py-4 rounded-2xl items-center justify-center border ${
                      isSelected
                        ? "bg-[#10B981] border-[#10B981]"
                        : "bg-[#111827] border-slate-800"
                    }`}
                  >
                    {type === "Bike" && (
                      <Bike size={24} color={isSelected ? "#FFFFFF" : "#94A3B8"} />
                    )}
                    {type === "Car" && (
                      <Car size={24} color={isSelected ? "#FFFFFF" : "#94A3B8"} />
                    )}
                    {type === "Microbus" && (
                      <Car size={24} color={isSelected ? "#FFFFFF" : "#94A3B8"} />
                    )}
                    <Text
                      className={`font-semibold mt-2 ${
                        isSelected ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text className="text-slate-300 font-medium mb-2">Vehicle Model</Text>
            <Controller
              control={control}
              name="vehicleModel"
              rules={{ required: "Vehicle model is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                  <TextInput
                    placeholder="e.g., Honda CBR 150R"
                    placeholderTextColor="#475569"
                    className="text-white text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.vehicleModel && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.vehicleModel.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">
              Vehicle Plate Number
            </Text>
            <Controller
              control={control}
              name="vehiclePlateNumber"
              rules={{ required: "Plate number is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                  <TextInput
                    placeholder="e.g., ঢাকা মেট্রো-গ ১২৩৪৫"
                    placeholderTextColor="#475569"
                    className="text-white text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.vehiclePlateNumber && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.vehiclePlateNumber.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">
              Available Seats
            </Text>
            <Controller
              control={control}
              name="availableSeats"
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-4">
                  <Users size={20} color="#64748B" />
                  <TextInput
                    keyboardType="numeric"
                    className="flex-1 text-white ml-3 text-base"
                    value={String(value)}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Text className="text-slate-300 font-medium mb-2">
              Price Per Seat (৳)
            </Text>
            <Controller
              control={control}
              name="pricePerSeat"
              rules={{ required: "Price is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                  <TextInput
                    placeholder="Enter price"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    className="text-white text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.pricePerSeat && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.pricePerSeat.message}
              </Text>
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="text-white text-2xl font-bold mb-6">
              Trip Preferences
            </Text>

            {[
              {
                name: "helmetAvailable",
                label: "Helmet Available",
                sub: "For bike rides",
                Icon: Shield,
              },
              {
                name: "luggageAllowed",
                label: "Luggage Allowed",
                sub: "Max 10kg",
                Icon: Briefcase,
              },
              {
                name: "musicAllowed",
                label: "Music Allowed",
                sub: "Play music during ride",
                Icon: Music,
              },
              {
                name: "acAvailable",
                label: "AC Available",
                sub: "For car rides",
                Icon: Wind,
              },
              {
                name: "smokingAllowed",
                label: "Smoking Allowed",
                sub: "Smoking permitted",
                Icon: Cigarette,
              },
            ].map((item) => (
              <View
                key={item.name}
                className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between mb-3"
              >
                <View className="flex-row items-center flex-1">
                  <item.Icon size={20} color="#94A3B8" />
                  <View className="ml-3">
                    <Text className="text-white font-semibold text-base">
                      {item.label}
                    </Text>
                    <Text className="text-slate-400 text-xs">{item.sub}</Text>
                  </View>
                </View>
                <Controller
                  control={control}
                  name={item.name}
                  render={({ field: { onChange, value } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: "#1E293B", true: "#10B981" }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>
            ))}

            <Text className="text-slate-300 font-medium mt-4 mb-3">
              Booking Type
            </Text>
            <View className="flex-row mb-6">
              {[
                {
                  title: "Instant Booking",
                  sub: "Auto-accept requests",
                  Icon: CheckCircle,
                },
                {
                  title: "Manual Approval",
                  sub: "Review each request",
                  Icon: Clock,
                },
              ].map((item, index) => {
                const isSelected = selectedBookingType === item.title;
                return (
                  <TouchableOpacity
                    key={item.title}
                    onPress={() => setValue("bookingType", item.title)}
                    style={{ flex: 1, marginRight: index === 0 ? 12 : 0 }}
                    className={`p-4 rounded-2xl border ${
                      isSelected
                        ? "bg-[#10B981] border-[#10B981]"
                        : "bg-[#111827] border-slate-800"
                    }`}
                  >
                    <item.Icon
                      size={20}
                      color={isSelected ? "#FFFFFF" : "#94A3B8"}
                    />
                    <Text
                      className={`font-bold text-base mt-2 ${
                        isSelected ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className={`text-xs mt-1 ${
                        isSelected ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-24 left-0 right-0 p-5 bg-[#050B14] border-t border-slate-800 flex-row items-center z-50">
        {step > 1 && (
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={loading}
            style={{ flex: 1, marginRight: 12 }}
            className="bg-[#111827] border border-slate-800 py-4 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Previous</Text>
          </TouchableOpacity>
        )}

        {step < 3 ? (
          <TouchableOpacity
            onPress={handleNext}
            style={{ flex: 1 }}
            className="bg-[#10B981] py-4 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            style={{ flex: 1 }}
            className="bg-[#10B981] py-4 rounded-2xl items-center justify-center flex-row"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text className="text-white font-bold text-base">Publish Trip</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* District Selection Modal */}
      <Modal
        visible={districtModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#111827] h-3/4 rounded-t-3xl p-5 border-t border-slate-800">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white text-xl font-bold">Select District</Text>
              <TouchableOpacity onPress={() => setDistrictModalVisible(false)}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="bg-[#050B14] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3 mb-4">
              <Search size={20} color="#64748B" />
              <TextInput
                placeholder="Search district..."
                placeholderTextColor="#475569"
                className="flex-1 text-white ml-3 text-base"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <FlatList
              data={filteredDistricts}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectDistrict(item)}
                  className="py-3.5 border-b border-slate-800/60"
                >
                  <Text className="text-slate-200 text-base font-medium">{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}