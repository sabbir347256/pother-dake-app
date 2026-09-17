import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Mail, Lock, Phone, User, ShieldCheck, ChevronDown, Upload } from "lucide-react-native";
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { useNavigation, useRouter } from "expo-router";
import { useAuth } from "../../src/AuthProvider/AuthProvider";
import config from "../../src/Utils/envConfig";

export default function AuthScreen({ navigation }) {
  const [screenState, setScreenState] = useState("GET_STARTED");
  const router = useRouter();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [nidFrontImage, setNidFrontImage] = useState(null);
  const [nidBackImage, setNidBackImage] = useState(null);

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isCompleteLoading, setIsCompleteLoading] = useState(false);

  const {
    control: loginControl,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    defaultValues: {
      contactNo: "",
      password: "",
    },
  });


  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    setValue: setSignupValue,
    watch: watchSignup,
    formState: { errors: signupErrors },
  } = useForm({
    defaultValues: {
      fullName: "",
      contactNo: "",
      email: "",
      password: "",
      role: "PASSENGER",
    },
  });

  const selectedRole = watchSignup("role");

  const {
    control: otpControl,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    watch: watchOtp,
    formState: { errors: otpErrors },
  } = useForm({
    defaultValues: {
      email: "",
      otpCode: "",
      gender: "Male",
      nidNo: "",
      profession: "",
    },
  });

  const selectedGender = watchOtp("gender");

  const setStorageItem = async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  };

  const { login } = useAuth();

  const onLogin = async (data) => {
    const loginData = {
      email: data?.contactNo,
      password: data?.password,
    };

    setIsLoginLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const resData = await response.json();

      if (response.ok && resData?.success) {
        const accessToken = resData?.data?.accessToken;

        if (accessToken) {
          await login(accessToken);
        }

        Toast.show({
          type: 'success',
          text2: resData?.message || 'Login Successful!',
        });

        // 1 second delay update for Toast display
        setTimeout(() => {
          setIsLoginLoading(false);
          router.replace('/');
        }, 1000);

      } else {
        setIsLoginLoading(false);
        Toast.show({
          type: 'error',
          text2: resData?.message || 'Login failed',
        });
      }
    } catch (error) {
      setIsLoginLoading(false);
      Toast.show({
        type: 'error',
        text2: 'Server connection failed',
      });
    }
  };


  const onRegister = async (data) => {
    setIsRegisterLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/v1/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (response.ok) {
        setRegisteredEmail(data.email);
        setOtpValue("email", data.email);
        setShowOtpModal(true);
        Toast.show({
          type: 'success',
          
          text2: resData?.message || 'Registration Initiated!',
        });
      } else {
        Toast.show({
          type: 'error',
          
          text2: resData?.message || 'Registration failed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        
        text2: 'Server connection failed',
      });
    } finally {
      setIsRegisterLoading(false);
    }
  };

  const pickImage = async (type) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: 'info',
        
        text2: 'Permission to access camera roll is required!',
      });
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (type === "front") {
        setNidFrontImage(asset);
      } else {
        setNidBackImage(asset);
      }
    }
  };

  const createFormDataFile = async (asset, fallbackName) => {
    if (!asset || !asset.uri) return null;

    const uri = asset.uri;
    const filename = uri.split("/").pop() || `${fallbackName}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : "jpg";

    let mimeType = "image/jpeg";
    if (ext === "png") mimeType = "image/png";
    else if (ext === "webp") mimeType = "image/webp";

    if (Platform.OS === "web") {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type || mimeType });
      } catch (error) {
        return null;
      }
    }

    let formattedUri = uri;
    if (Platform.OS === "android" && !uri.startsWith("file://") && !uri.startsWith("content://")) {
      formattedUri = `file://${uri}`;
    }

    return {
      uri: formattedUri,
      name: filename,
      type: mimeType,
    };
  };

  const onCompleteRegistration = async (data) => {
    if (!nidFrontImage || !nidBackImage) {
      Toast.show({
        type: 'error',
        
        text2: 'Please upload both NID front and back images',
      });
      return;
    }

    setIsCompleteLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", String(data.email || ""));
      formData.append("otpCode", String(data.otpCode || ""));
      formData.append("gender", String(data.gender || ""));
      formData.append("nidNo", String(data.nidNo || ""));
      formData.append("profession", String(data.profession || ""));

      const frontFile = await createFormDataFile(nidFrontImage, "nid_front");
      const backFile = await createFormDataFile(nidBackImage, "nid_back");

      if (frontFile) formData.append("nidFront", frontFile);
      if (backFile) formData.append("nidBack", backFile);

      const response = await fetch("http://localhost:5000/api/v1/user/complete-registration", {
        method: "POST",
        headers: {
          "Accept": "application/json",
        },
        body: formData,
      });

      const resData = await response.json();

      if (response.ok) {
        setShowOtpModal(false);
        setScreenState("LOGIN");
        Toast.show({
          type: 'success',
          
          text2: resData?.message || 'Registration Completed Successfully!',
        });
      } else {
        Toast.show({
          type: 'error',
          
          text2: resData?.message || 'OTP verification failed',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        
        text2: 'Server connection failed.',
      });
    } finally {
      setIsCompleteLoading(false);
    }
  };

  if (screenState === "GET_STARTED") {
    return (
      <View className="flex-1 bg-[#050B14] justify-between p-6 pt-16">
        <View className="items-center mt-10">
          <View className="w-24 h-24 bg-[#10B981]/10 rounded-full items-center justify-center mb-6">
            <ShieldCheck size={48} color="#10B981" />
          </View>
          <Text className="text-white text-3xl font-bold text-center mb-3">
            Welcome to RideShare
          </Text>
          <Text className="text-slate-400 text-base text-center px-4 leading-6">
            Your trusted journey companion. Fast, safe and affordable rides at your fingertips.
          </Text>
        </View>

        <View className="mb-8">
          <TouchableOpacity
            onPress={() => setScreenState("LOGIN")}
            className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mb-4"
          >
            <Text className="text-white font-bold text-lg">Get Started</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#050B14] pt-12">
      <View className="px-5 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() =>
            screenState === "SIGNUP" ? setScreenState("LOGIN") : setScreenState("GET_STARTED")
          }
          className="p-1"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">
          {screenState === "LOGIN" ? "Sign In" : "Create Account"}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {screenState === "LOGIN" ? (
          <View>
            <Text className="text-white text-3xl font-bold mb-2">Welcome Back</Text>
            <Text className="text-slate-400 text-sm mb-8">
              Sign in to continue your journey
            </Text>

            <Text className="text-slate-300 font-medium mb-2">Contact Number</Text>
            <Controller
              control={loginControl}
              name="contactNo"
              rules={{ required: "Contact number is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <Phone size={20} color="#64748B" />
                  <TextInput
                    placeholder="Enter phone number"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {loginErrors.contactNo && (
              <Text className="text-red-500 text-xs mb-3">
                {loginErrors.contactNo.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Password</Text>
            <Controller
              control={loginControl}
              name="password"
              rules={{ required: "Password is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    placeholder="Enter password"
                    placeholderTextColor="#475569"
                    secureTextEntry
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {loginErrors.password && (
              <Text className="text-red-500 text-xs mb-3">
                {loginErrors.password.message}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleLoginSubmit(onLogin)}
              disabled={isLoginLoading}
              className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mt-8 mb-6 h-14"
            >
              {isLoginLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">Login</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-slate-400 text-sm">
                Register kore na thakle age{" "}
              </Text>
              <TouchableOpacity onPress={() => setScreenState("SIGNUP")}>
                <Text className="text-[#10B981] font-bold text-sm">
                  registration korun
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text className="text-white text-3xl font-bold mb-2">Create Account</Text>
            <Text className="text-slate-400 text-sm mb-6">
              Fill in details to get started
            </Text>

            <Text className="text-slate-300 font-medium mb-2">Full Name</Text>
            <Controller
              control={signupControl}
              name="fullName"
              rules={{ required: "Full name is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <User size={20} color="#64748B" />
                  <TextInput
                    placeholder="Rahim Ahmed"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {signupErrors.fullName && (
              <Text className="text-red-500 text-xs mb-3">
                {signupErrors.fullName.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Contact No</Text>
            <Controller
              control={signupControl}
              name="contactNo"
              rules={{ required: "Contact number is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <Phone size={20} color="#64748B" />
                  <TextInput
                    placeholder="01712345671"
                    placeholderTextColor="#475569"
                    keyboardType="phone-pad"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {signupErrors.contactNo && (
              <Text className="text-red-500 text-xs mb-3">
                {signupErrors.contactNo.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Email</Text>
            <Controller
              control={signupControl}
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <Mail size={20} color="#64748B" />
                  <TextInput
                    placeholder="example@gmail.com"
                    placeholderTextColor="#475569"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {signupErrors.email && (
              <Text className="text-red-500 text-xs mb-3">
                {signupErrors.email.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Password</Text>
            <Controller
              control={signupControl}
              name="password"
              rules={{ required: "Password is required" }}
              render={({ field: { onChange, value } }) => (
                <View className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center px-4 py-3.5 mb-1">
                  <Lock size={20} color="#64748B" />
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#475569"
                    secureTextEntry
                    className="flex-1 text-white ml-3 text-base"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {signupErrors.password && (
              <Text className="text-red-500 text-xs mb-3">
                {signupErrors.password.message}
              </Text>
            )}

            <Text className="text-slate-300 font-medium mt-3 mb-2">Role</Text>
            <TouchableOpacity
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              className="bg-[#111827] border border-slate-800 rounded-2xl flex-row items-center justify-between px-4 py-3.5 mb-1"
            >
              <Text className="text-white text-base">{selectedRole}</Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>

            {showRoleDropdown && (
              <View className="bg-[#1E293B] border border-slate-700 rounded-2xl mb-3 overflow-hidden">
                <TouchableOpacity
                  onPress={() => {
                    setSignupValue("role", "DRIVER");
                    setShowRoleDropdown(false);
                  }}
                  className="px-4 py-3 border-b border-slate-700"
                >
                  <Text className="text-white font-medium">DRIVER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSignupValue("role", "PASSENGER");
                    setShowRoleDropdown(false);
                  }}
                  className="px-4 py-3"
                >
                  <Text className="text-white font-medium">PASSENGER</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              onPress={handleSignupSubmit(onRegister)}
              disabled={isRegisterLoading}
              className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mt-6 mb-6 h-14"
            >
              {isRegisterLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">Register</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center">
              <Text className="text-slate-400 text-sm">Already have an account? </Text>
              <TouchableOpacity onPress={() => setScreenState("LOGIN")}>
                <Text className="text-[#10B981] font-bold text-sm">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={showOtpModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#050B14] border-t border-slate-800 rounded-t-3xl p-6 h-5/6">
            <Text className="text-white text-2xl font-bold mb-2">
              Complete Registration
            </Text>
            <Text className="text-slate-400 text-xs mb-4">
              An OTP code has been sent to {registeredEmail}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-slate-300 font-medium mb-1">Email</Text>
              <Controller
                control={otpControl}
                name="email"
                render={({ field: { value } }) => (
                  <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-3 opacity-60">
                    <TextInput
                      value={value}
                      editable={false}
                      className="text-white text-base"
                    />
                  </View>
                )}
              />

              <Text className="text-slate-300 font-medium mb-1">OTP Code</Text>
              <Controller
                control={otpControl}
                name="otpCode"
                rules={{ required: "OTP code is required" }}
                render={({ field: { onChange, value } }) => (
                  <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                    <TextInput
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#475569"
                      keyboardType="number-pad"
                      className="text-white text-base"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {otpErrors.otpCode && (
                <Text className="text-red-500 text-xs mb-3">
                  {otpErrors.otpCode.message}
                </Text>
              )}

              <Text className="text-slate-300 font-medium mt-2 mb-1">Gender</Text>
              <View className="flex-row mb-3">
                {["Male", "Female", "Other"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    onPress={() => setOtpValue("gender", g)}
                    className={`flex-1 py-3 rounded-xl border mr-2 items-center ${selectedGender === g
                      ? "bg-[#10B981] border-[#10B981]"
                      : "bg-[#111827] border-slate-800"
                      }`}
                  >
                    <Text className="text-white font-medium">{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-slate-300 font-medium mb-1">NID Number</Text>
              <Controller
                control={otpControl}
                name="nidNo"
                rules={{ required: "NID number is required" }}
                render={({ field: { onChange, value } }) => (
                  <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                    <TextInput
                      placeholder="Enter NID number"
                      placeholderTextColor="#475569"
                      keyboardType="number-pad"
                      className="text-white text-base"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {otpErrors.nidNo && (
                <Text className="text-red-500 text-xs mb-3">
                  {otpErrors.nidNo.message}
                </Text>
              )}

              <Text className="text-slate-300 font-medium mt-2 mb-1">Profession</Text>
              <Controller
                control={otpControl}
                name="profession"
                rules={{ required: "Profession is required" }}
                render={({ field: { onChange, value } }) => (
                  <View className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3.5 mb-1">
                    <TextInput
                      placeholder="e.g. Student, Service"
                      placeholderTextColor="#475569"
                      className="text-white text-base"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {otpErrors.profession && (
                <Text className="text-red-500 text-xs mb-3">
                  {otpErrors.profession.message}
                </Text>
              )}

              <View className="flex-row mt-3 mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-300 font-medium mb-1">
                    NID Front Image
                  </Text>
                  <TouchableOpacity
                    onPress={() => pickImage("front")}
                    className="bg-[#111827] border border-slate-800 rounded-2xl h-28 items-center justify-center overflow-hidden"
                  >
                    {nidFrontImage ? (
                      <Image
                        source={{ uri: nidFrontImage.uri }}
                        className="w-full h-full"
                      />
                    ) : (
                      <View className="items-center">
                        <Upload size={20} color="#64748B" />
                        <Text className="text-slate-400 text-xs mt-1">Upload Front</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex-1 ml-2">
                  <Text className="text-slate-300 font-medium mb-1">
                    NID Back Image
                  </Text>
                  <TouchableOpacity
                    onPress={() => pickImage("back")}
                    className="bg-[#111827] border border-slate-800 rounded-2xl h-28 items-center justify-center overflow-hidden"
                  >
                    {nidBackImage ? (
                      <Image
                        source={{ uri: nidBackImage.uri }}
                        className="w-full h-full"
                      />
                    ) : (
                      <View className="items-center">
                        <Upload size={20} color="#64748B" />
                        <Text className="text-slate-400 text-xs mt-1">Upload Back</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleOtpSubmit(onCompleteRegistration)}
                disabled={isCompleteLoading}
                className="bg-[#10B981] py-4 rounded-2xl items-center justify-center mt-4 mb-8 h-14"
              >
                {isCompleteLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">Submit & Complete</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
}