import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

export function MobilePaletteModal({ isOpen, onClose, children }) {

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative bg-white w-full h-[85vh] sm:h-auto sm:max-h-[85vh] sm:rounded-2xl rounded-t-3xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10 sticky top-0">
              <h3 className="font-bold text-slate-gray text-lg">Agregar Elemento</h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-slate-gray hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* The palette children will have their own scrolling area if needed, or we can wrap it here */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

MobilePaletteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};
