import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import StackNavigator from "./StackNavigator";
import { UserContext } from "./UserContext";

export default function App() {
  return (
    //1. We use UserContext to handle user datas. (UseContext)
    //2. In StackNavigator we provide the screens for navigation
    <>
      <UserContext>
        <StackNavigator></StackNavigator>
      </UserContext>
    </>
  );
}
