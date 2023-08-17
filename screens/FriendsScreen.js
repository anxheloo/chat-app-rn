import axios from "axios";
import React, { useEffect, useContext, useState } from "react";
import { Text, View } from "react-native";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";

const FriendsScreen = () => {
  //9. We get the context cuz we need to use userId for getting friendRequests
  const { userId, setUserId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);

  console.log(userId);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  //10. We define the method to fetch friendRequests
  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.236:3002/friend-request/${userId}`
      );

      if (response.status === 200) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));

        setFriendRequests(friendRequestsData);
      }
    } catch (error) {
      console.log("Error Message", error);
    }
  };

  console.log(friendRequests);

  return (
    <View style={{ padding: 10, marginHorizontal: 12 }}>
      {friendRequests.length > 0 && <Text>Your Friend Requests!</Text>}

      {friendRequests.map((item, index) => (
        <FriendRequest
          item={item}
          key={index}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
        ></FriendRequest>
      ))}
    </View>
  );
};

export default FriendsScreen;
