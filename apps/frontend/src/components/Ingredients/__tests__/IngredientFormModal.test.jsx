import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import IngredientFormModal from '../IngredientFormModal';

describe('IngredientFormModal', () => {
  it('calculates average price of added brands correctly', async () => {
    const handleSave = jest.fn();
    render(
      <IngredientFormModal
        isOpen={true}
        onClose={() => {}}
        onSave={handleSave}
      />
    );

    // Initial state check
    expect(screen.getByText('Nuevo Ingrediente')).toBeInTheDocument();

    // Fill main ingredient data
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Harina' } });

    // Add first presentation
    const presentationNameInput = screen.getByPlaceholderText('Ej. Paquete 1Kg');
    const brandInput = screen.getByPlaceholderText('Ej. Robin Hood');
    const costInput = screen.getAllByRole('spinbutton')[1]; // Second number input is cost
    const qtyInput = screen.getAllByRole('spinbutton')[2]; // Third number input is quantity

    fireEvent.change(presentationNameInput, { target: { value: 'P1' } });
    fireEvent.change(brandInput, { target: { value: 'B1' } });
    fireEvent.change(costInput, { target: { value: '1.00' } });
    fireEvent.change(qtyInput, { target: { value: '1000' } });

    fireEvent.click(screen.getByText('Add'));

    // The defaultCost input should be automatically updated
    // cost per unit = 1.00 / 1000 = 0.001
    const defaultCostInput = screen.getByLabelText('Costo Estimado Base (USD) *');
    await waitFor(() => {
        expect(defaultCostInput.value).toBe('0.0010');
    });

    // Add second presentation
    fireEvent.change(presentationNameInput, { target: { value: 'P2' } });
    fireEvent.change(brandInput, { target: { value: 'B2' } });
    fireEvent.change(costInput, { target: { value: '2.00' } });
    fireEvent.change(qtyInput, { target: { value: '1000' } });

    fireEvent.click(screen.getByText('Add'));

    // New average cost per unit:
    // P1: 1.00 / 1000 = 0.001
    // P2: 2.00 / 1000 = 0.002
    // Avg: (0.001 + 0.002) / 2 = 0.0015
    await waitFor(() => {
        expect(defaultCostInput.value).toBe('0.0015');
    });
  });
});
