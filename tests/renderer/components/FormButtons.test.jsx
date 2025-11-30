import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FormButtons from "../../../src/renderer/components/forms/FormButtons";

describe("FormButtons", () => {
  test("renders with default text", () => {
    render(<FormButtons onCancel={() => {}} />);

    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("renders with custom text", () => {
    render(
      <FormButtons
        onCancel={() => {}}
        submitText="Add ROM"
        cancelText="Go Back"
      />,
    );

    expect(screen.getByText("Add ROM")).toBeInTheDocument();
    expect(screen.getByText("Go Back")).toBeInTheDocument();
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const handleCancel = jest.fn();
    render(<FormButtons onCancel={handleCancel} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test('submit button has type="submit"', () => {
    render(<FormButtons onCancel={() => {}} />);

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toHaveAttribute("type", "submit");
  });

  test('cancel button has type="button"', () => {
    render(<FormButtons onCancel={() => {}} />);

    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toHaveAttribute("type", "button");
  });
});
