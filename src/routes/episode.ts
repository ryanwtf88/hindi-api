import { Hono } from 'hono';
import { scrapeEpisode, getEpisodeServer } from '../scrapers/episode';

const episode = new Hono();

/**
 * GET /api/episode/:id
 * Get episode streaming sources
 */
episode.get('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const data = await scrapeEpisode(id);
        return c.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Error in /api/episode/:id:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch episode details',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

/**
 * GET /api/episode/:id/servers/:serverId
 * Get specific server links for an episode
 */
episode.get('/:id/servers/:serverId', async (c) => {
    try {
        const id = c.req.param('id');
        const serverId = c.req.param('serverId');
        const sources = await getEpisodeServer(id, serverId);
        return c.json({
            success: true,
            sources,
        });
    } catch (error) {
        console.error('Error in /api/episode/:id/servers/:serverId:', error);
        return c.json({
            success: false,
            error: 'Failed to fetch server sources',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

export default episode;
