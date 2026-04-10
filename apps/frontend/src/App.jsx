import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';

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
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <Header />
      <main className="max-w-6xl mx-auto px-6">
        <Outlet />
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
          >
            <Route index element={<Navigate to="/app/ingredients" replace />} />
            <Route path="ingredients" element={<IngredientManager />} />
            <Route path="base-recipes" element={<BaseRecipeBuilderWrapper />} />
            <Route path="super-recipes" element={<SuperRecipeBuilderWrapper />} />
            <Route path="budgets" element={<BudgetBuilderWrapper />} />
            <Route path="settings" element={<ExchangeRateManager />} />
          </Route>

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
