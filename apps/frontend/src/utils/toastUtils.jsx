import React from 'react';
import toast from 'react-hot-toast';

export const confirmDelete = (message, onConfirm) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p id="confirm-delete-title" className="text-sm font-medium text-slate-gray">
              Confirmación
            </p>
            <p id="confirm-delete-desc" className="mt-1 text-sm text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Confirmar eliminación"
        >
          Eliminar
        </button>
      </div>
      <div className="flex border-l border-gray-200">
         <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Cancelar eliminación"
        >
          Cancelar
        </button>
      </div>
    </div>
  ), { duration: Infinity });
};
