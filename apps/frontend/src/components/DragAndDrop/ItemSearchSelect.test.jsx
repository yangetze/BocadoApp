/* global describe, it, expect */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ItemSearchSelect } from "./ItemSearchSelect";
import "@testing-library/jest-dom";

describe("ItemSearchSelect", () => {
  const items = [
    { id: "1", name: "Harina", measurementUnit: "kg" },
    { id: "2", name: "Azúcar", measurementUnit: "kg", globalPrice: 2.5 },
  ];

  it("renders input correctly", () => {
    render(<ItemSearchSelect items={items} onAdd={() => {}} />);
    expect(screen.getByPlaceholderText("Buscar elemento para agregar...")).toBeInTheDocument();
  });

  it("shows items when focused", () => {
    render(<ItemSearchSelect items={items} onAdd={() => {}} />);
    const input = screen.getByPlaceholderText("Buscar elemento para agregar...");
    fireEvent.focus(input);
    expect(screen.getByText("Harina")).toBeInTheDocument();
    expect(screen.getByText("Azúcar")).toBeInTheDocument();
  });
});
