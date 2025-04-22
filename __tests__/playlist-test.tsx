import React from "react";
import { render } from "@testing-library/react-native";
import Playlists from "../app/playlist";

describe("<Playlists />", () => {
  it("renders the playlist screen title", () => {
    const { getByText } = render(<Playlists />);
    expect(getByText("Your Playlists")).toBeTruthy();
  });
});
