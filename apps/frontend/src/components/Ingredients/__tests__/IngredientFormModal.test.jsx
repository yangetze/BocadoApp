import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientFormModal from '../IngredientFormModal'

describe('IngredientFormModal', () => {
  it('calculates average price of added brands correctly', async () => {
    const handleSave = jest.fn()
    render(
      <IngredientFormModal
        isOpen
        onClose={() => {}}
        onSave={handleSave}
      />
    )

    // Initial state check
    expect(screen.getByText('Nuevo Ingrediente')).toBeInTheDocument()

    // Fill main ingredient data
    fireEvent.change(screen.getByLabelText('Nombre *'), { target: { value: 'Harina' } })

    // Set global price quantity to 1000 manually for test predictability
    const qtyGlobalInput = screen.getByLabelText('Por cada *')
    fireEvent.change(qtyGlobalInput, { target: { value: '1000' } })

    // Add first presentation
    const presentationNameInput = screen.getByPlaceholderText('Ej. Paquete 1Kg')
    const brandInput = screen.getByPlaceholderText('Ej. Robin Hood')
    const costInput = screen.getAllByRole('spinbutton')[2] // third number input is cost
    const qtyInput = screen.getAllByRole('spinbutton')[3] // fourth number input is quantity

    fireEvent.change(presentationNameInput, { target: { value: 'P1' } })
    fireEvent.change(brandInput, { target: { value: 'B1' } })
    fireEvent.change(costInput, { target: { value: '1.00' } })
    fireEvent.change(qtyInput, { target: { value: '1000' } })

    fireEvent.click(screen.getByText('Add'))

    // We must manually click the calculate button now
    fireEvent.click(screen.getByText('Calcular'))

    // The globalPrice input should be automatically updated
    // cost per unit = 1.00 / 1000 = 0.001 * 1000 (global qty) = 1.0000
    const globalPriceInput = screen.getByLabelText('Precio Global ($) *')
    await waitFor(() => {
      expect(globalPriceInput.value).toBe('1.0000')
    })

    // Add second presentation
    fireEvent.change(presentationNameInput, { target: { value: 'P2' } })
    fireEvent.change(brandInput, { target: { value: 'B2' } })
    fireEvent.change(costInput, { target: { value: '2.00' } })
    fireEvent.change(qtyInput, { target: { value: '1000' } })

    fireEvent.click(screen.getByText('Add'))
    fireEvent.click(screen.getByText('Calcular'))

    // New average cost per unit:
    // P1: 1.00 / 1000 = 0.001
    // P2: 2.00 / 1000 = 0.002
    // Avg: (0.001 + 0.002) / 2 = 0.0015
    // Global price = 0.0015 * 1000 = 1.5000
    await waitFor(() => {
      expect(globalPriceInput.value).toBe('1.5000')
    })
  })
})
