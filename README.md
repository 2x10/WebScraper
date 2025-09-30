# WebScraper.js
A simple webscraping API for images and videos board sites

### Example initiation: 
```js
const { ScraperContext, ScrapeFast } = require("./WebScraper.js")

const context = new ScraperContext
({
    site: "https://example.org",
    query: "index?q=",
    tags: ["aesthetic", "skyscraper"],
	amount: 5,
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

async function Run()
{
    const response = await ScrapeFast(context);
    console.log(response);
}

Run();
```

