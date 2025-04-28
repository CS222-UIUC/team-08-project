import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";

//import { useRouter } from "expo-router";

export default function Login() {
  //const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:7000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("12");

      const { auth_url }: { auth_url: string } = await response.json();
      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        "http://127.0.0.1:7000/callback",
      );
      if (result.type == "success") {
        const url = result.url;
        const code = new URL(url).searchParams.get("code");
        console.log(code);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color="#32CD32" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#32CD32",
    marginBottom: 30,
  },
  input: {
    width: "80%",
    height: 50,
    borderColor: "#32CD32",
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 10,
    color: "#FFFFFF",
    backgroundColor: "#1E1E1E",
  },
  buttonContainer: {
    width: "80%",
    borderRadius: 25,
    overflow: "hidden",
  },
});
