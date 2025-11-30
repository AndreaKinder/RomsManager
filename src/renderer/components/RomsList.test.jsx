import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RomsList from "./RomsList";

const mockRoms = [
  {
    id: "1",
    file_name: "game1.nes",
    console: "NES",
    metadata: {
      title: "Super Mario Bros",
      genre: "Platformer",
      year: 1985,
    },
    favorite: true,
  },
  {
    id: "2",
    file_name: "game2.snes",
    console: "SNES",
    metadata: {
      title: "The Legend of Zelda",
      genre: "Adventure",
      year: 1991,
    },
    favorite: false,
  },
];

describe("RomsList", () => {
  test("renders empty state when no ROMs", () => {
    render(<RomsList roms={[]} onDelete={() => {}} />);

    expect(screen.getByText("No ROMs yet")).toBeInTheDocument();
    expect(
      screen.getByText("Add your first ROM to get started!"),
    ).toBeInTheDocument();
  });

  test("renders all ROMs in the list", () => {
    render(<RomsList roms={mockRoms} onDelete={() => {}} />);

    expect(screen.getByText("Super Mario Bros")).toBeInTheDocument();
    expect(screen.getByText("The Legend of Zelda")).toBeInTheDocument();
  });

  test("displays ROM metadata correctly", () => {
    render(<RomsList roms={mockRoms} onDelete={() => {}} />);

    expect(screen.getAllByText(/NES/)[0]).toBeInTheDocument();
    expect(screen.getByText(/game1.nes/)).toBeInTheDocument();
    expect(screen.getByText(/Platformer/)).toBeInTheDocument();
    expect(screen.getByText(/1985/)).toBeInTheDocument();
  });

  test("shows favorite icon for favorited ROMs", () => {
    const { container } = render(
      <RomsList roms={mockRoms} onDelete={() => {}} />,
    );

    const favoriteIcons = container.querySelectorAll(".nes-icon.is-small.star");
    expect(favoriteIcons).toHaveLength(1);
  });

  test("calls onDelete when delete button is clicked and confirmed", () => {
    const handleDelete = jest.fn();
    global.confirm = jest.fn(() => true);

    render(<RomsList roms={mockRoms} onDelete={handleDelete} />);

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith('Delete "Super Mario Bros"?');
    expect(handleDelete).toHaveBeenCalledWith("1");
  });

  test("does not call onDelete when delete is cancelled", () => {
    const handleDelete = jest.fn();
    global.confirm = jest.fn(() => false);

    render(<RomsList roms={mockRoms} onDelete={handleDelete} />);

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalled();
    expect(handleDelete).not.toHaveBeenCalled();
  });

  test("Edit button is disabled", () => {
    render(<RomsList roms={mockRoms} onDelete={() => {}} />);

    const editButtons = screen.getAllByText("Edit");
    editButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  test("uses file_name when title is not available", () => {
    const romsWithoutTitle = [
      {
        id: "3",
        file_name: "untitled.nes",
        console: "NES",
        metadata: {},
      },
    ];

    render(<RomsList roms={romsWithoutTitle} onDelete={() => {}} />);

    expect(
      screen.getByRole("heading", { name: "untitled.nes" }),
    ).toBeInTheDocument();
  });
});
