import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { RefreshCw, Plus, Calendar, Coins, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { exchangeRateApi } from '../api';

export default function ExchangeRateManager() {
  const [rates, setRates] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [savingManual, setSavingManual] = useState(false);

  // Form state
  const [manualRate, setManualRate] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [manualSource, setManualSource] = useState('MANUAL');

  const loadData = async () => {
    try {
      setLoading(true);

      let ratesData = [];
      let currenciesData = [];

      try {
        ratesData = await exchangeRateApi.getRates();
      } catch (err) {
        console.error("Error fetching rates:", err);
        toast.error('Error al cargar las tasas de cambio: ' + (err.message || ''));
      }

      try {
        currenciesData = await exchangeRateApi.getCurrencies();
      } catch (err) {
        console.error("Error fetching currencies:", err);
        toast.error('Error al cargar las monedas: ' + (err.message || ''));
      }

      setRates(ratesData || []);
      setCurrencies(currenciesData || []);

      if (currenciesData && currenciesData.length > 0) {
        // Default to VES if available
        const ves = currenciesData.find(c => c.code === 'VES');
        if (ves) setSelectedCurrency(ves.id);
        else setSelectedCurrency(currenciesData[0].id);
      }

    } catch (error) {
      toast.error('¡Ups! Ocurrió un error inesperado.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncApi = async (type) => {
    try {
      setSyncing(true);
      await exchangeRateApi.syncAutomaticRate(type);
      toast.success(`¡Tasa ${type.toUpperCase()} actualizada con magia! ✨`);
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error al sincronizar la tasa.');
    } finally {
      setSyncing(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualRate || !selectedCurrency) {
      toast.error('Por favor, completa los campos requeridos.');
      return;
    }

    try {
      setSavingManual(true);
      await exchangeRateApi.createOrUpdateManualRate({
        targetCurrencyId: selectedCurrency,
        rate: parseFloat(manualRate),
        effectiveDate: manualDate || undefined,
        source: manualSource
      });
      toast.success('¡Tasa manual guardada correctamente! 🍰');
      setManualRate('');
      setManualDate('');
      setManualSource('MANUAL');
      await loadData();
    } catch {
      toast.error('Ocurrió un error al guardar tu tasa manual.');
    } finally {
      setSavingManual(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSource = (source) => {
    const map = {
      'MANUAL': 'Ingreso Manual ✍️',
      'OFFICIAL': 'Oficial 🏛️',
      'PARALLEL': 'Paralelo 🚀',
      'EURO': 'Euro 💶'
    };
    return map[source] || source;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-soft"></div>
      </div>
    );
  }

  const latestVes = rates.find(r => r.targetCurrency?.code === 'VES');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-gray">Tasas de Cambio</h1>
          <p className="text-slate-gray/70 mt-1">
            Gestiona el valor de la moneda para tus recetas. Moneda base: USD.
          </p>
        </div>

        {latestVes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-peach-soft/10 border border-peach-soft/20 px-6 py-4 rounded-2xl flex items-center gap-4"
          >
            <div className="p-3 bg-white rounded-full text-peach-soft shadow-sm">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-gray/60 font-medium uppercase tracking-wider">Tasa Actual (VES)</p>
              <p className="text-2xl font-bold text-slate-gray">Bs. {latestVes.rate.toFixed(2)}</p>
            </div>
          </motion.div>
        )}
      </div>


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['OFFICIAL', 'PARALLEL', 'EURO', 'MANUAL'].map(source => {
          const rateForSource = rates.find(r => r.source === source && new Date(r.effectiveDate).toDateString() === new Date().toDateString());
          return (
            <motion.div
              key={source}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${rateForSource ? 'bg-white border-peach-soft/30 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}
            >
              <p className="text-xs text-slate-gray/60 font-medium uppercase mb-1">{formatSource(source).replace(/[^a-zA-Z]/g, '')}</p>
              {rateForSource ? (
                <div>
                   <p className="text-xl font-bold text-slate-gray">{rateForSource.targetCurrency?.symbol} {rateForSource.rate.toFixed(2)}</p>
                   <p className="text-[10px] text-slate-gray/50 mt-1">Activa hoy</p>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-gray/40 mt-2">No registrada hoy</p>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* API Sync Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="text-peach-soft w-5 h-5" />
            <h2 className="text-xl font-semibold">Sincronización Automática</h2>
          </div>
          <p className="text-sm text-slate-gray/70 mb-6">
            Obtén la tasa del día con un solo clic. Se conectará a DolarAPI para traerte los datos frescos como pan recién horneado.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleSyncApi('bcv')}
              disabled={syncing}
              className="flex-1 bg-slate-gray text-white py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              Tasa Oficial
            </button>
            <button
              onClick={() => handleSyncApi('paralelo')}
              disabled={syncing}
              className="flex-1 border-2 border-peach-soft text-peach-soft py-3 px-4 rounded-xl hover:bg-peach-soft/10 transition-all font-medium disabled:opacity-50"
            >
              Tasa Paralelo
            </button>
          </div>
        </motion.div>

        {/* Manual Input Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
           <div className="flex items-center gap-3 mb-6">
            <Plus className="text-peach-soft w-5 h-5" />
            <h2 className="text-xl font-semibold">Ingreso Manual</h2>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-slate-gray/70 mb-1 font-medium">Moneda Destino</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-peach-soft focus:bg-peach-soft/5 transition-colors"
                >
                  {currencies.filter(c => !c.isBase).map(c => (
                    <option key={c.id} value={c.id}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-gray/70 mb-1 font-medium">Tasa (ej. 45.2)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  required
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-peach-soft focus:bg-peach-soft/5 transition-colors"
                  placeholder="Monto"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-slate-gray/70 mb-1 font-medium">Origen</label>
                <select
                  value={manualSource}
                  onChange={(e) => setManualSource(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-peach-soft focus:bg-peach-soft/5 transition-colors"
                >
                  <option value="MANUAL">Manual</option>
                  <option value="OFFICIAL">Oficial</option>
                  <option value="PARALLEL">Paralelo</option>
                  <option value="EURO">Euro</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-gray/70 mb-1 font-medium">Fecha Efectiva (Opcional)</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-3.5 text-slate-gray/40" />
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-peach-soft focus:bg-peach-soft/5 transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-gray/50 mt-1">Si dejas vacío, usaremos la fecha de hoy.</p>
            </div>

            <button
              type="submit"
              disabled={savingManual}
              className="w-full bg-slate-gray text-white py-3 px-4 rounded-xl hover:bg-opacity-90 transition-all font-medium disabled:opacity-50"
            >
              {savingManual ? 'Guardando...' : 'Guardar Tasa Manual'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <History className="text-peach-soft w-5 h-5" />
          <h2 className="text-xl font-semibold">Historial de Tasas</h2>
        </div>

        {rates.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-gray/50 font-medium">No hay tasas registradas todavía.</p>
            <p className="text-sm text-slate-gray/40 mt-1">Sincroniza con la API o agrega una manualmente para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-slate-gray/60 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Fecha Efectiva</th>
                  <th className="px-6 py-4 font-medium">Moneda</th>
                  <th className="px-6 py-4 font-medium">Tasa</th>
                  <th className="px-6 py-4 font-medium">Origen</th>
                  <th className="px-6 py-4 font-medium text-right">Última Actualización</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-peach-soft/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{formatDate(rate.effectiveDate)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">
                        {rate.targetCurrency?.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {rate.targetCurrency?.symbol} {rate.rate.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-gray/70">
                      {formatSource(rate.source)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-gray/50 text-right">
                      {new Date(rate.updatedAt).toLocaleString('es-VE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
