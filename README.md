# WebScraper.js
A simple webscraping API for images and videos for image board sites

### Example code: 
```js
const { ScraperContext } = require("./WebScraper.js")

const context = new ScraperContext
({
    site: "https://example.org",
    query: "index?q=",
    tags: ["aesthetic", "skyscraper"],
	amount: 1,
    posts: 
    {
        container: ".thumbail-container",
        tag: ["a"],
        attribute: "href",
    },  
    post: 
    {
        container: ".content",
        tag: ["img", "source"],
        attribute: "src",
    },
    pages: 
    {
        container: ".paginator",
        tag: ["a"],
        attribute: "href",
        query: {
            name: "page",
            min: 0,
            max: 100,
        },
    },
});
```