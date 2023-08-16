import axios from "axios";
import React, { useEffect, useContext } from "react";
import { Text, View } from "react-native";
import { UserType } from "../UserContext";

const FriendsScreen = () => {
  //9. We get the context cuz we need to use userId for getting friendRequests
  const { userId, setUserId } = useContext(UserType);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  //10. We define the method to fetch friendRequests
  const fetchFriendRequests = async () => {
    try {
      const response = axios.get(
        `http://192.168.1.236:3002/friend-request/${userId}`
      );
    } catch (error) {
      console.log("Error Message", error);
    }
  };

  return;
};

export default FriendsScreen;
