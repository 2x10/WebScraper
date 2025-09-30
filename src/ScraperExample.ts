import { ScraperContext } from './index.js';

// ---------------------- Types ----------------------
export class ScraperExample {
    rule34: ScraperContext;

    constructor(tags: string, amount: number = 1) {
        this.rule34 = new ScraperContext({
            site: "https://rule34.us",
            query: "index.php?r=posts/index&q",
            tags: tags,
            amount: amount,
            posts: {
                container: ".thumbail-container",
                tag: ["a"],
                attribute: "href",
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
    }
}