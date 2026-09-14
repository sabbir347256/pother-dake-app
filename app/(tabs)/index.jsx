import React from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../../src/AuthProvider/AuthProvider";
import HomePage from "../../src/components/HomeSection/HomePage/HomePage";

export default function Home() {
  const { isLoggedIn, user, loading } = useAuth();
  console.log(isLoggedIn)
  console.log(user)

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#090D16]">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!isLoggedIn || !user) {
    return <Redirect href="/auth" />;
  }

  return (
    <ScrollView className="flex-1 bg-[#090D16]">
      <HomePage />
    </ScrollView>
  );
}