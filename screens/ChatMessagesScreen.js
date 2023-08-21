import React, { useState, useContext, useLayoutEffect, useEffect } from "react";
import {
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { Feather } from "@expo/vector-icons";
import EmojiSelector from "react-native-emoji-selector";
import { UserType } from "../UserContext";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ChatMessageScreen = ({ route }) => {
  const { recepientId } = route.params;
  const [selectedImage, setSelectedImage] = useState("");
  const [messages, setMessages] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [message, setMessage] = useState("");
  const [recepientData, setRecepientData] = useState();
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.236:3002/messages/${userId}/${recepientId}`
      );

      const data = response.data;
      // console.log("This is data: ", data);
      // console.log("This is message: ", data[0].message);
      // console.log("This is messageType:: ", data[0].messageType);

      // setMessages((oldMessages) => [...oldMessages, data.message]);
      setMessages(data);
      // console.log("Messages", messages);
    } catch (error) {
      console.log("Error fetching messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchRecepientData = async () => {
      try {
        const response = await axios.get(
          `http://192.168.1.236:3002/user/${recepientId}`
        );

        // const data = response.json();
        const data = response.data;
        setRecepientData(data);
      } catch (error) {
        console.log("Error retrieving details", error);
      }
    };

    fetchRecepientData();
  }, []);

  // console.log(recepientData);

  const handleSend = async (messageType, imageUri) => {
    try {
      const formData = new FormData();
      formData.append("senderId", userId);
      formData.append("recepientId", recepientId);

      // check if the message type is image or a normal text
      if (messageType === "image") {
        formData.append("messageType", "image");
        formData.append("imageFile", {
          uri: imageUri,
          name: "image.jpg",
          type: "image/jpeg",
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const endpoint = "http://192.168.1.236:3002/messages";
      const { _parts } = formData;

      // console.log("This is formData._parts", _parts);
      // console.log("THis is uri: ", _parts[0][3]);

      const response = await axios.post(endpoint, _parts);

      if (response.status === 200) {
        setMessage(""), setSelectedImage("");
        // console.log(response.data.message);
        fetchMessages();
      }
    } catch (error) {
      console.log("Error in sending the message", error);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color="black"
          />

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                resizeMode: "cover",
              }}
              source={{ uri: recepientData?.image }}
            ></Image>

            <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
              {recepientData?.name}
            </Text>
          </View>
        </View>
      ),
    });
  }, [recepientData]);

  const formatTime = (time) => {
    const options = { hour: "numeric", minure: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  // console.log(recepientData);

  // console.log("Messages", messages);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // handleSend("image",result)
      handleSend("image", result.uri);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView style={{ marginTop: 10 }}>
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            return (
              <Pressable
                key={index}
                style={[
                  // { marginTop: 10 },
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        marginHorizontal: 10,
                        marginVertical: 5,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },
                ]}
              >
                <Text style={{ fontSize: 13, textAlign: "left" }}>
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: "right",
                    fontSize: 11,
                    color: "gray",
                    marginTop: 4,
                  }}
                >
                  {formatTime(item?.timeStamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === "image") {
            const baseUrl = "/Users/HP280G1/Desktop/chat-app/api/files/";
            const imageUrl = item.imageUrl;
            console.log("imageUrl : ", imageUrl);
            const filename = imageUrl.split("/").pop();
            console.log("filename : ", filename);
            // const source = { uri: baseUrl + filename };
            const source = { uri: imageUrl };
            console.log("source : ", source);

            return (
              <Pressable
                key={index}
                style={[
                  // { marginTop: 10 },
                  item?.senderId?._id === userId
                    ? {
                        alignSelf: "flex-end",
                        backgroundColor: "#DCF8C6",
                        padding: 8,
                        maxWidth: "60%",
                        borderRadius: 7,
                        marginHorizontal: 10,
                        marginVertical: 5,
                      }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: "white",
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: "60%",
                      },
                ]}
              >
                <View>
                  <Image
                    source={source}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  ></Image>

                  <Text
                    style={{
                      position: "absolute",
                      textAlign: "right",
                      fontSize: 11,
                      color: "white",
                      marginTop: 4,
                      right: 10,
                      bottom: 7,
                    }}
                  >
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: "#dddddd",
          marginBottom: showEmojiSelector ? 0 : 20,
        }}
      >
        <Entypo
          onPress={handleEmojiPress}
          style={{ marginRight: 5 }}
          name="emoji-happy"
          size={24}
          color="gray"
        />
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: "#dddddd",
            borderRadius: 20,
            paddingHorizontal: 10,
            marginHorizontal: 10,
          }}
          placeholder="Type your message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        ></TextInput>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            marginHorizontal: 8,
          }}
        >
          <Entypo name="camera" size={24} color="gray" onPress={pickImage} />

          <Feather name="mic" size={24} color="gray" />
        </View>

        <Pressable
          onPress={() => handleSend("text")}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
            // marginLeft: 10,
            backgroundColor: "#007bff",
          }}
        >
          <Text style={{ fontWeight: "bold", color: "white" }}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          style={{ height: 250 }}
          onEmojiSelected={(emoji) => {
            setMessage((prevMessage) => prevMessage + emoji);
          }}
        ></EmojiSelector>
      )}
    </KeyboardAvoidingView>
  );
};

export default ChatMessageScreen;
