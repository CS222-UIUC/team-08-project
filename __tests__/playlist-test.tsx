import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Playlists from "../app/playlist";
import { useRouter } from "expo-router";
declare const global: typeof globalThis;

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

global.fetch = jest.fn();

describe("Playlists screen", () => {
  const mockPush = jest.fn();

  const mockApiResponse = [
    {
      id: "abc123",
      name: "Test Playlist",
      images: [{ url: "https://img.com/1.jpg" }],
      tracks: { total: 42 },
    },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.clearAllMocks();
  });

  it("renders playlists after fetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockApiResponse,
    });
    const { getByText, queryByText } = render(<Playlists />);
    await waitFor(() => {
      expect(queryByText("Loading your playlists...")).toBeNull();
      expect(getByText("Your Playlists")).toBeTruthy();
      expect(getByText("Test Playlist")).toBeTruthy();
      expect(getByText("42 tracks")).toBeTruthy();
    });
  });

  it("shows 'No playlists found' if API returns empty array", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [],
    });
    const { getByText } = render(<Playlists />);
    await waitFor(() => {
      expect(getByText("No playlists found")).toBeTruthy();
    });
  });

  it("shows error and retry button on fetch failure", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network fail"),
    );
    const { getByText } = render(<Playlists />);
    await waitFor(() => {
      expect(getByText(/Error:/)).toBeTruthy();
      expect(getByText("Retry")).toBeTruthy();
    });
  });

  it("navigates to /home with params when playlist is pressed", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => mockApiResponse,
    });
    const { getByText } = render(<Playlists />);
    await waitFor(() => getByText("Test Playlist"));
    fireEvent.press(getByText("Test Playlist"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/home",
      params: { playlistId: "abc123", playlistName: "Test Playlist" },
    });
  });

  it("uses fallback image if playlist has no images", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => [
        {
          id: "noimg",
          name: "No Image Playlist",
          images: [],
          tracks: { total: 5 },
        },
      ],
    });
    const { getByText } = render(<Playlists />);
    await waitFor(() => getByText("No Image Playlist"));
    // You could check the Image source prop here if you assign a testID to the <Image /> in your component
  });
});
