/* global describe, it, expect, jest, beforeEach */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import SettingsManager from '../SettingsManager';
import { AuthProvider } from '../../context/AuthContext';
import { api } from '../../api';

// Mock dependencies
jest.mock('../../api', () => ({
  api: {
    put: jest.fn()
  }
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('../ExchangeRateManager', () => () => <div data-testid="exchange-rate-manager">Exchange Rates</div>);

// IMPORTANT: useMemo to memoize the mock user object so it doesn't change on every render!
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => {
      const user = {
        id: '123',
        defaultCurrency: 'USD',
        companyLogo: 'https://example.com/logo.png',
        policies: 'Test Policies',
        paymentMethods: [
          { type: 'Cash', currency: 'USD', details: { Note: 'Test' } }
        ]
      };
      return { user, login: mockLogin };
    },
    AuthProvider: ({ children }) => <div>{children}</div>
  };
});

describe('SettingsManager Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings manager and switches to profile tab', async () => {
    await act(async () => {
      render(<SettingsManager />);
    });
    expect(screen.getByText('Configuración del Sistema')).toBeInTheDocument();

    // Switch to profile tab
    await act(async () => {
      fireEvent.click(screen.getByText('Ajustes de Presupuestos'));
    });

    // Check initial values
    expect(screen.getByText('Preferencias Globales')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/logo.png')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Policies')).toBeInTheDocument();

    // Payment methods section
    expect(screen.getByDisplayValue('Cash')).toBeInTheDocument();
  });

  it('saves profile configuration independently', async () => {
    api.put.mockResolvedValueOnce({ id: '123', name: 'Updated' });

    await act(async () => {
      render(<SettingsManager />);
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Ajustes de Presupuestos'));
    });

    // Change a profile value
    const policyInput = screen.getByDisplayValue('Test Policies');
    await act(async () => {
      fireEvent.change(policyInput, { target: { value: 'New Policies' } });
    });

    // Submit main form (The first "Guardar" button under form)
    const saveButtons = screen.getAllByText('Guardar');
    await act(async () => {
      fireEvent.click(saveButtons[0]);
    });

    expect(api.put).toHaveBeenCalledWith('/users/profile', {
      defaultCurrency: 'USD',
      companyLogo: 'https://example.com/logo.png',
      policies: 'New Policies'
    });
  });

  it('saves payment methods independently', async () => {
    api.put.mockResolvedValueOnce({ id: '123', paymentMethods: [] });

    await act(async () => {
      render(<SettingsManager />);
    });
    await act(async () => {
      fireEvent.click(screen.getByText('Ajustes de Presupuestos'));
    });

    // Add a new payment method
    const addMethodBtn = screen.getByText('Agregar Método');
    await act(async () => {
      fireEvent.click(addMethodBtn);
    });

    // Submit payment methods form (The second "Guardar" button)
    const saveButtons = screen.getAllByText('Guardar');
    await act(async () => {
      fireEvent.click(saveButtons[1]); // The second one is for payments
    });

    expect(api.put).toHaveBeenCalledWith('/users/profile', {
      paymentMethods: [
        { type: 'Cash', currency: 'USD', details: { Note: 'Test' } },
        { type: 'Transferencia', currency: 'VES', details: {} }
      ]
    });
  });
});
