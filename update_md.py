import re

with open('docs/plan_ingredientes_busqueda.md', 'r') as f:
    content = f.read()

content = content.replace('- [ ]', '- [x]')

with open('docs/plan_ingredientes_busqueda.md', 'w') as f:
    f.write(content)
