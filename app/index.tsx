import { Text, View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// ------- IMPORTANT -------
// ngrok setup: brew install ngrok

// ------- COMMANDS TO RUN BEFORE STARTING THE APP -------
// 1. Run the Flask server
// 2. Run ngrok with the command: ngrok http 4000
// 3. Replace the ngrok URL in the fetch request below with the one generated by ngrok
// 4. Run the app with the command: npx expo start
// 5. Scan the QR code with the Expo Go app on your phone
const ngrok_url = "https://0475-130-126-255-56.ngrok-free.app";

export default function Index() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      //this fetch returns "Network Request Failed" because mac only supports https and our flask server is http
      //fixing this should make login work
      const response = await fetch(`${ngrok_url}/login`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Ngrok-Skip-Browser-Warning": "true",
        },
      });
      const data = await response.json();
      const auth_url = data.auth_url;
      const verifier = data.verifier;
      console.log("Auth URL:", auth_url);
      console.log("Verifier Expo: ", verifier);
      const result = await WebBrowser.openAuthSessionAsync(
        auth_url,
        `${ngrok_url}/callback`,
      );
      console.log(result);
      router.push("/playlist");
    } catch (error) {
      console.log("Error at line 10:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>TuneAi</Text>
      <Button
        title="Login With Spotify"
        onPress={handleLogin}
        color="#32CD32" // Green highlight
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212", // Dark gray/black background
  },
  text: {
    color: "#FFFFFF", // White text
    fontSize: 100,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
