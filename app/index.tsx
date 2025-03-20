import { Text, View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';

export default function Index() {
  const router = useRouter();

  const handleLogin = async() => {
    try {
      //this fetch returns "Network Request Failed" because mac only supports https and our flask server is http
      //fixing this should make login work
      const response = await fetch('https://127.0.0.1:4000/login', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(JSON.stringify(response))
      const { auth_url, verifier }: { auth_url: string; verifier: string } = await response.json();   
      const result = await WebBrowser.openAuthSessionAsync(auth_url, 'https://127.0.0.1:4000/callback');
      if (result.type == 'success'){
        const url = result.url;
        const code = new URL(url).searchParams.get('code');
      }
    } catch (error) {
      console.log('Error at line 10:', error);
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
