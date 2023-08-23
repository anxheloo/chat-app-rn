import React, {
  useState,
  useContext,
  useLayoutEffect,
  useEffect,
  useRef,
} from "react";
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
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons } from "@expo/vector-icons";
import io from "socket.io-client";

const ChatMessageScreen = ({ route }) => {
  const { recepientId } = route.params;
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [message, setMessage] = useState("");
  const [recepientData, setRecepientData] = useState();
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  const scrollViewRef = useRef(null);

  // Connect to the WebSocket server on component mount
  /*
  const socket = useRef(
    io("http://http://192.168.1.236:3002") // Replace with your server's address
  );

  useEffect(() => {
    // Event listener for receiving messages
    socket.current.on("message", (data) => {
      // Handle the received message (e.g., update the state to display it)
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });

    return () => {
      // Clean up when the component unmounts
      socket.current.disconnect();
    };
  }, []);

  */

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.236:3002/messages/${userId}/${recepientId}`
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

  const handleSend = async (messageType, imageUri, base64Data) => {
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
          base64: base64Data,
        });
      } else {
        formData.append("messageType", "text");
        formData.append("messageText", message);
      }

      const endpoint = "http://192.168.1.236:3002/messages";
      const { _parts } = formData;

      const response = await axios.post(endpoint, _parts);

      // Send the message to the server via WebSocket
      /*
      socket.current.emit("chatMessage", {
        senderId: userId,
        messageType,
        messageText: message,
      });
      */

      if (response.status === 200) {
        setMessage(""), setSelectedImage("");
        fetchMessages();
      }
    } catch (error) {
      console.log("Error in sending the message", error);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
    console.log("THis is result.base64:", result.base64);

    if (!result.canceled) {
      handleSend("image", result.uri, result.base64);
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

          {selectedMessages.length > 0 ? (
            <View>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            </View>
          ) : (
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
          )}
        </View>
      ),

      headerRight: () =>
        selectedMessages.length > 0 ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="md-arrow-redo" size={24} color="black" />
            <Ionicons name="md-arrow-undo" size={24} color="black" />
            <FontAwesome name="star" size={24} color="black" />
            <MaterialIcons
              onPress={() => deleteMessages(selectedMessages)}
              name="delete"
              size={24}
              color="black"
            />
          </View>
        ) : null,
    });
  }, [recepientData, selectedMessages]);

  const deleteMessages = async (messageIds) => {
    try {
      const endpoint = "http://192.168.1.236:3002/deleteMessages";

      body = JSON.stringify({ message: messageIds });

      const response = await axios.post(endpoint, messageIds);

      if (response.status === 200) {
        setSelectedMessages((prevMessages) =>
          prevMessages.filter((id) => !messageIds.includes(id))
        );

        fetchMessages();
      } else {
        console.log("Error deleting MESAGGES:", response.status);
      }
    } catch (error) {
      console.log("Error deleting messages", error);
    }
  };

  const formatTime = (time) => {
    const options = { hour: "numeric", minure: "numeric" };
    return new Date(time).toLocaleString("en-US", options);
  };

  const handleSelectedMessage = (message) => {
    //check if message is already selected
    const isSelected = selectedMessages.includes(message._id);

    if (isSelected) {
      setSelectedMessages((prevMessages) =>
        prevMessages.filter((id) => id !== message._id)
      );
    } else {
      setSelectedMessages((prevMessages) => [...prevMessages, message._id]);
    }
  };

  // console.log("These are selected Messages: ", selectedMessages);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
      <ScrollView
        style={{ marginTop: 10 }}
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1 }}
        onContentSizeChange={handleContentSizeChange}
      >
        {messages.map((item, index) => {
          if (item.messageType === "text") {
            const isSelected = selectedMessages.includes(item._id);

            return (
              <Pressable
                onLongPress={() => handleSelectedMessage(item)}
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

                  isSelected && { width: "100%", backgroundColor: "#F0FFFF" },
                ]}
              >
                <Text
                  style={{
                    fontSize: 13,
                    textAlign: isSelected ? "right" : "left",
                  }}
                >
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
            const imageUrl = item.imageUrl;
            // Decode the base64 image data
            const decodedImageData = `data:image/jpeg;base64,${imageUrl}`;

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
                    source={{ uri: decodedImageData }}
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
