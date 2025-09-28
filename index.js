const fetch = require("node-fetch");
const cheerio = require("cheerio");

class ScraperContext { constructor ({site, query, tags, amount, posts, post, pages})  
{
    this.site = site;
    this.query = query;
    this.tags = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
        .join(" ");
    this.amount = amount
    this.html = 
    {
        posts: 
        {
            container: posts.container,
            tag: posts.tag,
            attribute: posts.attribute,
        },  
        post: 
        {
          container: post.container,
          tag: post.tag,
          attribute: post.attribute,
        },
        pages: 
        {
            container: pages.container,
            tag: pages.tag,
            attribute: pages.attribute,
            query: 
            {
                name: pages.query.name,
                min: pages.query.min,
                max: pages.query.max,
            }
        }
    }
}}

async function fetchLinks(url, context, baseUrl) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                          "(KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
    });
    //const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    var links = [];
    for (var i = 0; i < context.tag.length; i++)
    {
        $(`${context.container} ${context.tag[i]}`).each((_, element) => {
            var attribute = $(element).attr(context.attribute);
            attribute = fixUrl(attribute, baseUrl)
            if (attribute) links.push(attribute);
        });
    }   

    links = links.filter(links => !links.endsWith("svg"));

    return links;
}

function randomPageURL(url, pageLinks, context)
{
    const REGEX = new RegExp(`${context.name}=(\\d+)`);

    var pageNumbers = [
        context.min, ...pageLinks.map(item => {
            const match = item.match(REGEX);
            return match ? parseInt(match[1], 10) : 0;
        })
    ];

    const lastPage = Math.min(Math.max(...pageNumbers), context.max);
    const randomPage = Math.floor(Math.random() * (lastPage - context.min + 1)) + context.min

    return `${url}&${context.name}=${randomPage}`
}

function generateAPI(status, exitCode, urlContent, message)
{
    return API = 
    {
        status: status,
        code: exitCode,
        content: urlContent,
        message: message
    }
}

function fixUrl(link, base) {
    try
    {
        if (!link.startsWith("https")) {
            return base + link;
        }
        return link;
    }
    catch(_)
    {
        return link;
    }
}

async function Scrape(context)
{
    try 
    {
        const url = `${context.site}/${context.query}=${encodeURIComponent(context.tags)}`;
        const pageLinks = await fetchLinks(url, context.html.pages);
        const pageUrl = randomPageURL(url, pageLinks, context.html.pages.query)

        var content = []
        if (!context.amount) amount = 1
        for (var i = 0; i < context.amount; i++)
        {
            const postLinks = await fetchLinks(pageUrl, context.html.posts, context.site);
            if (postLinks.length == 0) return generateAPI("no_content", 204, content, "No content found")

            const selectedPost = postLinks[Math.floor(Math.random() * postLinks.length)];

            const imageLinks = await fetchLinks(selectedPost, context.html.post);

            content.push(imageLinks[imageLinks.length-1])
        }
        return generateAPI("success", 200, content, "The content has been delivered.")
    }
    catch (err)
    {
        console.log(err)
        return generateAPI("error", 500, [], "Internal error")
    }
}

module.exports = { ScraperContext, Scrape };