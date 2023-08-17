import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Text, View, Pressable, Image } from "react-native";

const UserChat = ({ item }) => {
  const navigation = useNavigation();

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
        <Text style={{ color: "gray", marginTop: 3, fontWeight: "500" }}>
          last message come here
        </Text>
      </View>

      <View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "400",
            color: "#585858",
          }}
        >
          3:00 pm
        </Text>
      </View>
    </Pressable>
  );
};
export default UserChat;
