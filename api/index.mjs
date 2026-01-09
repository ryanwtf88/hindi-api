import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { swaggerUI } from '@hono/swagger-ui';

// Import routes
import home from '../src/routes/home.js';
import search from '../src/routes/search.js';
import anime from '../src/routes/anime.js';
import episode from '../src/routes/episode.js';
import category from '../src/routes/category.js';
import stream from '../src/routes/stream.js';
import az from '../src/routes/az.js';
import genre from '../src/routes/genre.js';
import crawl from '../src/routes/crawl.js';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', prettyJSON());

// OpenAPI specification
const openApiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'WatchAnimeWorld API',
        version: '1.0.0',
        description: 'A comprehensive RESTful API for scraping anime content from watchanimeworld.in',
    },
    servers: [
        {
            url: 'https://hindi-anime-api.vercel.app',
            description: 'Vercel server',
        },
    ],
    paths: {
        '/api/home': {
            get: {
                summary: 'Get homepage data',
                description: 'Returns latest series, movies, trending, popular, and featured content',
                tags: ['Home'],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                latestSeries: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                                                latestMovies: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                                                trending: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                                                popular: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                                                featured: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/search': {
            get: {
                summary: 'Search anime',
                description: 'Search for anime by keyword with pagination',
                tags: ['Search'],
                parameters: [
                    {
                        name: 'keyword',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Search keyword',
                    },
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/SearchResult' },
                            },
                        },
                    },
                },
            },
        },
        '/api/anime/{id}': {
            get: {
                summary: 'Get anime details',
                description: 'Get detailed information about a specific anime/series',
                tags: ['Anime'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Anime ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/AnimeDetails' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/episode/{id}': {
            get: {
                summary: 'Get episode details',
                description: 'Get streaming sources and download links for an episode',
                tags: ['Episode'],
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Episode ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: { $ref: '#/components/schemas/EpisodeDetails' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/category/anime': {
            get: {
                summary: 'Get anime category',
                description: 'Browse anime category with pagination',
                tags: ['Category'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/category/cartoon': {
            get: {
                summary: 'Get cartoon category',
                description: 'Browse cartoon category with pagination',
                tags: ['Category'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/category/movies': {
            get: {
                summary: 'Get movies',
                description: 'Browse movies with pagination',
                tags: ['Category'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/category/series': {
            get: {
                summary: 'Get series',
                description: 'Browse series with pagination',
                tags: ['Category'],
                parameters: [
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/category/language/{lang}': {
            get: {
                summary: 'Filter by language',
                description: 'Get anime filtered by language (hindi, tamil, telugu, english)',
                tags: ['Category'],
                parameters: [
                    {
                        name: 'lang',
                        in: 'path',
                        required: true,
                        schema: { type: 'string', enum: ['hindi', 'tamil', 'telugu', 'english'] },
                        description: 'Language',
                    },
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/stream/{episodeId}': {
            get: {
                summary: 'Get stream data',
                description: 'Get stream URL and metadata for an episode',
                tags: ['Stream'],
                parameters: [
                    {
                        name: 'episodeId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Episode ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/StreamData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/stream/embed/{episodeId}': {
            get: {
                summary: 'Get embed player',
                description: 'Get optimized embed player HTML with HLS.js support',
                tags: ['Stream'],
                parameters: [
                    {
                        name: 'episodeId',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Episode ID',
                    },
                ],
                responses: {
                    '200': {
                        description: 'HTML player',
                        content: {
                            'text/html': {
                                schema: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        '/api/az/{letter}': {
            get: {
                summary: 'Get A-Z content',
                description: 'Get series starting with a specific letter',
                tags: ['AZ'],
                parameters: [
                    {
                        name: 'letter',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Letter (A-Z, 0-9)',
                    },
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/genre/{genre}': {
            get: {
                summary: 'Get content by genre',
                tags: ['Genre'],
                parameters: [
                    {
                        name: 'genre',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                        description: 'Genre name',
                    },
                    {
                        name: 'page',
                        in: 'query',
                        required: false,
                        schema: { type: 'integer', default: 1 },
                        description: 'Page number',
                    },
                ],
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CategoryData' },
                            },
                        },
                    },
                },
            },
        },
        '/api/crawl/start': {
            post: {
                summary: 'Start crawler',
                tags: ['Crawler'],
                responses: {
                    '200': {
                        description: 'Crawler started',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        status: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/crawl/stop': {
            post: {
                summary: 'Stop crawler',
                tags: ['Crawler'],
                responses: {
                    '200': {
                        description: 'Crawler stopped',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        message: { type: 'string' },
                                        status: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        '/api/crawl/status': {
            get: {
                summary: 'Get crawler status',
                tags: ['Crawler'],
                responses: {
                    '200': {
                        description: 'Crawler status',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        status: { type: 'object' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    components: {
        schemas: {
            AnimeInfo: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    poster: { type: 'string' },
                    url: { type: 'string' },
                    type: { type: 'string', enum: ['series', 'movie'] },
                    language: { type: 'array', items: { type: 'string' } },
                    year: { type: 'string' },
                },
            },
            AnimeDetails: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    poster: { type: 'string' },
                    url: { type: 'string' },
                    type: { type: 'string', enum: ['series', 'movie'] },
                    language: { type: 'array', items: { type: 'string' } },
                    year: { type: 'string' },
                    status: { type: 'string' },
                    genre: { type: 'array', items: { type: 'string' } },
                    description: { type: 'string' },
                    episodes: { type: 'array', items: { type: 'object' } },
                },
            },
            EpisodeDetails: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    episodeNumber: { type: 'string' },
                    sources: { type: 'array', items: { type: 'object' } },
                    downloads: { type: 'array', items: { type: 'object' } },
                },
            },
            SearchResult: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                    pagination: {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            hasNext: { type: 'boolean' },
                            hasPrev: { type: 'boolean' },
                        },
                    },
                },
            },
            SearchSuggestion: {
                type: 'object',
                properties: {
                    title: { type: 'string' },
                    url: { type: 'string' },
                },
            },
            CategoryData: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/AnimeInfo' } },
                    pagination: {
                        type: 'object',
                        properties: {
                            currentPage: { type: 'integer' },
                            totalPages: { type: 'integer' },
                            hasNext: { type: 'boolean' },
                            hasPrev: { type: 'boolean' },
                        },
                    },
                },
            },
            StreamData: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    streamUrl: { type: 'string' },
                    poster: { type: 'string' },
                    title: { type: 'string' },
                    subtitles: { type: 'array', items: { type: 'object' } },
                },
            },
        },
    },
};

// API routes
app.route('/api/home', home);
app.route('/api/search', search);
app.route('/api/anime', anime);
app.route('/api/episode', episode);
app.route('/api/category', category);
app.route('/api/stream', stream);
app.route('/api/az', az);
app.route('/api/genre', genre);
app.route('/api/crawl', crawl);

// Swagger UI
app.get('/docs', swaggerUI({ spec: openApiSpec }));

// Health check endpoint
app.get('/health', (c) => {
    return c.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        environment: 'vercel',
    });
});

// Root endpoint
app.get('/', (c) => {
    return c.json({
        success: true,
        message: 'WatchAnimeWorld API - Vercel Serverless',
        version: '1.0.0',
        documentation: '/docs',
        health: '/health',
    });
});

// Export for Vercel
export default app;