export class ScraperContext { constructor ({site, query, tags, amount, posts, post, pages})  
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