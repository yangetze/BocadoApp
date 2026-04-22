import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import ExchangeRateManager from './ExchangeRateManager';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function SettingsManager() {
  const { user, login } = useAuth(); // Login can be used to update context
  const [activeSubTab, setActiveSubTab] = useState('exchange');

  const [formData, setFormData] = useState({
    defaultCurrency: 'USD',
    companyLogo: '',
    policies: ''
  });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        defaultCurrency: user.defaultCurrency || 'USD',
        companyLogo: user.companyLogo || '',
        policies: user.policies || ''
      });
      setPaymentMethods(user.paymentMethods || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await api.put('/users/profile', formData);
      const currentToken = localStorage.getItem('token');
      login(currentToken, updatedUser);
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al actualizar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentMethods = async () => {
    try {
      setSavingPayment(true);
      const updatedUser = await api.put('/users/profile', { paymentMethods });
      const currentToken = localStorage.getItem('token');
      login(currentToken, updatedUser);
      toast.success('Métodos de pago actualizados correctamente');
    } catch (error) {
      toast.error(error.message || 'Error al actualizar métodos de pago');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleAddPaymentMethod = () => {
    setPaymentMethods(prev => [...prev, { type: 'Transferencia', currency: 'VES', details: {} }]);
  };

  const handleRemovePaymentMethod = (index) => {
    setPaymentMethods(prev => prev.filter((_, i) => i !== index));
  };

  const handlePaymentMethodChange = (index, field, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index] = { ...newMethods[index], [field]: value };
    setPaymentMethods(newMethods);
  };

  const handlePaymentDetailChange = (index, key, value) => {
    const newMethods = [...paymentMethods];
    newMethods[index].details = { ...newMethods[index].details, [key]: value };
    setPaymentMethods(newMethods);
  };

  const handleAddPaymentDetail = (index) => {
    const newMethods = [...paymentMethods];
    if (!newMethods[index].details) newMethods[index].details = {};
    newMethods[index].details['Nuevo Campo'] = '';
    setPaymentMethods(newMethods);
  };

  const handleRemovePaymentDetail = (methodIndex, detailKey) => {
    const newMethods = [...paymentMethods];
    delete newMethods[methodIndex].details[detailKey];
    setPaymentMethods(newMethods);
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[calc(100vh-8rem)] relative">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-gray mb-1 md:mb-2">Configuración del Sistema</h1>
        <p className="text-sm md:text-base text-gray-500">Administra tus preferencias, monedas y tasas de cambio.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100 pb-4">
        <button
          onClick={() => setActiveSubTab('exchange')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeSubTab === 'exchange'
              ? 'bg-slate-gray text-white shadow-sm'
              : 'bg-gray-50 text-slate-gray hover:bg-gray-100'
          }`}
        >
          Tasas de Cambio
        </button>
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeSubTab === 'profile'
              ? 'bg-slate-gray text-white shadow-sm'
              : 'bg-gray-50 text-slate-gray hover:bg-gray-100'
          }`}
        >
          Ajustes de Presupuestos
        </button>
      </div>

      {activeSubTab === 'exchange' && <ExchangeRateManager />}

      {activeSubTab === 'profile' && (
        <>
          <form onSubmit={handleSaveProfile} className="space-y-6 max-w-4xl">
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-slate-gray mb-4">Preferencias Globales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-gray mb-1">Moneda Principal por Defecto</label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={e => setFormData({...formData, defaultCurrency: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-peach-soft"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="VES">VES (Bs.)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Los presupuestos se calcularán en esta moneda por defecto.</p>
                </div>

                <div>
                  <label htmlFor="companyLogo" className="block text-sm font-medium text-slate-gray mb-1">URL Logo de la Empresa</label>
                  <input
                    id="companyLogo"
                    type="url"
                    value={formData.companyLogo}
                    onChange={e => setFormData({...formData, companyLogo: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-peach-soft"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-slate-gray mb-4">Términos y Políticas</h3>
              <label htmlFor="policies" className="block text-sm font-medium text-slate-gray mb-1">Políticas Generales del Presupuesto</label>
              <textarea
                id="policies"
                value={formData.policies}
                onChange={e => setFormData({...formData, policies: e.target.value})}
                rows="4"
                className="w-full border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-peach-soft resize-y"
                placeholder="Escribe aquí los términos de validez, abonos, etc..."
              />
              <p className="text-xs text-gray-500 mt-1">Este texto aparecerá al final de todos tus presupuestos.</p>
            </div>

            <div className="flex justify-end pt-4">
               <button
                  type="submit"
                  disabled={loading}
                  className="bg-slate-gray text-white px-8 py-3 rounded-xl hover:bg-opacity-90 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
               >
                  <Save className="w-5 h-5" />
                  {loading ? 'Guardando...' : 'Guardar'}
               </button>
            </div>
          </form>

          <div className="mt-8 space-y-6 max-w-4xl">
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-gray">Métodos de Pago</h3>
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="flex items-center gap-2 text-sm text-peach-soft bg-peach-soft/10 px-3 py-1.5 rounded-lg hover:bg-peach-soft/20 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Agregar Método
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No has configurado métodos de pago.</p>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 relative">
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentMethod(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                        aria-label="Eliminar método de pago">
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-2 gap-4 mb-4 pr-8">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tipo de Pago</label>
                          <input
                            type="text"
                            value={method.type}
                            onChange={(e) => handlePaymentMethodChange(index, 'type', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                            placeholder="Ej. Pago Móvil"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Moneda</label>
                          <select
                            value={method.currency}
                            onChange={(e) => handlePaymentMethodChange(index, 'currency', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white"
                          >
                            <option value="VES">VES</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-slate-gray">Detalles (Clave - Valor)</span>
                          <button type="button" onClick={() => handleAddPaymentDetail(index)} className="text-xs text-blue-500 hover:underline">
                            + Añadir campo
                          </button>
                        </div>

                        {Object.entries(method.details || {}).map(([key, value], detailIndex) => (
                          <div key={detailIndex} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              defaultValue={key}
                              onBlur={(e) => {
                                const newKey = e.target.value;
                                if (newKey !== key) {
                                  const newMethods = [...paymentMethods];
                                  const details = newMethods[index].details;
                                  details[newKey] = details[key];
                                  delete details[key];
                                  setPaymentMethods(newMethods);
                                }
                              }}
                              className="w-1/3 border border-gray-200 rounded text-xs px-2 py-1"
                              placeholder="Clave"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handlePaymentDetailChange(index, key, e.target.value)}
                              className="flex-1 border border-gray-200 rounded text-xs px-2 py-1"
                              placeholder="Valor"
                            />
                            <button type="button" onClick={() => handleRemovePaymentDetail(index, key)} className="text-gray-400 hover:text-red-500 px-1" aria-label="Eliminar detalle">
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-4">
                 <button
                    type="button"
                    onClick={handleSavePaymentMethods}
                    disabled={savingPayment}
                    className="bg-slate-gray text-white px-8 py-3 rounded-xl hover:bg-opacity-90 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                 >
                    <Save className="w-5 h-5" />
                    {savingPayment ? 'Guardando...' : 'Guardar'}
                 </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}