import * as cheerio from 'cheerio';
import { fetch, Agent } from "undici";

// ---------------------- Types ----------------------
interface HTMLSection {
    container: string;
    tag: string[];
    attribute: string;
    queryFix? : string;
}

interface PagesQuery {
    name: string;
    min: number;
    max: number;
}

interface PagesSection extends HTMLSection {
    query: PagesQuery;
}

interface HTMLStructure {
    posts: HTMLSection;
    thumbnail: HTMLSection;
    post: HTMLSection;
    pages: PagesSection;
}

interface ScrapeContext {
    site: string;
    query: string;
    tags?: string;
    amount?: number;
    html: HTMLStructure;
}

interface ScrapeSettings {
    fetchThumbnails?: boolean;
    fetchImageURLs?: boolean;
    gotoSourcePage?: boolean;
    useHeaders: boolean;
    tags?: string;
    amount?: number;
}

interface ContentItem {
    src: string;
    img: string;
}

// ---------------------- Agent & Cache ----------------------
const pageCache = new Map<string, string>();

const agent = new Agent({
    keepAliveTimeout: 30000,
    keepAliveMaxTimeout: 30000,
    connections: 70,
    pipelining: 1 
});

// ---------------------- Helper Functions ----------------------
async function getHTML(url: string, settings: ScrapeSettings) : Promise<cheerio.CheerioAPI> {
    if (pageCache.has(url)) {
        const loadedHTML = cheerio.load(pageCache.get(url));
        return loadedHTML!;
    }

    let headers = { 'User-Agent': '' , 'Accept': '' }
    if (settings.useHeaders) 
    { 
        headers =
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                          "(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", 
        }
    } 

    const response = await fetch(url, {
        dispatcher: agent,
        headers: headers, 
        bodyTimeout: 30_000, 
        headersTimeout: 30_000 
    } as any);

    const html = await response.text();
    pageCache.set(url, html);

    const loadedHTML = cheerio.load(html);
    return loadedHTML;
}

function fetchLinks(html: cheerio.CheerioAPI, context: HTMLSection, baseUrl?: string): string[] {
    const links: string[] = [];

    const selector = context.tag.map(t => `${context.container} ${t}`).join(", ");
    html(selector).each((_, element) => {
        let attribute = html(element).attr(context.attribute);
        attribute = fixUrl(attribute, baseUrl);
        if (attribute && !attribute.endsWith("svg")) {
            links.push(attribute);
        }
    });

    return links;
}

const regexCache = new Map<string, RegExp>();
function getRegex(name: string): RegExp {
    if (!regexCache.has(name)) {
        regexCache.set(name, new RegExp(`${name}=(\\d+)`));
    }
    return regexCache.get(name)!;
}

function randomPageURL(url: string, pageLinks: string[], context: PagesQuery): string {
    const REGEX = getRegex(context.name);

    const pageNumbers = [
        context.min,
        ...pageLinks.map(item => {
            const match = item.match(REGEX);
            return match ? parseInt(match[1], 10) : 0;
        })
    ];

    const lastPage = Math.min(Math.max(...pageNumbers), context.max);
    const randomPage = Math.floor(Math.random() * (lastPage - context.min + 1)) + context.min;

    return `${url}&${context.name}=${randomPage}`;
}

function generateAPI<T>(status: string, exitCode: number, urlContent: T, message: string) {
    return {
        status,
        code: exitCode,
        content: urlContent,
        message
    };
}

function fixUrl(link: string | undefined, base?: string): string | undefined {
    if (!link) return undefined;
    if (!link.startsWith("https")) {
        return base ? base + link : link;
    }
    return link;
}

function cleanup(content: ContentItem[]): ContentItem[] {
    const filtered = content.filter(Boolean);

    // delete duplicates based on src
    return Array.from(new Map(filtered.map(item => [item.src, item])).values());
}

// ---------------------- Scraper ----------------------
export async function ScrapeFast(context: ScrapeContext, settings: ScrapeSettings) 
{
    try 
    {   
        const URL = `${context.site}${context.query}${encodeURIComponent(settings.tags ?? '')}`;

        const thumbnailQueryFix = context.html.thumbnail.queryFix ?? '';
        const postsQueryFix = context.html.posts.queryFix ?? '';
        const postQueryFix = context.html.post.queryFix ?? '';

        const pageHTML = await getHTML(URL, settings)
        const pageLinks = fetchLinks(pageHTML, context.html.pages);

        const tasks: Promise<ContentItem | null>[] = Array.from({ length: settings.amount ?? 1 }, async () => 
        {
            const pageURL = randomPageURL(URL, pageLinks, context.html.pages.query);
            
            const postHTML = await getHTML(pageURL, settings)
            const postURLs = fetchLinks(postHTML, context.html.posts, context.site);
            if (postURLs.length === 0 ) return null;
            

            const selectedPost = Math.floor(Math.random() * postURLs.length)
            const selectedPostURL = postURLs[selectedPost];

            let selectedThumbnailURL = ''
            if (settings.fetchThumbnails)
            {
                const thumbnailURLs = fetchLinks(postHTML, context.html.thumbnail, thumbnailQueryFix);
                if (postURLs.length != thumbnailURLs.length) return null;
                selectedThumbnailURL = thumbnailURLs[selectedPost].split('?')[0];
            }
            
            let selectedImageURL = ''
            if (settings.fetchImageURLs)
            {
                if (settings.gotoSourcePage == true)
                {
                    const selectedPostHTML = await getHTML(selectedPostURL, settings)
                    selectedImageURL = fetchLinks(selectedPostHTML, context.html.post, postQueryFix).slice(-1)[0].split('?')[0];
                }
                else
                {
                    const selectedImageURLs = fetchLinks(postHTML, context.html.post, postQueryFix)
                    if (selectedImageURLs.length != selectedImageURLs.length) return null
                    selectedImageURL = selectedImageURLs[selectedPost].split('?')[0];
                }
                if (selectedImageURL === undefined) return null
            }

            return { src: selectedPostURL, img: selectedImageURL, thumbnail: selectedThumbnailURL };
        });

        const content = cleanup(await Promise.all(tasks) as ContentItem[]);

        if (content.length === 0) {
            return generateAPI("no_content", 204, content, "No content found");
        }

        return generateAPI("success", 200, content, "The content has been delivered.");
    } 
    catch (err) 
    {
        console.error(err);
        return generateAPI("error", 500, [], "Internal error");
    }
}