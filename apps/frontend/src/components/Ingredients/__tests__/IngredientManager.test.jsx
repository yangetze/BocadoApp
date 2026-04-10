import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import IngredientManager from '../IngredientManager'

beforeAll(() => {
  window.scrollTo = jest.fn()
})

jest.mock('../../../api', () => ({
  ingredientApi: {
    getAll: jest.fn().mockResolvedValue([])
  }
}))

describe('IngredientManager', () => {
  it('renders correctly', async () => {
    render(<IngredientManager />)
    expect(screen.getByText('Ingredientes')).toBeInTheDocument()
  })
})
