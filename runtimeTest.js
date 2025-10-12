import { ScrapeFast, ScraperExample, ScraperSettings, ScraperContext } from './dist/index.js';
import { performance } from "perf_hooks";

const settings = new ScraperSettings 
({
    fetchThumbnails: true,
    fetchImageURLs: true,
    gotoSourcePage: true,
    useHeaders: true, 
    tags: "",
    amount: 70
});


//const context = new ScraperExample().tbib
const context = new ScraperExample().rule34
//const context = new ScraperExample().e621
//const context = new ScraperExample().e926

async function Run() 
{
    const start = performance.now();
    const response = await ScrapeFast(context, settings)
    const jsonResponse = JSON.stringify(response, null, 2)
    const end = performance.now();
    console.log(`API Response : \n${jsonResponse}\n------------------------------------------------------\n'ScrapeFast' took ${(end - start).toFixed(2)} ms`)
}

Run();