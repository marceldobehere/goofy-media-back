export const webCacheMiddleware = (req, res, next) => {
    res.webCache = {};

    res.webCache.forever = () => {
        // 31557600 = 365.25 days
        res.setHeader("Cache-Control", "public, max-age=31557600");
    };
    res.webCache.mini = () => {
        // 300 = 5 minutes
        res.setHeader("Cache-Control", "public, max-age=300");
    };
    res.webCache.short = () => {
        // 1800 = 30 minutes
        res.setHeader("Cache-Control", "public, max-age=1800");
    };
    res.webCache.medium = () => {
        // 43200 = 12 hours
        res.setHeader("Cache-Control", "public, max-age=43200");
    };
    res.webCache.long = () => {
        // 604800 = 7 days
        res.setHeader("Cache-Control", "public, max-age=604800");
    };
    res.webCache.noStore = () => {
        res.setHeader("Cache-Control", "no-store");
    };

    // console.log(" > WebCache Middleware: ", res.webCache);
    next();
};