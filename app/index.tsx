import { Text, View, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>TuneAi</Text>
      <Button
        title="Login"
        onPress={() => router.push("/login")}
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
