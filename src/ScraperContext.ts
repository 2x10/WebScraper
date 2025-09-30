// Types for individual HTML sections
interface HTMLSection {
    container: string;
    tag: string[]; 
    attribute: string;
}

interface PagesSection extends HTMLSection {
    query: {
        name: string;
        min: number;
        max: number;
    };
}

interface HTMLStructure {
    posts: HTMLSection;
    post: HTMLSection;
    pages: PagesSection;
}

// Constructor parameter type
interface ScraperContextParams {
    site: string;
    query: string;
    tags: string;
    amount: number;
    posts: HTMLSection;
    post: HTMLSection;
    pages: PagesSection;
}

export class ScraperContext {
    site: string;
    query: string;
    tags: string;
    amount: number;
    html: HTMLStructure;

    constructor({ site, query, tags, amount, posts, post, pages }: ScraperContextParams) {
        this.site = site;
        this.query = query;
        this.amount = amount;

        // Clean up and join tags
        // This is optional though, it can also run just fine when doing "tag tag tag" but some user may go for "tag, tag,tag   ,  tag" 
        this.tags = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .join(' ');

        // Use object spread to copy HTML sections
        this.html = {
            posts: { ...posts },
            post: { ...post },
            pages: { ...pages, query: { ...pages.query } },
        };
    }
}