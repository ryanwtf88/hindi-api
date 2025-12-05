import { fetchHtml, httpClient } from '../utils/http';
import { loadHtml, normalizeUrl, getVideoType } from '../utils/parser';
import { cache, generateCacheKey } from '../utils/cache';
import { config } from '../config';
import type { StreamData } from '../types';

/**
 * Extract stream URL from iframe embed
 */
export async function extractStreamUrl(iframeUrl: string): Promise<string | null> {
    try {
        const html = await fetchHtml(iframeUrl);
        const $ = loadHtml(html);

        // Look for m3u8 URLs in the HTML
        const scriptTags = $('script').toArray();

        for (const script of scriptTags) {
            const scriptContent = $(script).html() || '';

            // Look for m3u8 URLs
            const m3u8Match = scriptContent.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/);
            if (m3u8Match) {
                return m3u8Match[1];
            }

            // Look for mp4 URLs
            const mp4Match = scriptContent.match(/(https?:\/\/[^\s"']+\.mp4[^\s"']*)/);
            if (mp4Match) {
                return mp4Match[1];
            }

            // Look for file: or source: properties
            const fileMatch = scriptContent.match(/["']?(?:file|source|src)["']?\s*:\s*["']([^"']+)["']/);
            if (fileMatch) {
                const url = fileMatch[1];
                if (url.startsWith('http')) {
                    return url;
                }
            }
        }

        // Look for video tags
        const videoSrc = $('video source').first().attr('src') || $('video').first().attr('src');
        if (videoSrc) {
            return normalizeUrl(videoSrc);
        }

        // Look for iframes (nested)
        const nestedIframe = $('iframe').first().attr('src');
        if (nestedIframe && nestedIframe !== iframeUrl) {
            // Recursively extract from nested iframe
            return await extractStreamUrl(normalizeUrl(nestedIframe));
        }

        return null;
    } catch (error) {
        console.error('Error extracting stream URL:', error);
        return null;
    }
}

/**
 * Get stream data for an episode
 */
export async function getStreamData(episodeId: string): Promise<StreamData> {
    const cacheKey = generateCacheKey('stream', episodeId);

    // Check cache
    const cached = cache.get<StreamData>(cacheKey);
    if (cached) {
        return cached;
    }

    // Import episode scraper
    const { scrapeEpisode } = await import('./episode');

    // Get episode details
    const episode = await scrapeEpisode(episodeId);

    if (!episode.sources || episode.sources.length === 0) {
        return {
            success: false,
            streamUrl: '',
            type: 'none',
        };
    }

    // Try to extract stream URL from the first iframe source
    const iframeSource = episode.sources.find(s => s.type === 'iframe');

    if (iframeSource) {
        const streamUrl = await extractStreamUrl(iframeSource.url);

        if (streamUrl) {
            const streamData: StreamData = {
                success: true,
                streamUrl,
                type: getVideoType(streamUrl),
            };

            // Cache the result
            cache.set(cacheKey, streamData, config.cache.ttl.episode);

            return streamData;
        }
    }

    // If no iframe, try direct sources
    const directSource = episode.sources.find(s => s.type === 'hls' || s.type === 'mp4');

    if (directSource) {
        const streamData: StreamData = {
            success: true,
            streamUrl: directSource.url,
            type: directSource.type,
        };

        cache.set(cacheKey, streamData, config.cache.ttl.episode);

        return streamData;
    }

    return {
        success: false,
        streamUrl: '',
        type: 'none',
    };
}

/**
 * Proxy stream request (for CORS bypass)
 */
export async function proxyStream(streamUrl: string, headers?: Record<string, string>) {
    try {
        const response = await httpClient.get(streamUrl, {
            responseType: 'stream',
            headers: {
                ...headers,
                'Referer': config.baseUrl,
            },
        });

        return response;
    } catch (error) {
        console.error('Error proxying stream:', error);
        throw error;
    }
}
