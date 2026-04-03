import { getCurrencies, createOrUpdateManualRate } from './src/controllers/exchangeRateController.js';
import prismaClient from './src/prisma.js';

const mockReq = {};
const mockRes = {
    status: function() { return this; },
    json: function() { return this; }
};

async function runBenchmark(iterations = 100) {
    console.log(`Starting benchmark for ${iterations} iterations...`);

    // Warmup
    for (let i = 0; i < 5; i++) {
        await getCurrencies(mockReq, mockRes);
    }

    const start = process.hrtime.bigint();

    for (let i = 0; i < iterations; i++) {
        await getCurrencies(mockReq, mockRes);
    }

    const end = process.hrtime.bigint();
    const timeTakenMs = Number(end - start) / 1_000_000;
    const avgTimeMs = timeTakenMs / iterations;

    console.log(`Total time: ${timeTakenMs.toFixed(2)} ms`);
    console.log(`Average time per request: ${avgTimeMs.toFixed(2)} ms`);

    return {
        totalMs: timeTakenMs,
        avgMs: avgTimeMs
    };
}

runBenchmark().then(() => {
    // Need to disconnect prisma after running
    prismaClient.default ? prismaClient.default.$disconnect() : prismaClient.$disconnect();
    process.exit(0);
}).catch(console.error);
