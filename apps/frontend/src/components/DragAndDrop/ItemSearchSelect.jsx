import React, { useState, useMemo, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Search, X, Plus } from "lucide-react";
import { normalizeString } from "../../utils/stringUtils";

export const ItemSearchSelect = React.memo(function ItemSearchSelect({
  items,
  onAdd,
  placeholder = "Buscar elemento para agregar...",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const normalizedItems = useMemo(() => {
    if (!items) return [];
    return items.map((item) => ({
      ...item,
      _normalizedName: normalizeString(item.name),
    }));
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return normalizedItems.slice(0, 50); // Show max 50 items initially

    const normalizedSearchQuery = normalizeString(searchQuery);
    return normalizedItems.filter((item) =>
      item._normalizedName.includes(normalizedSearchQuery)
    ).slice(0, 50);
  }, [normalizedItems, searchQuery]);

  const handleSelect = (item) => {
    onAdd(item);
    setSearchQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mb-6 z-20" ref={wrapperRef}>
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-peach-soft transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder={placeholder}
          aria-label="Buscar elementos"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:border-peach-soft focus:ring-4 focus:ring-peach-soft/10 outline-none transition-all placeholder:text-gray-400 text-slate-gray font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setIsOpen(true);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-1 rounded-full"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-h-[400px] flex flex-col z-50">
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-500 flex flex-col items-center justify-center">
                <Search className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm font-medium">
                  {searchQuery
                    ? "No se encontraron resultados."
                    : "No hay elementos disponibles."}
                </p>
                {searchQuery && (
                  <p className="text-xs text-gray-400 mt-1">
                    Prueba buscando con diferentes términos.
                  </p>
                )}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={`search-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="p-3 bg-white border border-transparent rounded-xl hover:bg-peach-soft/5 hover:border-peach-soft/20 cursor-pointer flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="w-10 h-10 rounded-lg bg-peach-soft/10 text-peach-soft flex items-center justify-center font-bold text-lg flex-shrink-0 group-hover:bg-peach-soft group-hover:text-white transition-colors">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium text-slate-gray truncate group-hover:text-peach-soft transition-colors">{item.name}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {item.globalPrice !== undefined
                          ? `${item.brand ? item.brand + " • " : ""}${item.unitQuantity || ""} ${item.measurementUnit || ""}`.trim() ||
                            `Ingrediente (${item.measurementUnit})`
                          : item.type === "baseRecipe"
                            ? "Receta Base"
                            : "Súper Receta"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.globalPrice !== undefined && (
                      <p className="text-sm font-bold text-slate-gray">
                        $ {item.globalPrice.toFixed(2)}
                      </p>
                    )}
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-peach-soft group-hover:text-white transition-colors">
                      <Plus size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
});

ItemSearchSelect.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
