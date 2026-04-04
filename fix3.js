const fs = require('fs');
const file = 'apps/backend/src/controllers/exchangeRateController.js';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/\\\'Internal server error\\\'/g, "'Internal server error'");
fs.writeFileSync(file, content, 'utf-8');
