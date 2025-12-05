import { fetchHtml } from '../utils/http';
import { loadHtml, cleanText, normalizeUrl, extractIdFromUrl, parseEpisodeNumber } from '../utils/parser';
import { cache, generateCacheKey } from '../utils/cache';
import { config } from '../config';
import type { AnimeDetails, Season, Episode, AnimeInfo } from '../types';

/**
 * Scrape anime/series details
 */
export async function scrapeAnimeDetails(id: string): Promise<AnimeDetails> {
    const cacheKey = generateCacheKey('anime', id);

    // Check cache
    const cached = cache.get<AnimeDetails>(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${config.baseUrl}/series/${id}/`;
    const html = await fetchHtml(url);
    const $ = loadHtml(html);

    // Extract basic info
    const title = cleanText($('h1.title, .single-post h1, article h1').first().text());
    const poster = normalizeUrl($('.poster img, .thumbnail img, article img').first().attr('src') || '');
    const description = cleanText($('.description, .summary, .content p').first().text() || $('.content').first().text());

    // Extract genres
    const genres: string[] = [];
    $('.genres a, .genre a, .sgeneros a, a[rel="tag"]').each((_, el) => {
        const genre = cleanText($(el).text());
        if (genre && !genres.includes(genre)) {
            genres.push(genre);
        }
    });

    // Extract languages
    const languages: string[] = [];
    $('.languages a, .language a, .audio a').each((_, el) => {
        const lang = cleanText($(el).text());
        if (lang && !languages.includes(lang)) {
            languages.push(lang);
        }
    });

    // If no languages found, try to detect from content
    if (languages.length === 0) {
        const contentText = $.text().toLowerCase();
        if (contentText.includes('hindi')) languages.push('Hindi');
        if (contentText.includes('tamil')) languages.push('Tamil');
        if (contentText.includes('telugu')) languages.push('Telugu');
        if (contentText.includes('english')) languages.push('English');
    }

    // Extract rating
    const rating = cleanText($('.rating, .vote_average, .dt_rating_vgs').first().text());

    // Extract status
    const status = cleanText($('.status, .data .status').first().text());

    // Extract episodes/seasons
    const seasons: Season[] = [];
    const episodeMap = new Map<number, Episode[]>();

    // Look for episode lists
    $('.episodes-list li, .episodios li, .se-c .se-a ul li, .episode-item').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        const episodeUrl = normalizeUrl(link.attr('href') || '');
        const episodeTitle = cleanText(link.text() || link.attr('title') || '');
        const thumbnail = normalizeUrl($el.find('img').first().attr('src') || '');

        if (episodeUrl && episodeTitle) {
            const episodeId = extractIdFromUrl(episodeUrl);
            const { season, episode } = parseEpisodeNumber(episodeTitle);

            const episodeInfo: Episode = {
                id: episodeId,
                episodeNumber: episode,
                seasonNumber: season,
                title: episodeTitle,
                thumbnail,
                url: episodeUrl,
            };

            if (!episodeMap.has(season)) {
                episodeMap.set(season, []);
            }
            episodeMap.get(season)!.push(episodeInfo);
        }
    });

    // Convert episode map to seasons array
    episodeMap.forEach((episodes, seasonNumber) => {
        seasons.push({
            seasonNumber,
            episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
        });
    });

    // Sort seasons
    seasons.sort((a, b) => a.seasonNumber - b.seasonNumber);

    // Calculate total episodes
    const totalEpisodes = seasons.reduce((sum, season) => sum + season.episodes.length, 0);

    // Extract related anime
    const related: AnimeInfo[] = [];
    $('.related article, .recommendations article, [class*="related"] article').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        const relatedTitle = cleanText(link.attr('title') || link.text() || '');
        const relatedUrl = normalizeUrl(link.attr('href') || '');
        const relatedPoster = normalizeUrl($el.find('img').first().attr('src') || '');

        if (relatedTitle && relatedUrl) {
            const relatedId = extractIdFromUrl(relatedUrl);
            related.push({
                id: relatedId,
                title: relatedTitle,
                poster: relatedPoster,
                url: relatedUrl,
                type: relatedUrl.includes('/series/') ? 'series' : 'movie',
            });
        }
    });

    const animeDetails: AnimeDetails = {
        id,
        title,
        poster,
        url,
        description,
        genres,
        languages,
        rating: rating || undefined,
        status: status || undefined,
        totalEpisodes,
        seasons: seasons.length > 0 ? seasons : undefined,
        related: related.length > 0 ? related : undefined,
        type: 'series',
    };

    // Cache the result
    cache.set(cacheKey, animeDetails, config.cache.ttl.anime);

    return animeDetails;
}

/**
 * Scrape movie details (similar to anime but for movies)
 */
export async function scrapeMovieDetails(id: string): Promise<AnimeDetails> {
    const cacheKey = generateCacheKey('movie', id);

    // Check cache
    const cached = cache.get<AnimeDetails>(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${config.baseUrl}/movies/${id}/`;
    const html = await fetchHtml(url);
    const $ = loadHtml(html);

    // Extract basic info (similar to series)
    const title = cleanText($('h1.title, .single-post h1, article h1').first().text());
    const poster = normalizeUrl($('.poster img, .thumbnail img, article img').first().attr('src') || '');
    const description = cleanText($('.description, .summary, .content p').first().text() || $('.content').first().text());

    // Extract genres
    const genres: string[] = [];
    $('.genres a, .genre a, .sgeneros a, a[rel="tag"]').each((_, el) => {
        const genre = cleanText($(el).text());
        if (genre && !genres.includes(genre)) {
            genres.push(genre);
        }
    });

    // Extract languages
    const languages: string[] = [];
    $('.languages a, .language a, .audio a').each((_, el) => {
        const lang = cleanText($(el).text());
        if (lang && !languages.includes(lang)) {
            languages.push(lang);
        }
    });

    if (languages.length === 0) {
        const contentText = $.text().toLowerCase();
        if (contentText.includes('hindi')) languages.push('Hindi');
        if (contentText.includes('tamil')) languages.push('Tamil');
        if (contentText.includes('telugu')) languages.push('Telugu');
        if (contentText.includes('english')) languages.push('English');
    }

    const rating = cleanText($('.rating, .vote_average, .dt_rating_vgs').first().text());

    // Extract related movies
    const related: AnimeInfo[] = [];
    $('.related article, .recommendations article, [class*="related"] article').each((_, el) => {
        const $el = $(el);
        const link = $el.find('a').first();
        const relatedTitle = cleanText(link.attr('title') || link.text() || '');
        const relatedUrl = normalizeUrl(link.attr('href') || '');
        const relatedPoster = normalizeUrl($el.find('img').first().attr('src') || '');

        if (relatedTitle && relatedUrl) {
            const relatedId = extractIdFromUrl(relatedUrl);
            related.push({
                id: relatedId,
                title: relatedTitle,
                poster: relatedPoster,
                url: relatedUrl,
                type: relatedUrl.includes('/series/') ? 'series' : 'movie',
            });
        }
    });

    const movieDetails: AnimeDetails = {
        id,
        title,
        poster,
        url,
        description,
        genres,
        languages,
        rating: rating || undefined,
        related: related.length > 0 ? related : undefined,
        type: 'movie',
    };

    // Cache the result
    cache.set(cacheKey, movieDetails, config.cache.ttl.anime);

    return movieDetails;
}
