import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddRomForm from "../../../src/renderer/components/forms/AddRomForm";

jest.mock("../../../src/back/data/consoles.json", () => ({
  consoles: {
    NES: { id: "1", id_name: "nes", name: "Nintendo Entertainment System" },
    SNES: { id: "2", id_name: "snes", name: "Super Nintendo" },
  },
}));

describe("AddRomForm", () => {
  beforeEach(() => {
    window.electronAPI.selectRomFile.mockClear();
    window.electronAPI.selectCoverImage.mockClear();
  });

  test("renders form with all fields", () => {
    render(<AddRomForm onSubmit={() => {}} onCancel={() => {}} />);

    expect(screen.getByText("Add New ROM")).toBeInTheDocument();
    expect(screen.getByText("ROM File")).toBeInTheDocument();
    expect(screen.getByText("Console")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Game title...")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("e.g., Action, RPG, Platformer..."),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Release year...")).toBeInTheDocument();
    expect(screen.getByText("Cover Image (Optional)")).toBeInTheDocument();
  });

  test("calls onSubmit with form data when submitted", async () => {
    const handleSubmit = jest.fn();
    render(<AddRomForm onSubmit={handleSubmit} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("Game title..."), {
      target: { value: "Super Mario Bros" },
    });
    fireEvent.change(
      screen.getByPlaceholderText("e.g., Action, RPG, Platformer..."),
      {
        target: { value: "Platformer" },
      },
    );

    fireEvent.click(screen.getByText("Add ROM"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Super Mario Bros",
          genre: "Platformer",
        }),
      );
    });
  });

  test("calls onCancel when Cancel button is clicked", () => {
    const handleCancel = jest.fn();
    render(<AddRomForm onSubmit={() => {}} onCancel={handleCancel} />);

    fireEvent.click(screen.getByText("Cancel"));

    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  test("handles file picker interaction", async () => {
    const mockFilePath = "C:\\ROMs\\game.nes";
    window.electronAPI.selectRomFile.mockResolvedValue(mockFilePath);

    render(<AddRomForm onSubmit={() => {}} onCancel={() => {}} />);

    const browseButtons = screen.getAllByText("Browse");
    fireEvent.click(browseButtons[0]); // First browse button is for ROM file

    await waitFor(() => {
      expect(window.electronAPI.selectRomFile).toHaveBeenCalled();
    });
  });

  test("updates title when file is selected", async () => {
    const mockFilePath = "C:\\ROMs\\Super Mario Bros.nes";
    window.electronAPI.selectRomFile.mockResolvedValue(mockFilePath);

    render(<AddRomForm onSubmit={() => {}} onCancel={() => {}} />);

    const browseButtons = screen.getAllByText("Browse");
    fireEvent.click(browseButtons[0]); // First browse button is for ROM file

    await waitFor(() => {
      const titleInput = screen.getByPlaceholderText("Game title...");
      expect(titleInput).toHaveValue("Super Mario Bros");
    });
  });

  test("year input has correct min and max values", () => {
    render(<AddRomForm onSubmit={() => {}} onCancel={() => {}} />);

    const yearInput = screen.getByPlaceholderText("Release year...");
    expect(yearInput).toHaveAttribute("min", "1970");
    expect(yearInput).toHaveAttribute("max", String(new Date().getFullYear()));
  });

  test("handles cover image selection", async () => {
    const mockCoverPath = "C:\\Covers\\mario.jpg";
    window.electronAPI.selectCoverImage.mockResolvedValue(mockCoverPath);
    const handleSubmit = jest.fn();

    render(<AddRomForm onSubmit={handleSubmit} onCancel={() => {}} />);

    // Select cover image first
    const browseButtons = screen.getAllByText("Browse");
    fireEvent.click(browseButtons[1]); // Second browse button is for cover

    await waitFor(() => {
      expect(window.electronAPI.selectCoverImage).toHaveBeenCalled();
    });

    // Wait for state to update
    await waitFor(() => {
      const coverInputs = screen.getAllByPlaceholderText(
        "Select a ROM file...",
      );
      expect(coverInputs[1]).toHaveValue(mockCoverPath);
    });

    // Fill title and submit
    fireEvent.change(screen.getByPlaceholderText("Game title..."), {
      target: { value: "Test Game" },
    });
    fireEvent.click(screen.getByText("Add ROM"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          cover_path: mockCoverPath,
        }),
      );
    });
  });
});
