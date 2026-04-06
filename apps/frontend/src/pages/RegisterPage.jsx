import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    identificationNumber: '',
    name: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Si ya estás logueado, regresemos al obrador inmediatamente
  useEffect(() => {
    if (token) navigate(user?.role === 'ADMIN' ? '/admin' : '/app');
  }, [token, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(formData);
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión con tu usuario y contraseña (tu cédula inicialmente).');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Elementos decorativos sensoriales */}
      <div className="absolute top-[-5%] right-[-10%] w-80 h-80 bg-peach-soft/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-peach-soft/10 rounded-full blur-3xl pointer-events-none"></div>

      <div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-slate-gray/60 hover:text-peach-soft transition-colors mb-8 group text-sm font-medium">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12">
          <div className="text-center mb-10">
            <div className="inline-flex w-14 h-14 bg-slate-gray rounded-2xl items-center justify-center text-white mb-6">
              <UserPlus size={28} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-slate-gray tracking-tight">Comienza con BocadoApp</h1>
            <p className="text-slate-gray/50 mt-2">La herramienta que tu negocio de repostería merece.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-semibold text-slate-gray/80 ml-1">¿Cómo te llamas?</label>
              <input
                id="name"
                type="text"
                name="name"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                placeholder="ej. Mariana Torres"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-sm font-semibold text-slate-gray/80 ml-1">Usuario</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                  placeholder="marianat_bakery"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="identificationNumber" className="text-sm font-semibold text-slate-gray/80 ml-1">Cédula e ID</label>
                <input
                  id="identificationNumber"
                  type="text"
                  name="identificationNumber"
                  required
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                  placeholder="V-28000111"
                  value={formData.identificationNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-slate-gray/80 ml-1">Tu email profesional</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-peach-soft/15 focus:border-peach-soft transition-all outline-none text-slate-gray font-medium"
                placeholder="hola@tupasteleria.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="bg-peach-soft/5 border border-peach-soft/20 rounded-2xl p-4 flex items-start gap-4 mb-4">
              <div className="mt-0.5 text-peach-soft">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-xs leading-relaxed text-slate-gray/60 font-medium">
                Tu **cédula** será asignada como contraseña inicial. Podrás cambiarla una vez que estés dentro de tu panel de control.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-slate-gray text-white rounded-2xl font-bold hover:bg-slate-gray/90 hover:shadow-xl hover:shadow-slate-gray/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Registrando...</span>
              ) : (
                <>
                  <UserPlus size={20} />
                  Crear mi cuenta gratis
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-slate-gray/60 font-medium">
            ¿Ya eres de la familia? {' '}
            <Link to="/login" className="text-peach-soft hover:underline font-bold">Inicia sesión aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
