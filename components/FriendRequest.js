import React, { useContext } from "react";
import { Text, View, StyleSheet, Pressable, Image } from "react-native";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const FriendRequest = ({ item, friendRequests, setFriendRequests }) => {
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();

  const acceptFriendRequest = async () => {
    const data = {
      senderId: item._id,
      receipientId: userId,
    };

    try {
      const response = await axios.post(
        "http://192.168.1.236:3002/friend-request/accept",
        data
      );

      if (response.status === 200) {
        setFriendRequests(
          friendRequests.filter((request) => {
            request._id !== item._id;
          })
        );

        navigation.navigate("ChatScreen");
      }
    } catch (error) {
      console.log("Error accepting the friend request", error);
    }
  };

  return (
    <Pressable
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: 10,
      }}
    >
      <Image
        style={{ width: 50, height: 50, borderRadius: 25 }}
        source={{ uri: item.image }}
      ></Image>

      <Text
        style={{ fontSize: 16, fontWeight: "bold", marginLeft: 10, flex: 1 }}
      >
        {item?.name} sent you a friend request!!
      </Text>

      <Pressable
        onPress={acceptFriendRequest}
        style={{ backgroundColor: "#0066b2", padding: 10, borderRadius: 6 }}
      >
        <Text style={{ textAlign: "center", color: "white" }}>Accept</Text>
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({});

export default FriendRequest;
