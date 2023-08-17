import React, { useEffect, useState, useContext } from "react";
import { Text, View, ScrollView, Pressable } from "react-native";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import UserChat from "../components/UserChat";

const ChatScreen = () => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();
  const [acceptedFriends, setAcceptedFriends] = useState([]);

  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.236:3002/accepted-friends/${userId}`
        );

        if (response.status === 200) {
          setAcceptedFriends(response.data);
        }
      } catch (error) {
        console.log("Error showing the accepted frineds", error);
      }
    };

    acceptedFriendsList();
  }, []);

  console.log("Outside useEffect 3", acceptedFriends);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Pressable>
        {acceptedFriends.map((item, index) => (
          <UserChat key={index} item={item}></UserChat>
        ))}
      </Pressable>
    </ScrollView>
  );
};

export default ChatScreen;
