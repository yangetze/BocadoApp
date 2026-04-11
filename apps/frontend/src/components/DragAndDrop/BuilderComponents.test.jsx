/* global describe, it, expect, jest */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BuilderHeader } from "./BuilderHeader";
import { MarginRecommendationCard } from "./MarginRecommendationCard";
import { BaseRecipeMetadataForm } from "./BaseRecipeMetadataForm";
import "@testing-library/jest-dom";

describe("Builder Extracted Components", () => {
  describe("BuilderHeader", () => {
    it("renders correct title and description for superRecipe mode", () => {
      render(
        <BuilderHeader
          mode="superRecipe"
          onClear={() => {}}
          onSave={() => {}}
          isSaving={false}
        />,
      );

      expect(screen.getByText("Nueva Súper Receta")).toBeInTheDocument();
      expect(
        screen.getByText("Construye tu producto final apilando recetas base."),
      ).toBeInTheDocument();
    });

    it("calls onClear and onSave handlers", () => {
      const mockClear = jest.fn();
      const mockSave = jest.fn();

      render(
        <BuilderHeader
          mode="baseRecipe"
          onClear={mockClear}
          onSave={mockSave}
          isSaving={false}
        />,
      );

      fireEvent.click(screen.getByText("Limpiar"));
      expect(mockClear).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Guardar"));
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it("disables buttons when saving", () => {
      render(
        <BuilderHeader
          mode="budget"
          onClear={() => {}}
          onSave={() => {}}
          isSaving={true}
        />,
      );

      expect(screen.getByRole("button", { name: /limpiar/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /guardar/i })).toBeDisabled();
    });
  });

  describe("MarginRecommendationCard", () => {
    it("does not render if suggestedMargin is null", () => {
      const { container } = render(
        <MarginRecommendationCard suggestedMargin={null} />,
      );
      expect(container).toBeEmptyDOMElement();
    });

    it("renders the suggested margin", () => {
      render(<MarginRecommendationCard suggestedMargin={40} />);
      expect(
        screen.getByText("Recomendador de Margen (IA)"),
      ).toBeInTheDocument();
      expect(screen.getByText("40%")).toBeInTheDocument();
    });
  });

  describe("BaseRecipeMetadataForm", () => {
    it("renders inputs and total cost", () => {
      const mockMetadata = {
        name: "Test Recipe",
        baseYield: 500,
        yieldUnit: "g",
      };
      const mockSetMetadata = jest.fn();

      render(
        <BaseRecipeMetadataForm
          metadata={mockMetadata}
          setMetadata={mockSetMetadata}
          totalCost={15.5}
        />,
      );

      expect(screen.getByDisplayValue("Test Recipe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("500")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Gramos (g)")).toBeInTheDocument();
      expect(screen.getByText("$ 15.50 USD")).toBeInTheDocument();
    });

    it("calls setMetadata on input change", () => {
      const mockMetadata = { name: "", baseYield: "", yieldUnit: "g" };
      const mockSetMetadata = jest.fn();

      render(
        <BaseRecipeMetadataForm
          metadata={mockMetadata}
          setMetadata={mockSetMetadata}
          totalCost={0}
        />,
      );

      fireEvent.change(
        screen.getByPlaceholderText("Ej. Ganache de Chocolate"),
        {
          target: { value: "New Name" },
        },
      );

      expect(mockSetMetadata).toHaveBeenCalledWith({
        ...mockMetadata,
        name: "New Name",
      });
    });
  });
});
