import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ExchangeRateManager from './components/ExchangeRateManager';

function App() {
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

      {/* Simple Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-peach-soft flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-gray">BocadoApp</span>
        </div>
      </header>

      <main>
        <ExchangeRateManager />
      </main>
    </div>
  );
}

export default App;
