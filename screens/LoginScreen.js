import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // we can also use this way instead of using navigation as a prop
  const navigation = useNavigation();

  /*
  4. The moment the user opens the app the login screen opens, 
     it immidiately checks if token exist on localStorage, 
       if yes it navigates the user directly to Home Screen, 
       No need to login again
*/

  // useEffect(() => {
  //   const checkLoginStatus = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("authToken");
  //       if (token) {
  //         navigation.replace("Home");
  //       } else {
  //         //token not found, show the login screen
  //       }
  //     } catch (error) {
  //       console.log("error", error);
  //     }
  //   };

  //   checkLoginStatus();
  // }, []);

  // console.log(email);

  //3. We use this method to login the user with email and password
  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    //3.1 - Send a post request to the backend API to register user
    axios
      .post("http://192.168.1.236:3002/login", user)
      .then((response) => {
        // console.log(response);

        //3.2 - We get the token from our response & save it into our localStorage
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);

        console.log("This is token when loggin: ", token);

        Alert.alert(
          "Login Successful",
          " You have been registered successfully"
        );
        setEmail("");
        setPassword("");

        navigation.replace("Home");
      })
      .catch((error) => {
        Alert.alert("Login Error", "Invalid email or password");
        console.log("Login failed,", error);
      });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        padding: 10,
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#4A55A2", fontSize: 17, fontWeight: 600 }}>
            Sign in
          </Text>
          <Text style={{ fontSize: 17, fontWeight: 600, marginTop: 15 }}>
            Sign in to your account
          </Text>
        </View>

        <View style={{ marginTop: 50, gap: 10 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>
              Email
            </Text>
            <TextInput
              style={{
                fontSize: email ? 18 : 18,
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
              }}
              placeholderTextColor={"black"}
              placeholder="enter your Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            ></TextInput>
          </View>

          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "gray" }}>
              Password
            </Text>
            <TextInput
              style={{
                fontSize: password ? 18 : 18,
                borderBottomColor: "gray",
                borderBottomWidth: 1,
                marginVertical: 10,
                width: 300,
              }}
              placeholderTextColor={"black"}
              placeholder="enter your password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
            ></TextInput>
          </View>

          <Pressable
            onPress={handleLogin}
            style={{
              width: 200,
              backgroundColor: "#4A55A2",
              padding: 15,
              marginTop: 50,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 6,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Login
            </Text>
          </Pressable>

          <Pressable
            style={{ marginTop: 15 }}
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Dont have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({});

export default LoginScreen;
