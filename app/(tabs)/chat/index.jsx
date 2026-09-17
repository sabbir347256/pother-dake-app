import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useFocusEffect } from "expo-router";
import { socket } from "../../../src/Utils/socket";
import { useAuth } from "../../../src/AuthProvider/AuthProvider";
import config from "../../../src/Utils/envConfig";

export default function ChatListScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const currentUserId = user?._id || user?.id || user?.userId;

  const fetchConversations = async () => {
    try {
      if (!currentUserId) return;
      const response = await axios.get(
        `${config?.backendUrl}/chat/conversations/${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.success) {
        setChats(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [currentUserId])
  );

  useEffect(() => {
    if (!currentUserId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", currentUserId);

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receiveMessage", () => {
      fetchConversations();
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("receiveMessage");
    };
  }, [currentUserId]);

  const filteredChats = chats.filter((chat) =>
    chat?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderChatItem = ({ item }) => {
    const isOnline = onlineUsers.includes(item._id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item._id}`)}
        className="flex-row items-center justify-between p-4 border-b border-slate-800/60"
      >
        <View className="flex-row items-center space-x-3 flex-1">
          <View className="relative">
            <Image
              source={{
                uri:
                  item.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              className="w-14 h-14 rounded-full bg-slate-800"
            />
            {isOnline && (
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050B14]" />
            )}
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white font-bold text-base">
              {item.name || "User"}
            </Text>
            <Text
              numberOfLines={1}
              className={`text-sm mt-0.5 ${
                item.unread > 0
                  ? "text-emerald-400 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {item.lastMessage}
            </Text>
          </View>
        </View>

        <View className="items-end ml-2">
          <Text className="text-xs text-slate-500 mb-1">
            {formatTime(item.time)}
          </Text>
          {item.unread > 0 && (
            <View className="bg-emerald-500 px-2 py-0.5 rounded-full items-center justify-center">
              <Text className="text-black font-bold text-xs">{item.unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050B14" }}>
      <StatusBar barStyle="light-content" backgroundColor="#050B14" />
      <SafeAreaView className="flex-1 bg-[#050B14]">
        <View className="p-4 flex-row items-center justify-between border-b border-slate-800">
          <Text className="text-2xl font-bold text-white">Messages</Text>
          <TouchableOpacity className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center">
            <Ionicons name="create-outline" size={22} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View className="p-4">
          <View className="flex-row items-center bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/50">
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              placeholder="Search messages..."
              placeholderTextColor="#64748B"
              value={search}
              onChangeText={setSearch}
              className="flex-1 text-white ml-2 text-base"
            />
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#10B981" />
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item._id}
            renderItem={renderChatItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center mt-12">
                <Text className="text-slate-500">No conversations found.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}