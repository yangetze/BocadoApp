import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, CheckCircle2, XCircle, Search, Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error(error.message || 'Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.put(`/users/${userId}`, { active: !currentStatus });
      toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} con éxito`);
      setUsers(users.map(u => u.id === userId ? { ...u, active: !currentStatus } : u));
    } catch (error) {
      toast.error(error.message || 'Error al actualizar el estado del usuario');
    }
  };

  // ⚡ Bolt: Memoized the filtered user list to prevent unnecessary O(n) recalculations
  // on every render, and extracted the lowercased search term outside the loop.
  const filteredUsers = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(lowercasedSearchTerm) ||
      u.email.toLowerCase().includes(lowercasedSearchTerm) ||
      u.identificationNumber.includes(searchTerm)
    );
  }, [users, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-slate-gray py-4 px-6 mb-8 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <Link to="/app" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-peach-soft" size={24} />
              <span className="font-bold text-xl tracking-tight">Panel Administrativo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              Admin: {user?.username}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-gray flex items-center gap-3">
              Gestión de Usuarios
              <span className="bg-peach-soft/20 text-peach-soft px-3 py-1 rounded-full text-sm font-medium">
                {users.length} Total
              </span>
            </h1>
            <p className="text-gray-500 mt-2">Administra los accesos y roles de la plataforma BocadoApp.</p>
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por usuario, email o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-peach-soft/50 focus:border-peach-soft transition-all outline-none shadow-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-sm border-b border-gray-100">
                  <th className="font-medium px-6 py-4 rounded-tl-3xl">Usuario</th>
                  <th className="font-medium px-6 py-4">Cédula</th>
                  <th className="font-medium px-6 py-4">Rol</th>
                  <th className="font-medium px-6 py-4">Estado</th>
                  <th className="font-medium px-6 py-4 text-right rounded-tr-3xl">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-slate-gray">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400 animate-pulse">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-gray-400">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'ADMIN' ? 'bg-slate-gray' : 'bg-peach-soft'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{u.username}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {u.identificationNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role === 'ADMIN' ? <Shield size={12} /> : <Users size={12} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          u.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {u.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {u.active ? 'Activo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleUserStatus(u.id, u.active)}
                            className={`p-2 rounded-lg transition-colors ${
                              u.active
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                            title={u.active ? 'Bloquear acceso' : 'Permitir acceso'}
                          >
                            {u.active ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
