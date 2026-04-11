import PropTypes from "prop-types";

export function MarginRecommendationCard({ suggestedMargin }) {
  if (suggestedMargin === null) return null;

  return (
    <div className="mb-8 p-6 bg-peach-soft/10 border border-peach-soft/30 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h3 className="font-bold text-slate-gray text-lg">
            Recomendador de Margen (IA)
          </h3>
          <p className="text-slate-gray/80 text-sm">
            Basado en la complejidad de ensamblaje sugerimos un margen del:
          </p>
        </div>
      </div>
      <div className="text-4xl font-black text-peach-soft drop-shadow-sm">
        {suggestedMargin}%
      </div>
    </div>
  );
}

MarginRecommendationCard.propTypes = {
  suggestedMargin: PropTypes.number,
};
