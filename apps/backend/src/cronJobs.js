import cron from 'node-cron';
import { fetchAndStoreApiRate } from './controllers/exchangeRateController.js';

export const setupCronJobs = () => {
    // Run every day at 00:01 in America/Caracas timezone
    cron.schedule('1 0 * * *', async () => {
        try {
            // Mock req and res for the controller
            await fetchAndStoreApiRate({ body: { type: 'bcv' } }, null);
        } catch (error) {
            console.error('[CRON] Failed to synchronize exchange rate:', error);
        }
    }, {
        scheduled: true,
        timezone: "America/Caracas"
    });
};