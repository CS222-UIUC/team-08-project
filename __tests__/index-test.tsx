import { render } from "@testing-library/react-native";
import Index from "../app/index";

describe("<Index />", () => {
  it("renders the TuneAi title", () => {
    const { getByText } = render(<Index />);
    getByText("TuneAi"); // Test passes if this text is found
  });
});
