import { fetchHtml } from '../utils/http';
import { loadHtml, cleanText, normalizeUrl, extractIdFromUrl, extractPagination } from '../utils/parser';
import { cache, generateCacheKey } from '../utils/cache';
import { config } from '../config';
import type { SearchResult, AnimeInfo, SearchSuggestion } from '../types';

/**
 * Search for anime
 */
export async function searchAnime(keyword: string, page: number = 1): Promise<SearchResult> {
    const cacheKey = generateCacheKey('search', keyword, page);

    // Check cache
    const cached = cache.get<SearchResult>(cacheKey);
    if (cached) {
        return cached;
    }

    const searchUrl = `${config.baseUrl}/?s=${encodeURIComponent(keyword)}&paged=${page}`;
    const html = await fetchHtml(searchUrl);
    const $ = loadHtml(html);

    const results: AnimeInfo[] = [];

    // Extract search results
    $('.items.normal article, .item article, .search-results article, .result article').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        const title = cleanText(link.attr('title') || link.text() || $el.find('h2, h3, .title').text() || '');
        const url = normalizeUrl(link.attr('href') || '');
        const poster = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';

        if (title && url) {
            const id = extractIdFromUrl(url);
            const type = url.includes('/series/') ? 'series' : 'movie';

            // Try to extract year
            const yearMatch = $el.text().match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? yearMatch[0] : undefined;

            results.push({
                id,
                title,
                poster: normalizeUrl(poster),
                url,
                type,
                year,
            });
        }
    });

    // Extract pagination
    const pagination = extractPagination($, page);

    const searchResult: SearchResult = {
        success: true,
        results,
        pagination,
    };

    // Cache the result
    cache.set(cacheKey, searchResult, config.cache.ttl.search);

    return searchResult;
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(keyword: string): Promise<SearchSuggestion[]> {
    if (!keyword || keyword.length < 2) {
        return [];
    }

    const cacheKey = generateCacheKey('suggestions', keyword);

    // Check cache
    const cached = cache.get<SearchSuggestion[]>(cacheKey);
    if (cached) {
        return cached;
    }

    // Use the search endpoint but limit results
    const searchResult = await searchAnime(keyword, 1);

    const suggestions: SearchSuggestion[] = searchResult.results.slice(0, 10).map(anime => ({
        id: anime.id,
        title: anime.title,
        poster: anime.poster,
        url: anime.url,
    }));

    // Cache suggestions
    cache.set(cacheKey, suggestions, config.cache.ttl.search);

    return suggestions;
}
