const fs = require('fs');
const file = 'apps/backend/src/controllers/exchangeRateController.js';
let content = fs.readFileSync(file, 'utf-8');

const conflictBlock = `<<<<<<< HEAD
  } catch {
=======
  } catch (error) {
>>>>>>> origin/main`;

if (content.includes(conflictBlock)) {
    content = content.replace(conflictBlock, "  } catch (error) {");
    fs.writeFileSync(file, content, 'utf-8');
    console.log('Merge conflict resolved.');
} else {
    console.log('Conflict not found.');
}
