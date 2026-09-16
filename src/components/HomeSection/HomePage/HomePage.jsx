import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
} from "react-native-reanimated";
import { MapPin, Navigation, Clock, ShieldCheck, Car, Star } from "lucide-react-native";


const HomePage = () => {
    const router = useRouter();

    const floatY = useSharedValue(0);
    const shadowScale = useSharedValue(1);
    const pulseScale = useSharedValue(1);

    useEffect(() => {
        floatY.value = withRepeat(
            withSequence(
                withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        shadowScale.value = withRepeat(
            withSequence(
                withTiming(0.65, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        pulseScale.value = withRepeat(
            withTiming(1.6, { duration: 2000, easing: Easing.out(Easing.ease) }),
            -1,
            false
        );
    }, []);

    const carAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: floatY.value }],
    }));

    const shadowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: shadowScale.value }],
        opacity: shadowScale.value,
    }));

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
        opacity: 1 - (pulseScale.value - 1) / 0.6,
    }));
    return (
        <ScrollView className="flex-1 bg-[#090D16]">
            <View className="pt-8 px-5 pb-6 bg-[#0F172A] rounded-b-[36px] border-b border-slate-800/80">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
                            Welcome back
                        </Text>
                        <Text className="text-white text-2xl font-extrabold mt-0.5">
                            Ready to Ride?
                        </Text>
                    </View>
                    <View className="flex-row items-center bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                        <ShieldCheck size={16} color="#10B981" />
                        <Text className="text-emerald-400 text-xs font-bold ml-1.5">Safe Verified</Text>
                    </View>
                </View>

                <View className="items-center justify-center my-4 h-52 relative">
                    <Animated.View
                        style={[
                            {
                                position: "absolute",
                                width: 140,
                                height: 140,
                                borderRadius: 70,
                                backgroundColor: "rgba(16, 185, 129, 0.15)",
                            },
                            pulseAnimatedStyle,
                        ]}
                    />

                    <Animated.View style={shadowAnimatedStyle} className="absolute bottom-4">
                        <View className="w-36 h-4 bg-emerald-950/80 rounded-full blur-md" />
                    </Animated.View>

                    <Animated.View style={carAnimatedStyle} className="items-center justify-center">
                        <Svg width="200" height="120" viewBox="0 0 200 120" fill="none">
                            <Defs>
                                <LinearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <Stop offset="0%" stopColor="#10B981" />
                                    <Stop offset="50%" stopColor="#059669" />
                                    <Stop offset="100%" stopColor="#047857" />
                                </LinearGradient>
                                <LinearGradient id="glass" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                                    <Stop offset="100%" stopColor="#1E293B" stopOpacity="0.9" />
                                </LinearGradient>
                            </Defs>

                            <Path
                                d="M 25 75 C 25 75 40 45 70 38 C 100 31 135 33 155 48 C 175 63 180 75 180 75 Z"
                                fill="url(#carBody)"
                            />
                            <Path
                                d="M 65 42 Q 95 36 125 40 Q 140 48 145 55 L 60 55 Z"
                                fill="url(#glass)"
                            />
                            <Path
                                d="M 15 70 C 15 65 30 65 175 65 C 190 65 190 85 175 85 L 25 85 C 15 85 15 75 15 70 Z"
                                fill="url(#carBody)"
                            />
                            <Circle cx="55" cy="85" r="16" fill="#0F172A" stroke="#334155" strokeWidth="4" />
                            <Circle cx="55" cy="85" r="6" fill="#10B981" />
                            <Circle cx="145" cy="85" r="16" fill="#0F172A" stroke="#334155" strokeWidth="4" />
                            <Circle cx="145" cy="85" r="6" fill="#10B981" />
                            <Path d="M 180 72 Q 188 72 185 78 Q 180 80 178 75 Z" fill="#F59E0B" />
                        </Svg>
                    </Animated.View>
                </View>

                <View className="bg-[#1E293B]/90 border border-slate-700/60 rounded-2xl p-3 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center mr-3">
                        <Navigation size={18} color="#10B981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-slate-400 text-xs">Current Location</Text>
                        <TextInput
                            placeholder="Where are you starting from?"
                            placeholderTextColor="#64748B"
                            defaultValue="Dhanmondi, Dhaka"
                            className="text-white font-semibold text-sm p-0 m-0"
                        />
                    </View>
                </View>
            </View>

            <View className="px-5 mt-6">
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push("/search")}
                    className="bg-emerald-500 py-4 rounded-2xl flex-row justify-center items-center space-x-2 shadow-lg shadow-emerald-500/30"
                >
                    <MapPin size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold text-base ml-2">Find Nearest Rides</Text>
                </TouchableOpacity>
            </View>

            <View className="px-5 mt-8">
                <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push("/search")}
                        className="w-[30%] bg-[#111827] border border-slate-800 rounded-2xl p-4 items-center"
                    >
                        <View className="w-12 h-12 bg-emerald-950 rounded-full items-center justify-center mb-2">
                            <Car size={22} color="#10B981" />
                        </View>
                        <Text className="text-white font-medium text-xs text-center">City Ride</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push("/search")}
                        className="w-[30%] bg-[#111827] border border-slate-800 rounded-2xl p-4 items-center"
                    >
                        <View className="w-12 h-12 bg-teal-950 rounded-full items-center justify-center mb-2">
                            <Navigation size={22} color="#14B8A6" />
                        </View>
                        <Text className="text-white font-medium text-xs text-center">Intercity</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push("/bookings")}
                        className="w-[30%] bg-[#111827] border border-slate-800 rounded-2xl p-4 items-center"
                    >
                        <View className="w-12 h-12 bg-slate-800 rounded-full items-center justify-center mb-2">
                            <Clock size={22} color="#94A3B8" />
                        </View>
                        <Text className="text-white font-medium text-xs text-center">Schedule</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="px-5 mt-8 pb-32">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-white text-lg font-bold">Top Drivers Nearby</Text>
                    <Text className="text-emerald-400 text-xs font-semibold">View All</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/search")}
                    className="bg-[#111827] border border-slate-800 rounded-2xl p-4 flex-row items-center justify-between mb-3"
                >
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-slate-700 rounded-full items-center justify-center mr-3">
                            <Text className="text-white font-bold text-base">TA</Text>
                        </View>
                        <View>
                            <Text className="text-white font-semibold text-base">Tanvir Ahmed</Text>
                            <Text className="text-slate-400 text-xs">Toyota Premio • 2 km away</Text>
                        </View>
                    </View>
                    <View className="flex-row items-center bg-[#1E293B] px-2.5 py-1 rounded-full">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-amber-400 text-xs font-bold ml-1">4.9</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default HomePage;