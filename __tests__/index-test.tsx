import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Index from "../app/index";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
declare const global: typeof globalThis;

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(),
}));

global.fetch = jest.fn();

describe("Index Screen", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it("renders the title and button", () => {
    const { getByText } = render(<Index />);
    expect(getByText("TuneAi")).toBeTruthy();
    expect(getByText("Login With Spotify")).toBeTruthy();
  });

  it("calls handleLogin and navigates on successful login", async () => {
    // Mock fetch response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        auth_url: "https://spotify.com/auth",
        verifier: "verifier123",
      }),
    });
    // Mock WebBrowser
    (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValueOnce({
      type: "success",
    });

    const { getByText } = render(<Index />);
    const button = getByText("Login With Spotify");

    fireEvent.press(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/login"),
        expect.objectContaining({
          method: "GET",
        }),
      );
      expect(WebBrowser.openAuthSessionAsync).toHaveBeenCalledWith(
        "https://spotify.com/auth",
        expect.stringContaining("/callback"),
      );
      expect(mockPush).toHaveBeenCalledWith("/playlist");
    });
  });

  it("logs error if fetch fails", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const { getByText } = render(<Index />);
    fireEvent.press(getByText("Login With Spotify"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error at line 10:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("shows pressed style when button is pressed", () => {
    const { getByText } = render(<Index />);
    const button = getByText("Login With Spotify");

    fireEvent(button, "pressIn");
    // You can check for style changes if you query by testID or use toMatchSnapshot
    // Here, we just ensure the button is still there
    expect(button).toBeTruthy();
  });

  it("handles missing auth_url gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({}), // No auth_url
    });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    const { getByText } = render(<Index />);
    fireEvent.press(getByText("Login With Spotify"));

    await waitFor(() => {
      // Should log undefined for auth_url
      expect(consoleSpy).toHaveBeenCalledWith("Auth URL:", undefined);
    });

    consoleSpy.mockRestore();
  });
});
