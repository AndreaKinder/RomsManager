import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SelectConsole from "../../../src/renderer/components/SelectConsole";

const mockConsoles = [
  { id: "1", id_name: "nes", name: "Nintendo Entertainment System" },
  { id: "2", id_name: "snes", name: "Super Nintendo" },
  { id: "3", id_name: "n64", name: "Nintendo 64" },
];

describe("SelectConsole", () => {
  test("renders all console options", () => {
    render(
      <SelectConsole consoles={mockConsoles} value="" onChange={() => {}} />,
    );

    expect(
      screen.getByText("Nintendo Entertainment System"),
    ).toBeInTheDocument();
    expect(screen.getByText("Super Nintendo")).toBeInTheDocument();
    expect(screen.getByText("Nintendo 64")).toBeInTheDocument();
  });

  test("calls onChange when option is selected", () => {
    const handleChange = jest.fn();
    render(
      <SelectConsole
        consoles={mockConsoles}
        value=""
        onChange={handleChange}
      />,
    );

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "nes" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("displays selected value", () => {
    render(
      <SelectConsole
        consoles={mockConsoles}
        value="snes"
        onChange={() => {}}
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("snes");
  });

  test("renders correct number of options", () => {
    render(
      <SelectConsole consoles={mockConsoles} value="" onChange={() => {}} />,
    );

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
  });
});
