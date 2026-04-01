import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, CheckCircle2, ChevronRight, Cake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    username: '',
    email: '',
    identificationNumber: '',
    name: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post('/auth/login', {
          loginId: formData.loginId,
          password: formData.password
        });
        login(res.data.token, res.data.user);
        toast.success(`¡Bienvenido de vuelta, ${res.data.user.username}!`);

        // Redirect logic based on role
        if (res.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/app');
        }
      } else {
        const res = await api.post('/auth/register', {
          username: formData.username,
          email: formData.email,
          identificationNumber: formData.identificationNumber,
          name: formData.name
        });
        toast.success('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsLogin(true);
        setFormData({ loginId: res.data.user.username, password: formData.identificationNumber, username: '', email: '', identificationNumber: '', name: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Ocurrió un error. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-slate-gray">
      {/* Left Side - Hero / Marketing */}
      <div className="md:w-1/2 lg:w-3/5 bg-peach-soft/20 flex flex-col justify-center p-12 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-peach-soft/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-peach-soft flex items-center justify-center text-white shadow-lg shadow-peach-soft/40">
                <Cake size={32} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-gray">BocadoApp</h1>
            </div>

            <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
              Controla tus costos. <br/>
              <span className="text-peach-soft brightness-90">Multiplica tus ganancias.</span>
            </h2>

            <p className="text-lg text-slate-gray/80 mb-10 leading-relaxed max-w-lg">
              El motor relacional diseñado exclusivamente para reposteros profesionales. Construye súper recetas, presupuestos dinámicos y no pierdas ni un centavo en el proceso.
            </p>

            <ul className="space-y-4">
              {[
                "Costeo composicional de recetas",
                "Actualización automática bimonetaria (USD/VES)",
                "Constructor visual interactivo"
              ].map((feature, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + (idx * 0.1) }}
                  className="flex items-center gap-3 font-medium text-slate-gray/90"
                >
                  <CheckCircle2 className="text-peach-soft" size={24} />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.05)] z-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 w-full max-w-sm">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isLogin ? 'bg-white text-slate-gray shadow-sm' : 'text-gray-500 hover:text-slate-gray'
                }`}
              >
                Ingresar
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  !isLogin ? 'bg-white text-slate-gray shadow-sm' : 'text-gray-500 hover:text-slate-gray'
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold tracking-tight mb-2">
                  {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isLogin ? 'Ingresa tus credenciales para acceder a tu panel.' : 'Únete a BocadoApp y toma el control de tu negocio.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isLogin ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-gray">Usuario o Email</label>
                      <input
                        type="text"
                        name="loginId"
                        value={formData.loginId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                        placeholder="ej. repostero_pro"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-gray">Contraseña (Cédula)</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-gray">Nombre Completo</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                        placeholder="Juan Pérez"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-gray">Usuario</label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                          placeholder="juanp"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-slate-gray">Cédula</label>
                        <input
                          type="text"
                          name="identificationNumber"
                          value={formData.identificationNumber}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                          placeholder="V-12345678"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-gray">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none"
                        placeholder="juan@email.com"
                      />
                      <p className="text-xs text-gray-400 mt-1">Tu cédula será asignada como contraseña inicial.</p>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-gray text-white rounded-xl font-medium hover:bg-slate-gray/90 hover:shadow-lg hover:shadow-slate-gray/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="animate-pulse">Cargando...</span>
                  ) : isLogin ? (
                    <>
                      <LogIn size={20} />
                      Ingresar a mi cuenta
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      Comenzar ahora
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
