import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MOCK_CHATS = [
  {
    id: "1",
    name: "Rahim Ahmed",
    avatar: "https://i.pravatar.cc/150?img=11",
    lastMessage: "Bhai, gari kothay ache ekhon?",
    time: "10:42 AM",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Tanvir Hossain",
    avatar: "https://i.pravatar.cc/150?img=12",
    lastMessage: "Okay, ami location e pouchaya gesi.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "3",
    name: "Nusrat Jahan",
    avatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: "Trip details ta ektu share korben?",
    time: "Sep 15",
    unread: 1,
    online: true,
  },
];

export default function ChatListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filteredChats = MOCK_CHATS.filter((chat) =>
    chat.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/chat/${item.id}`)}
      className="flex-row items-center justify-between p-4 border-b border-slate-800/60"
    >
      <View className="flex-row items-center space-x-3 flex-1">
        <View className="relative">
          <Image
            source={{ uri: item.avatar }}
            className="w-14 h-14 rounded-full bg-slate-800"
          />
          {item.online && (
            <View className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050B14]" />
          )}
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-white font-bold text-base">{item.name}</Text>
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
        <Text className="text-xs text-slate-500 mb-1">{item.time}</Text>
        {item.unread > 0 && (
          <View className="bg-emerald-500 px-2 py-0.5 rounded-full items-center justify-center">
            <Text className="text-black font-bold text-xs">{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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

        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center mt-12">
              <Text className="text-slate-500">No conversations found.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}