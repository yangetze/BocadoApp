import { DraggableItem } from './DraggableItem';
import { Search } from 'lucide-react';

import PropTypes from 'prop-types';
import React, { useState, useMemo } from 'react';
import { normalizeString } from '../../utils/stringUtils';

// ⚡ Bolt: Wrapped Palette in React.memo. Since the available items list rarely changes
// while building, this prevents the entire palette list from re-rendering on every drag frame.
export const Palette = React.memo(function Palette({ items, title, description, onAdd }) {
  const [searchQuery, setSearchQuery] = useState('');

  // ⚡ Bolt: Memoized the filtered list and moved the search query normalization
  // outside of the filter loop. This replaces an O(n) redundant regex operation
  // with an O(1) operation, and prevents unnecessary re-calculations on re-renders.
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;

    const normalizedSearchQuery = normalizeString(searchQuery);
    return items.filter((item) => {
      const normalizedItemName = normalizeString(item.name);
      return normalizedItemName.includes(normalizedSearchQuery);
    });
  }, [items, searchQuery]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm h-full lg:h-[calc(100vh-8rem)] lg:sticky lg:top-24 flex flex-col border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-gray mb-1 flex items-center gap-2">
          {title}
        </h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="relative mb-6 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-peach-soft transition-colors" size={18} />
        <input
          type="text"
          placeholder="Buscar elementos..."
          aria-label="Buscar elementos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:border-peach-soft focus:bg-white focus:ring-4 focus:ring-peach-soft/10 outline-none transition-all placeholder:text-gray-400 text-slate-gray"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">
              {searchQuery ? 'No se encontraron resultados.' : 'No hay elementos disponibles.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <DraggableItem key={`palette-${item.id}`} id={item.id} item={item} onAdd={onAdd} />
          ))
        )}
      </div>
    </div>
  );
});

Palette.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onAdd: PropTypes.func,
};
