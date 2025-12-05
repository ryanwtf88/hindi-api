import { Hono } from 'hono';
import { searchAnime, getSearchSuggestions } from '../scrapers/search';

const search = new Hono();

/**
 * GET /api/search?keyword={query}&page={page}
 * Search for anime by keyword
 */
search.get('/', async (c) => {
    try {
        const keyword = c.req.query('keyword');
        const page = parseInt(c.req.query('page') || '1');

        if (!keyword) {
            return c.json({
                success: false,
                error: 'Missing keyword parameter',
            }, 400);
        }

        const data = await searchAnime(keyword, page);
        return c.json(data);
    } catch (error) {
        console.error('Error in /api/search:', error);
        return c.json({
            success: false,
            error: 'Failed to search anime',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

/**
 * GET /api/search/suggestions?keyword={query}
 * Get search suggestions for autocomplete
 */
search.get('/suggestions', async (c) => {
    try {
        const keyword = c.req.query('keyword');

        if (!keyword) {
            return c.json({
                success: false,
                error: 'Missing keyword parameter',
            }, 400);
        }

        const suggestions = await getSearchSuggestions(keyword);
        return c.json({
            success: true,
            suggestions,
        });
    } catch (error) {
        console.error('Error in /api/search/suggestions:', error);
        return c.json({
            success: false,
            error: 'Failed to get search suggestions',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

export default search;
