import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import axios from "axios";
import User from "../components/User";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  //5. We use useLayoutEffect to set options before rendering the screen
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Chat-App</Text>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Ionicons
            onPress={() => navigation.navigate("ChatScreen")}
            name="chatbox-ellipses-outline"
            size={24}
            color="black"
          />
          <MaterialIcons
            onPress={() => {
              navigation.navigate("Friends");
            }}
            name="people-outline"
            size={24}
            color="black"
          />
        </View>
      ),
    });
  }, []);

  //6. The moment screen renders we check for the token in localStorage and get it.
  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");

      //6.1 - We decode the token and save the userId in const userId variable
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      //6.2 - Than we save the userId in our Context for further use
      setUserId(userId);

      /*
      6.3 - Using our userId we make a request to our backend to get all the users 
              except ourself.
      */

      axios
        .get(`http://192.168.1.236:3002/users/${userId}`)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.log("error retieving users", error);
        });
    };

    fetchUsers();
  }, []);

  // console.log("users", users);

  //7.We display the users in our HomeScreen. Go to 'User' component to continue...
  return (
    <View>
      <View style={{ padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item}></User>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default HomeScreen;
