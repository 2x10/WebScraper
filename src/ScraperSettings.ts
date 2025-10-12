// Constructor parameter types
interface ScraperSettingsParams {
    fetchThumbnails: boolean;
    fetchImageURLs: boolean;
    gotoSourcePage: boolean;
    useHeaders: boolean;
    tags: string; 
    amount: number;
}

export class ScraperSettings {
    fetchThumbnails: boolean;
    fetchImageURLs: boolean;
    gotoSourcePage: boolean;
    useHeaders: boolean;
    tags: string;
    amount: number;

    constructor({ fetchThumbnails, fetchImageURLs, gotoSourcePage, useHeaders, tags, amount }: ScraperSettingsParams) {
        this.fetchThumbnails = fetchThumbnails ?? true;
        this.fetchImageURLs = fetchImageURLs ?? true;
        this.gotoSourcePage = gotoSourcePage ?? true; 
        this.useHeaders = useHeaders ?? true;
        this.tags = tags ?? ''
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .join(' ');
        this.amount = amount ?? 1;
    }
}