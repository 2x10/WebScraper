import { ScrapeFast, ScraperExample } from './dist/index.js';
import { performance } from "perf_hooks";


async function Run() {
    const context = new ScraperExample("", 100).rule34

    const start = performance.now();
    const response = await ScrapeFast(context)
    const jsonResponse = JSON.stringify(response, null, 2)
    const end = performance.now();
    console.log(`API Response : \n${jsonResponse}\n------------------------------------------------------\n'ScrapeFast' took ${(end - start).toFixed(2)} ms`)
}

Run();