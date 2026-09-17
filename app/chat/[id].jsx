import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useAuth } from "../../src/AuthProvider/AuthProvider";
import config from "../../src/Utils/envConfig";
import { socket } from "../../src/Utils/socket";

export default function SingleChatScreen() {
  const { id: receiverId } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const currentUserId = user?._id || user?.id || user?.userId;
  const flatListRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${config?.backendUrl}/chat/messages/${currentUserId}/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    fetchMessages();

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", currentUserId);

    const handleNewMessage = (newMessage) => {
      if (
        (newMessage.senderId === receiverId && newMessage.receiverId === currentUserId) ||
        (newMessage.senderId === currentUserId && newMessage.receiverId === receiverId)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("receiveMessage", handleNewMessage);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
    };
  }, [currentUserId, receiverId]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const payload = {
        senderId: currentUserId,
        receiverId,
        message: textToSend,
      };

      const response = await axios.post(
        `${config?.backendUrl}/chat/send`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        const savedMessage = response.data.data;
        setMessages((prev) => [...prev, savedMessage]);
        socket.emit("sendMessage", savedMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#090D16" }}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      <View className="p-4 flex-row items-center border-b border-slate-800 bg-[#090D16]">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Chat</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#090D16" }}
      >
        <View style={{ flex: 1, backgroundColor: "#090D16" }}>
          {loading ? (
            <View className="flex-1 justify-center items-center bg-[#090D16]">
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item, index) => item._id || index.toString()}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
              renderItem={({ item }) => {
                const isMe = item.senderId === currentUserId;
                return (
                  <View
                    className={`my-1.5 px-4 py-2.5 rounded-2xl max-w-[80%] ${
                      isMe
                        ? "bg-emerald-600 self-end rounded-tr-none"
                        : "bg-slate-800 self-start rounded-tl-none"
                    }`}
                  >
                    <Text className="text-white text-base">{item.message}</Text>
                  </View>
                );
              }}
              contentContainerStyle={{ padding: 16, flexGrow: 1, backgroundColor: "#090D16" }}
              style={{ flex: 1, backgroundColor: "#090D16" }}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center">
                  <Text className="text-slate-500">No messages yet. Say hi!</Text>
                </View>
              }
            />
          )}
        </View>

        <View className="p-3 bg-[#090D16] border-t border-slate-800 flex-row items-center">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl text-base mr-2"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={sending}
            className="bg-emerald-500 p-3 rounded-xl justify-center items-center"
          >
            {sending ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons name="send" size={20} color="#000" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}