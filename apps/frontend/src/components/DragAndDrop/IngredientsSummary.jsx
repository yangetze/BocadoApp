import PropTypes from 'prop-types';

export function IngredientsSummary({ totals }) {
  if (!totals || totals.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
      <h3 className="text-xl font-bold text-slate-gray mb-4">Totales de Ingredientes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 text-sm">
              <th className="pb-3 font-medium">Ingrediente</th>
              <th className="pb-3 font-medium text-right">Cantidad Total</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {totals.map((total, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0">
                <td className="py-3 text-slate-gray font-medium">{total.name}</td>
                <td className="py-3 text-slate-gray text-right">
                  {total.totalQuantity.toLocaleString('es-VE', { maximumFractionDigits: 2 })} {total.measurementUnit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

IngredientsSummary.propTypes = {
  totals: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      totalQuantity: PropTypes.number.isRequired,
      measurementUnit: PropTypes.string.isRequired,
    })
  ).isRequired,
};
