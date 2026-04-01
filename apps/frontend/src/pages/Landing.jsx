import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, CheckCircle2, ChevronRight, Cake, PieChart, Layers, DollarSign, ArrowRight, X, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api';

export default function Landing() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  const openAuthModal = (loginMode = true) => {
    setIsLogin(loginMode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const faqs = [
    { question: "¿Qué significa 'costeo composicional'?", answer: "En repostería, las recetas se componen de otras recetas (ej. un pastel lleva bizcocho y relleno). BocadoApp entiende esta estructura jerárquica y actualiza automáticamente el costo final si cambia el precio de cualquier ingrediente base." },
    { question: "¿Puedo manejar diferentes monedas?", answer: "¡Sí! BocadoApp maneja un sistema bimonetario. Calculas tus costos en USD como moneda base y puedes ver los precios en VES, actualizados automáticamente o de forma manual." },
    { question: "¿Es difícil de usar si no soy experto en tecnología?", answer: "Para nada. Hemos diseñado BocadoApp con un 'Minimalismo Sensorial' que lo hace intuitivo, amigable y muy fácil de usar. Su constructor visual te permite armar recetas simplemente arrastrando ingredientes." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-gray selection:bg-peach-soft/30">

      {/* Navbar */}
      <nav className="fixed w-full top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-peach-soft flex items-center justify-center text-white shadow-sm shadow-peach-soft/40">
              <Cake size={22} strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-gray">BocadoApp</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => openAuthModal(true)} className="hidden md:block px-5 py-2.5 text-sm font-medium text-slate-gray hover:text-peach-soft transition-colors">
              Iniciar Sesión
            </button>
            <button onClick={() => openAuthModal(false)} className="px-6 py-2.5 text-sm font-medium bg-slate-gray text-white rounded-xl hover:bg-slate-gray/90 hover:shadow-lg hover:shadow-slate-gray/20 transition-all active:scale-[0.98]">
              Registrarme Gratis
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-20">

        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden bg-white">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-peach-soft/15 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-peach-soft/10 rounded-full blur-[80px] opacity-60 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach-soft/10 text-peach-soft border border-peach-soft/20 mb-8 font-medium text-sm">
                <span className="flex h-2 w-2 rounded-full bg-peach-soft"></span>
                El software definitivo para repostería profesional
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-slate-gray">
                Controla tus costos. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-peach-soft to-orange-400">
                  Multiplica tus ganancias.
                </span>
              </h1>
              <p className="text-xl text-slate-gray/80 mb-12 leading-relaxed max-w-2xl">
                El motor relacional diseñado exclusivamente para que no pierdas ni un centavo en el proceso. Construye súper recetas y presupuestos dinámicos en segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => openAuthModal(false)} className="px-8 py-4 text-base font-medium bg-slate-gray text-white rounded-2xl hover:bg-slate-gray/90 hover:shadow-xl hover:shadow-slate-gray/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  Comienza ahora <ArrowRight size={20} />
                </button>
                <a href="#solucion" className="px-8 py-4 text-base font-medium bg-white border-2 border-gray-100 text-slate-gray rounded-2xl hover:border-peach-soft hover:text-peach-soft hover:bg-peach-soft/5 transition-all flex items-center justify-center">
                  Descubre cómo funciona
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features / Solución Section */}
        <section id="solucion" className="py-24 bg-gray-50/50 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-gray mb-4">La magia detrás de la receta</h2>
              <p className="text-lg text-slate-gray/70 max-w-2xl mx-auto">Herramientas poderosas diseñadas para la realidad del repostero moderno, con una interfaz que amarás usar todos los días.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Layers size={28} />,
                  title: "Costeo Composicional",
                  desc: "Las recetas no son planas. Crea 'Súper Recetas' uniendo bizcochos, rellenos y coberturas. Si el precio de la harina cambia, todas tus recetas se actualizan al instante."
                },
                {
                  icon: <DollarSign size={28} />,
                  title: "Actualización Bimonetaria",
                  desc: "Costea en dólares (USD) y cobra en bolívares (VES). Nuestro sistema se actualiza automáticamente con la tasa del día, o puedes ajustarla manualmente según necesites."
                },
                {
                  icon: <PieChart size={28} />,
                  title: "Constructor Visual",
                  desc: "Olvídate de las hojas de cálculo aburridas. Arrastra y suelta ingredientes para armar tus presupuestos con nuestra interfaz intuitiva y amigable."
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-peach-soft/30 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-peach-soft/10 text-peach-soft flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-gray mb-3">{feature.title}</h3>
                  <p className="text-slate-gray/70 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-gray mb-4">Preguntas Frecuentes</h2>
              <p className="text-lg text-slate-gray/70">Resolvemos tus dudas principales sobre BocadoApp.</p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-bold text-slate-gray mb-2 flex items-center gap-2">
                    <span className="text-peach-soft font-black text-xl">Q.</span> {faq.question}
                  </h3>
                  <p className="text-slate-gray/80 pl-8 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-gray"></div>
          <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-peach-soft/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Lista para tomar el control de tus finanzas pasteleras?</h2>
            <p className="text-xl text-white/80 mb-10">Únete a cientos de reposteros que ya están maximizando sus ganancias con BocadoApp.</p>
            <button onClick={() => openAuthModal(false)} className="px-10 py-5 text-lg font-bold bg-peach-soft text-slate-gray rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-peach-soft/20 transition-all active:scale-[0.98]">
              Crear mi cuenta gratis ahora
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-peach-soft flex items-center justify-center text-white">
                <Cake size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-slate-gray">BocadoApp</span>
            </div>
            <p className="text-slate-gray/70 mb-6 max-w-sm">El motor relacional diseñado para que los reposteros no pierdan ni un centavo en el proceso.</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-gray mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-gray/80 hover:text-peach-soft transition-colors cursor-pointer">
                <Mail size={18} className="text-peach-soft" /> hola@bocadoapp.com
              </li>
              <li className="flex items-center gap-3 text-slate-gray/80 hover:text-peach-soft transition-colors cursor-pointer">
                <Phone size={18} className="text-peach-soft" /> +58 (414) 123-4567
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-gray mb-6">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-gray hover:border-peach-soft hover:text-peach-soft hover:bg-peach-soft/5 transition-all">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-gray hover:border-peach-soft hover:text-peach-soft hover:bg-peach-soft/5 transition-all">
                FB
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 text-center text-slate-gray/50 text-sm">
          © {new Date().getFullYear()} BocadoApp. Todos los derechos reservados.
        </div>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="absolute inset-0 bg-slate-gray/40 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 z-10"
            >
              <button
                onClick={closeAuthModal}
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-slate-gray hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>

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
                    <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-gray">
                      {isLogin ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
                    </h3>
                    <p className="text-sm text-slate-gray/60">
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none text-slate-gray"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
