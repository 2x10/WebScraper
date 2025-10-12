// Types for individual HTML sections
interface HTMLSection {
    container: string;
    tag: string[]; 
    attribute: string;
    queryFix? : string;
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
    thumbnail: HTMLSection;
    post: HTMLSection;
    pages: PagesSection;
}

// Constructor parameter type
interface ScraperContextParams {
    site: string;
    query: string;
    posts: HTMLSection;
    thumbnail: HTMLSection
    post: HTMLSection;
    pages: PagesSection;
}

export class ScraperContext {
    site: string;
    query: string;
    html: HTMLStructure;

    constructor({ site, query, posts, thumbnail, post, pages }: ScraperContextParams) {
        this.site = site;
        this.query = query;

        // Use object spread to copy HTML sections
        this.html = {
            posts: { ...posts },
            thumbnail: { ...thumbnail },
            post: { ...post },
            pages: { ...pages, query: { ...pages.query } },
        };
    }
}