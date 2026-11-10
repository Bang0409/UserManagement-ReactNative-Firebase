
import React, { useEffect, useState } from "react";
import UserListScreen from "./screens/UserListScreen";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { auth } from "./firebase/firebaseConfig";
import LoginScreen from "./screens/LoginScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <UserListScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 15,
    textAlign: "center",
  },
  email: {
    fontSize: 18,
    color: "#334155",
    marginBottom: 20,
  },
  description: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: 25,
  },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 13,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
