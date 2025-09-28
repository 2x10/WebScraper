# A simple webscraping API for images and videos for image board sites

Example initiation: 
```
const context = new ScraperContext
({
    site: "https://example.org",
    query: "index?q=",
    tags: usrTags,
	amount: usrAmount,
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