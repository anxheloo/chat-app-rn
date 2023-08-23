import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState, useEffect } from "react";
import { Text, View, Pressable, Image } from "react-native";
import { UserType } from "../UserContext";
import axios from "axios";

const UserChat = ({ item }) => {
  const navigation = useNavigation();

  const { userId, setUserId } = useContext(UserType);

  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.236:3002/messages/${userId}/${item._id}`
      );
      const data = response.data;
      setMessages(data);
    } catch (error) {
      console.log("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const getLastMessage = () => {
    const userMessages = messages.filter(
      (message) => message.messageType === "text"
    );

    const lastMessage = userMessages[userMessages.length - 1];

    return lastMessage;
  };

  const lastMessage = getLastMessage();
  console.log(lastMessage);

  const formatTime = (time) => {
    const options = { hour: "numeric", minure: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderWidth: 0.7,
        borderColor: "#D0D0D0",
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        padding: 10,
      }}
      onPress={() => {
        navigation.navigate("Messages", { recepientId: item._id });
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25, resizeMode: "cover" }}
        source={{ uri: item.image }}
      ></Image>

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "500" }}>{item?.name}</Text>
        {lastMessage && (
          <Text style={{ color: "gray", marginTop: 3, fontWeight: "500" }}>
            {lastMessage?.message}
          </Text>
        )}
      </View>

      <View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "400",
            color: "#585858",
          }}
        >
          {lastMessage && formatTime(lastMessage?.timeStamp)}
        </Text>
      </View>
    </Pressable>
  );
};
export default UserChat;
