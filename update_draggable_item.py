import re

file_path = 'apps/frontend/src/components/DragAndDrop/DraggableItem.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace:
# {item.globalCost !== undefined ? `Ingrediente (${item.measurementUnit})` : item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}
# With:
# {item.globalCost !== undefined ? `${item.brand ? item.brand + ' • ' : ''}${item.unitQuantity || ''} ${item.measurementUnit || ''}`.trim() : item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}

search_str = r"\{item\.globalCost !== undefined \? `Ingrediente \(\$\{item\.measurementUnit\}\)` : item\.type === 'baseRecipe' \? 'Receta Base' : 'Súper Receta'\}"
replace_str = "{item.globalCost !== undefined ? `${item.brand ? item.brand + ' • ' : ''}${item.unitQuantity || ''} ${item.measurementUnit || ''}`.trim() || `Ingrediente (${item.measurementUnit})` : item.type === 'baseRecipe' ? 'Receta Base' : 'Súper Receta'}"

new_content = re.sub(search_str, replace_str, content)

with open(file_path, 'w') as f:
    f.write(new_content)

print("Updated DraggableItem.jsx")
