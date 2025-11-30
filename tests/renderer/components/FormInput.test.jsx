import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FormInput from "../../../src/renderer/components/forms/FormInput";

describe("FormInput", () => {
  test("renders with label and input", () => {
    render(
      <FormInput
        label="Test Label"
        name="testField"
        value=""
        onChange={() => {}}
        placeholder="Enter text"
      />,
    );

    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  test("calls onChange when user types", () => {
    const handleChange = jest.fn();
    render(
      <FormInput
        label="Title"
        name="title"
        value=""
        onChange={handleChange}
        placeholder="Game title"
      />,
    );

    const input = screen.getByPlaceholderText("Game title");
    fireEvent.change(input, { target: { value: "Super Mario" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test("renders with number type and min/max attributes", () => {
    render(
      <FormInput
        label="Year"
        type="number"
        name="year"
        value=""
        onChange={() => {}}
        min="1970"
        max="2025"
      />,
    );

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("type", "number");
    expect(input).toHaveAttribute("min", "1970");
    expect(input).toHaveAttribute("max", "2025");
  });

  test("renders as required field", () => {
    render(
      <FormInput
        label="Required Field"
        name="required"
        value=""
        onChange={() => {}}
        required={true}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
  });
});
