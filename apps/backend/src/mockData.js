export const isTestMode = () => process.env.TEST_MODE === 'true';

// Mock data structures
export const mockData = {
  ingredients: [],
  baseRecipes: [],
  superRecipes: [],
  budgets: [],
  currencies: [
    { id: 'cur-1', code: 'USD', symbol: '$', isBase: true },
    { id: 'cur-2', code: 'VES', symbol: 'Bs', isBase: false }
  ],
  exchangeRates: [],
  users: [
    { id: 'user-default-1', email: 'test@bocadoapp.com', name: 'Test User' }
  ]
};

// Populate some initial mock data for a better test mode experience
export const initMockData = () => {
  // Add some ingredients
  mockData.ingredients.push(
    { id: 'ing-1', name: 'Harina de Trigo', globalPrice: 2.5, globalPriceQuantity: 1, measurementUnit: 'gr', presentations: [], budgetSelections: [], userId: 'user-default-1', createdAt: new Date() },
    { id: 'ing-2', name: 'Azúcar Refinada', globalPrice: 1.8, globalPriceQuantity: 1, measurementUnit: 'gr', presentations: [], budgetSelections: [], userId: 'user-default-1', createdAt: new Date() },
    { id: 'ing-3', name: 'Huevos', globalPrice: 5.0, globalPriceQuantity: 1, measurementUnit: 'u', presentations: [], budgetSelections: [], userId: 'user-default-1', createdAt: new Date() },
    { id: 'ing-4', name: 'Mantequilla', globalPrice: 4.2, globalPriceQuantity: 1, measurementUnit: 'gr', presentations: [], budgetSelections: [], userId: 'user-default-1', createdAt: new Date() },
    { id: 'ing-5', name: 'Caja para pastel', globalPrice: 1.5, globalPriceQuantity: 1, measurementUnit: 'u', presentations: [], budgetSelections: [], userId: 'user-default-1', createdAt: new Date() }
  );

  // Add a base recipe (Bizcocho)
  mockData.baseRecipes.push({
    id: 'br-1',
    name: 'Bizcocho de Vainilla',
    baseYield: 1000,
    yieldUnit: 'gr',
    userId: 'user-default-1',
    createdAt: new Date(),
    ingredients: [
      { id: 'bri-1', baseRecipeId: 'br-1', ingredientId: 'ing-1', quantity: 250, ingredient: mockData.ingredients.find(i => i.id === 'ing-1') },
      { id: 'bri-2', baseRecipeId: 'br-1', ingredientId: 'ing-2', quantity: 250, ingredient: mockData.ingredients.find(i => i.id === 'ing-2') },
      { id: 'bri-3', baseRecipeId: 'br-1', ingredientId: 'ing-3', quantity: 4, ingredient: mockData.ingredients.find(i => i.id === 'ing-3') },
      { id: 'bri-4', baseRecipeId: 'br-1', ingredientId: 'ing-4', quantity: 250, ingredient: mockData.ingredients.find(i => i.id === 'ing-4') }
    ]
  });

  // Add a super recipe (Pastel Básico)
  mockData.superRecipes.push({
    id: 'sr-1',
    name: 'Pastel Básico de Vainilla',
    description: 'Pastel sencillo para 10 personas',
    userId: 'user-default-1',
    createdAt: new Date(),
    baseRecipes: [
      { id: 'srbr-1', superRecipeId: 'sr-1', baseRecipeId: 'br-1', quantityNeeded: 500, baseRecipe: mockData.baseRecipes[0] }
    ],
    directIngredients: [
      { id: 'srdi-1', superRecipeId: 'sr-1', ingredientId: 'ing-5', quantityNeeded: 1, ingredient: mockData.ingredients.find(i => i.id === 'ing-5') }
    ]
  });

  // Add an exchange rate
  mockData.exchangeRates.push({
    id: 'er-1',
    rate: 36.5,
    effectiveDate: new Date(),
    source: 'MANUAL',
    targetCurrencyId: 'cur-2',
    targetCurrency: mockData.currencies.find(c => c.id === 'cur-2')
  });
};

initMockData();
