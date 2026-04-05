import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Settings, LogOut, TrendingUp } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ExchangeRateManager from './components/ExchangeRateManager';
import IngredientManager from './components/Ingredients/IngredientManager';
import BaseRecipeBuilderWrapper from './components/BaseRecipes/BaseRecipeBuilderWrapper';
import SuperRecipeBuilderWrapper from './components/SuperRecipes/SuperRecipeBuilderWrapper';
import BudgetBuilderWrapper from './components/Budgets/BudgetBuilderWrapper';

// Protect App Routes
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token } = useAuth();

  if (!token) return <Navigate to="/" replace />;

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/app" replace />;
  }

  return children;
};

function MainApp() {
  const [activeTab, setActiveTab] = useState('ingredient');
  const [showSettings, setShowSettings] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('ingredient')}>
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
          </nav>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end opacity-80 hidden sm:flex">
              <span className="text-[10px] font-bold text-slate-gray/50 uppercase tracking-wider">
                {user?.role === 'ADMIN' ? 'Administrador' : 'Pastelero'}
              </span>
              <span className="text-sm font-bold text-slate-gray">{user?.name || user?.username}</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-all ${
                  showSettings ? 'bg-peach-soft/20 text-peach-soft' : 'text-slate-gray hover:bg-gray-100'
                }`}
                title="Configuración"
                aria-label="Configuración"
                aria-expanded={showSettings}
              >
                <Settings className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ajustes de Negocio</p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('settings');
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-slate-gray hover:bg-peach-soft/10 flex items-center gap-3 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4 text-peach-soft" />
                        Tasas de Cambio
                      </button>
                      {user?.role === 'ADMIN' && (
                        <a 
                          href="/admin" 
                          className="w-full text-left px-4 py-3 text-sm font-medium text-slate-gray hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-50"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Master Admin
                        </a>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-bold text-white bg-slate-gray rounded-xl hover:bg-red-500 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6">
        {activeTab === 'ingredient' && <IngredientManager />}
        {activeTab === 'baseRecipe' && <BaseRecipeBuilderWrapper />}
        {activeTab === 'settings' && <ExchangeRateManager />}
        {activeTab === 'superRecipe' && (
          <SuperRecipeBuilderWrapper />
        )}
        {activeTab === 'budget' && (
          <BudgetBuilderWrapper />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
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
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Main App Route */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect anything else to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
