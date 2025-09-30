import * as cheerio from 'cheerio';
import { fetch, Agent } from "undici";

// ---------------------- Types ----------------------
interface HTMLSection {
    container: string;
    tag: string[];
    attribute: string;
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
    post: HTMLSection;
    pages: PagesSection;
}

interface ScrapeContext {
    site: string;
    query: string;
    tags: string;
    amount?: number;
    html: HTMLStructure;
}

interface ContentItem {
    src: string;
    img: string;
}

// ---------------------- Agent & Cache ----------------------
const pageCache = new Map<string, string>();

const agent = new Agent({
    keepAliveTimeout: 60_000,
    keepAliveMaxTimeout: 60_000,
    connections: 50,
    pipelining: 1 
});

// ---------------------- Helper Functions ----------------------
async function fetchLinks(url: string, context: HTMLSection, baseUrl?: string): Promise<string[]> {
    if (pageCache.has(url)) {
        return parseLinks(pageCache.get(url)!, context, baseUrl);
    }

    const response = await fetch(url, {
        dispatcher: agent,
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                          "(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", 
        }, 
        bodyTimeout: 30_000, 
        headersTimeout: 30_000 
    } as any);

    const html = await response.text();
    pageCache.set(url, html);

    return parseLinks(html, context, baseUrl);
}

function parseLinks(html: string, context: HTMLSection, baseUrl?: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];

    const selector = context.tag.map(t => `${context.container} ${t}`).join(", ");
    $(selector).each((_, element) => {
        let attribute = $(element).attr(context.attribute);
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

// ---------------------- Scrapers ----------------------
export async function ScrapeFast(context: ScrapeContext) {
    try {
        const url = `${context.site}/${context.query}=${encodeURIComponent(context.tags)}`;
        const pageLinks = await fetchLinks(url, context.html.pages);

        const amount = context.amount ?? 1;

        const tasks: Promise<ContentItem | null>[] = Array.from({ length: amount }, async () => {
            const pageUrl = randomPageURL(url, pageLinks, context.html.pages.query);
            const postLinks = await fetchLinks(pageUrl, context.html.posts, context.site);
            if (postLinks.length === 0) return null;

            const selectedPost = postLinks[Math.floor(Math.random() * postLinks.length)];
            const imageLinks = await fetchLinks(selectedPost, context.html.post);

            if (imageLinks.length > 0) {
                return { src: selectedPost, img: imageLinks[imageLinks.length - 1] };
            }
            return null;
        });

        const content = cleanup(await Promise.all(tasks) as ContentItem[]);

        if (content.length === 0) {
            return generateAPI("no_content", 204, content, "No content found");
        }

        return generateAPI("success", 200, content, "The content has been delivered.");
    } catch (err) {
        console.error(err);
        return generateAPI("error", 500, [], "Internal error");
    }
}

export async function ScrapeSerial(context: ScrapeContext) {
    try {
        const url = `${context.site}/${context.query}=${encodeURIComponent(context.tags)}`;
        const pageLinks = await fetchLinks(url, context.html.pages);
        const pageUrl = randomPageURL(url, pageLinks, context.html.pages.query);

        const amount = context.amount ?? 1;
        const rawContent: ContentItem[] = [];

        for (let i = 0; i < amount; i++) {
            const postLinks = await fetchLinks(pageUrl, context.html.posts, context.site);
            if (postLinks.length === 0) {
                return generateAPI("no_content", 204, [], "No content found");
            }

            const selectedPost = postLinks[Math.floor(Math.random() * postLinks.length)];
            const imageLinks = await fetchLinks(selectedPost, context.html.post);

            if (imageLinks.length > 0) {
                rawContent.push({ src: selectedPost, img: imageLinks[imageLinks.length - 1] });
            }
        }

        const content = cleanup(rawContent);

        return generateAPI("success", 200, content, "The content has been delivered.");
    } catch (err) {
        console.error(err);
        return generateAPI("error", 500, [], "Internal error");
    }
}
