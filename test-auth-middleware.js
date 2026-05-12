import fs from 'fs';
const content = fs.readFileSync('apps/backend/src/middleware/authMiddleware.js', 'utf8');
console.log(content.includes('prisma.user.findUnique'));
