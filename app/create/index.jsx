import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
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
} from "lucide-react-native";

export default function CreateTripScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);

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
      availableSeats: "1 seat",
      pricePerSeat: "",
      helmetAvailable: false,
      luggageAllowed: false,
      musicAllowed: false,
      acAvailable: false,
      smokingAllowed: false,
      bookingType: "Instant Booking",
    },
  });

  const selectedVehicle = watch("vehicleType");
  const selectedBookingType = watch("bookingType");

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

  const onSubmit = (data) => {
    console.log("Trip Data Published:", JSON.stringify(data, null, 2));
  };

  return (
    <View className="flex-1 bg-[#050B14] pt-12 relative">
      <View className="px-5 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => (step > 1 ? handlePrevious() : router.back())}
          className="p-1"
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
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <MapPin size={20} color="#10B981" />
                  <TextInput
                    placeholder="Enter pickup location"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
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
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <MapPin size={20} color="#EF4444" />
                  <TextInput
                    placeholder="Enter drop-off location"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {errors.destination && (
              <Text className="text-red-500 text-xs mb-3">
                {errors.destination.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">
              Stop Points (Optional)
            </Text>
            <Controller
              control={control}
              name="stopPoints"
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-4">
                  <TextInput
                    placeholder="Add stop points"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-slate-300 font-medium mb-2">
                  Departure Date
                </Text>
                <Controller
                  control={control}
                  name="departureDate"
                  rules={{ required: "Required" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5">
                      <Calendar size={18} color="#64748B" />
                      <TextInput
                        placeholder="mm/dd/yyyy"
                        placeholderTextColor="#475569"
                        className="flex-1 text-white ml-2 text-base"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
              </View>

              <View className="flex-1 ml-2">
                <Text className="text-slate-300 font-medium mb-2">
                  Departure Time
                </Text>
                <Controller
                  control={control}
                  name="departureTime"
                  rules={{ required: "Required" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5">
                      <Clock size={18} color="#64748B" />
                      <TextInput
                        placeholder="--:-- --"
                        placeholderTextColor="#475569"
                        className="flex-1 text-white ml-2 text-base"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            <Text className="text-slate-300 font-medium mb-2">
              Estimated Arrival Time
            </Text>
            <Controller
              control={control}
              name="estimatedArrivalTime"
              rules={{ required: "Required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-4">
                  <Clock size={18} color="#64748B" />
                  <TextInput
                    placeholder="--:-- --"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white ml-2 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
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
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
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
            style={{ flex: 1 }}
            className="bg-[#10B981] py-4 rounded-2xl items-center justify-center"
          >
            <Text className="text-white font-bold text-base">Publish Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}