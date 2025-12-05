import { Hono } from 'hono';
import { scrapeHome } from '../scrapers/home';

const home = new Hono();

/**
 * GET /api/home
 * Get homepage data with latest series, movies, trending, etc.
 */
home.get('/', async (c) => {
    try {
        const data = await scrapeHome();
        return c.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in /api/home:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch home page data',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

export default home;
