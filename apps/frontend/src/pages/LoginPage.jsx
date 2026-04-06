import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Cake, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [formData, setFormData] = useState({ loginId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, token, user } = useAuth();
  const navigate = useNavigate();

  // Si ya estás logueado, regresemos al obrador inmediatamente
  useEffect(() => {
    if (token) navigate(user?.role === 'ADMIN' ? '/admin' : '/app');
  }, [token, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(formData);
      login(res.data.token, res.data.user);
      toast.success(`¡Qué bueno verte, ${res.data.user.name || res.data.user.username}!`);
      
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos sensoriales */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-peach-soft/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-peach-soft/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-gray/60 hover:text-peach-soft transition-colors mb-8 group text-sm font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-peach-soft rounded-2xl flex items-center justify-center text-white shadow-lg shadow-peach-soft/30 mb-6">
              <Cake size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-gray tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-slate-gray/50 mt-2 text-center">Ingresa a tu obrador digital en BocadoApp</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="loginId" className="text-sm font-semibold text-slate-gray/80 ml-1">Usuario o Email</label>
              <input
                id="loginId"
                type="text"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                placeholder="ej. repostera_estrella"
                value={formData.loginId}
                onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="text-sm font-semibold text-slate-gray/80">Contraseña</label>
                <a href="#" className="text-xs text-peach-soft hover:underline font-medium">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-5 py-4 pr-12 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray/50 hover:text-slate-gray transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-expanded={showPassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-slate-gray text-white rounded-2xl font-bold hover:bg-slate-gray/90 hover:shadow-xl hover:shadow-slate-gray/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Verificando...</span>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar a mi panel
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-slate-gray/60 font-medium">
            ¿Aún no tienes una cuenta? {' '}
            <Link to="/register" className="text-peach-soft hover:underline font-bold">Únete gratis aquí</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
