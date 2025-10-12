import { ScraperContext } from './index.js';

// ---------------------- Types ----------------------
export class ScraperExample {
    rule34: ScraperContext;
    e621: ScraperContext;
    e926: ScraperContext;
    tbib: ScraperContext;

    constructor() {
        this.rule34 = new ScraperContext({
            site: "https://rule34.us/",
            query: "index.php?r=posts/index&q=",
            posts: {
                container: ".thumbail-container",
                tag: ["a"],
                attribute: "href",
            },
            thumbnail: {
                container: ".thumbail-container",
                tag: ["img"],
                attribute: "src",
            },
            post: {
                container: ".content_push",
                tag: ["img", "source"],
                attribute: "src",
            },
            pages: {
                container: ".pagination",
                tag: ["a"],
                attribute: "href",
                query: {
                    name: "page",
                    min: 0,
                    max: 235,
                },
            },
        });

        //for e6 and e9, use headers and disable source link redirects (set gotoSourcePage to off)
        this.e621 = new ScraperContext
        ({
            site: "https://e621.net/",
            query: "posts?tags=",
            posts: 
            {
                container: ".posts-container",
                tag: ["a"],
                attribute: "href",
            },  
            thumbnail:
            {
                container:".posts-container",
                tag: ["article"],
                attribute: "data-preview-url"
            },
            post: 
            {
                container: ".posts-container",
                tag: ["article"],
                attribute: "data-file-url",
            },
            pages: 
            {
                container: ".pagination",
                tag: ["a"],
                attribute: "href",
                query: {
                    name: "page",
                    min: 1,
                    max: 100,
                },
            },
        });

        this.e926 = new ScraperContext
        ({
            site: "https://e926.net/",
            query: "posts?tags=",
            posts: 
            {
                container: ".posts-container",
                tag: ["a"],
                attribute: "href",
            },  
            thumbnail:
            {
                container:".posts-container",
                tag: ["article"],
                attribute: "data-preview-url"
            },
            post: 
            {
                container: ".posts-container",
                tag: ["article"],
                attribute: "data-file-url",
            },
            pages: 
            {
                container: ".pagination",
                tag: ["a"],
                attribute: "href",
                query: {
                    name: "page",
                    min: 1,
                    max: 100,
                },
            },
        });
        
        this.tbib = new ScraperContext({
            site: "https://tbib.org/",
            query: "index.php?page=post&s=list&",
            posts: {
                container: ".thumb",
                tag: ["a"],
                attribute: "href",
                queryFix: 'https:'
            },
            thumbnail: {
                container: ".content",
                tag: ["img"],
                attribute: "src",
                queryFix: 'https:'
            },
            post: {
                container: ".content",
                tag: ["img", "source"],
                attribute: "src",
                queryFix: 'https:'
            },
            pages: {
                container: ".pagination",
                tag: ["a"],
                attribute: "href",
                query: {
                    name: "pid",
                    min: 0,
                    max: 10000,
                },
            },
        });
    }
}