import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Start" }} />
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="playlists" options={{ title: "Your Playlists" }} />
      <Stack.Screen name="home" options={{ title: "Home" }} />
    </Stack>
  );
}
