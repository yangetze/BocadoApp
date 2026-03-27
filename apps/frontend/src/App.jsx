import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ExchangeRateManager from './components/ExchangeRateManager';
import Builder from './components/DragAndDrop/Builder';
import IngredientManager from './components/Ingredients/IngredientManager';
import BaseRecipeBuilderWrapper from './components/BaseRecipes/BaseRecipeBuilderWrapper';
import { sampleBaseRecipes, sampleSuperRecipes } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('ingredient');
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#3E4A59',
            color: '#fff',
            borderRadius: '16px',
          },
          success: {
            iconTheme: {
              primary: '#F7C5B2',
              secondary: '#3E4A59',
            },
          },
        }}
      />

      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('settings')}>
            <div className="w-8 h-8 rounded-full bg-peach-soft flex items-center justify-center text-white font-bold shadow-sm shadow-peach-soft/40">
              B
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-gray">BocadoApp</span>
          </div>

          <nav className="flex items-center gap-1 bg-gray-50/80 p-1.5 rounded-xl border border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ingredient')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'ingredient'
                  ? 'bg-white text-slate-gray shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-slate-gray hover:bg-white/50'
              }`}
            >
              Ingredientes
            </button>
            <button
              onClick={() => setActiveTab('baseRecipe')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'baseRecipe'
                  ? 'bg-white text-slate-gray shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-slate-gray hover:bg-white/50'
              }`}
            >
              Recetas Base
            </button>
            <button
              onClick={() => setActiveTab('superRecipe')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'superRecipe'
                  ? 'bg-white text-slate-gray shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-slate-gray hover:bg-white/50'
              }`}
            >
              Constructor Súper Recetas
            </button>
            <button
              onClick={() => setActiveTab('budget')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'budget'
                  ? 'bg-white text-slate-gray shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-slate-gray hover:bg-white/50'
              }`}
            >
              Constructor Presupuestos
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-slate-gray shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-slate-gray hover:bg-white/50'
              }`}
            >
              Tasas de Cambio
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'ingredient' && <IngredientManager />}
        {activeTab === 'baseRecipe' && <BaseRecipeBuilderWrapper />}
        {activeTab === 'settings' && <ExchangeRateManager />}
        {activeTab === 'superRecipe' && (
          <Builder mode="superRecipe" availableItems={sampleBaseRecipes} />
        )}
        {activeTab === 'budget' && (
          <Builder mode="budget" availableItems={sampleSuperRecipes} />
        )}
      </main>
    </div>
  );
}

export default App;
