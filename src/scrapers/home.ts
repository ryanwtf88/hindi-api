import { fetchHtml } from '../utils/http';
import { loadHtml, cleanText, normalizeUrl, extractIdFromUrl } from '../utils/parser';
import { cache, generateCacheKey } from '../utils/cache';
import { config } from '../config';
import type { HomeData, AnimeInfo } from '../types';

/**
 * Scrape home page data
 */
export async function scrapeHome(): Promise<HomeData> {
    const cacheKey = generateCacheKey('home');

    // Check cache
    const cached = cache.get<HomeData>(cacheKey);
    if (cached) {
        return cached;
    }

    const html = await fetchHtml(config.baseUrl);
    const $ = loadHtml(html);

    const homeData: HomeData = {
        latestSeries: [],
        latestMovies: [],
        trending: [],
        popular: [],
        featured: [],
    };

    // Extract all posts/articles
    $('article.post').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        const title = cleanText(link.attr('title') || $el.find('.post-title, h2, h3').text() || '');
        const url = normalizeUrl(link.attr('href') || '');
        const poster = $el.find('img').first().attr('src') || $el.find('img').first().attr('data-src') || '';

        if (title && url) {
            const id = extractIdFromUrl(url);
            const animeInfo: AnimeInfo = {
                id,
                title,
                poster: normalizeUrl(poster),
                url,
            };

            // Determine type based on URL
            if (url.includes('/series/')) {
                animeInfo.type = 'series';
                homeData.latestSeries.push(animeInfo);
            } else if (url.includes('/movie')) {
                animeInfo.type = 'movie';
                homeData.latestMovies.push(animeInfo);
            }

            // Also add to featured for now
            homeData.featured?.push({
                ...animeInfo,
                type: url.includes('/series/') ? 'series' : 'movie',
            });
        }
    });

    // Remove duplicates and limit results
    homeData.latestSeries = removeDuplicates(homeData.latestSeries).slice(0, 20);
    homeData.latestMovies = removeDuplicates(homeData.latestMovies).slice(0, 20);
    homeData.trending = removeDuplicates(homeData.trending || []).slice(0, 10);
    homeData.popular = removeDuplicates(homeData.popular || []).slice(0, 10);
    homeData.featured = removeDuplicates(homeData.featured || []).slice(0, 5);

    // Cache the result
    cache.set(cacheKey, homeData, config.cache.ttl.home);

    return homeData;
}

/**
 * Remove duplicate anime entries by ID
 */
function removeDuplicates(items: AnimeInfo[]): AnimeInfo[] {
    const seen = new Set<string>();
    return items.filter(item => {
        if (seen.has(item.id)) {
            return false;
        }
        seen.add(item.id);
        return true;
    });
}
