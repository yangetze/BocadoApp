const fs = require('fs');

const file = 'docs/ROADMAP.md';

if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');

  // Update drag and drop status
  content = content.replace(
    '| **MVP 2** | Constructor Visual Drag-and-Drop | ⚪ Pendiente | Media | Equipo Frontend |',
    '| **MVP 2** | Constructor Visual Drag-and-Drop | 🟢 Completado | Media | Equipo Frontend |'
  );

  // Update margin status
  content = content.replace(
    '| **MVP 2** | Recomendador Margen Ganancia | ⚪ Pendiente | Baja | Equipo Backend / IA |',
    '| **MVP 2** | Recomendador Margen Ganancia | 🟢 Completado | Baja | Equipo Backend / IA |'
  );

  fs.writeFileSync(file, content);
  console.log('Patched ROADMAP.md');
}
