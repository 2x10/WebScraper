import { ScrapeFast, ScraperExample } from './src/index.js';

async function Run() {
    const context = new ScraperExample("scat", "50").rule34
    const response = await ScrapeFast(context)

    const media = []

    if (response.code === 200) 
    {
        for (const item of response.content) 
        {
            media.push(item)
        }
        console.log(media)
        return media
    } 
    else 
    {
        return undefined
    }
}

Run();