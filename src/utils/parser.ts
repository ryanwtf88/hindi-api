import * as cheerio from 'cheerio';
import { buildUrl } from './http';

/**
 * Load HTML into Cheerio
 */
export function loadHtml(html: string) {
    return cheerio.load(html);
}

/**
 * Clean text by removing extra whitespace and newlines
 */
export function cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
}

/**
 * Extract ID from URL
 * Example: https://watchanimeworld.in/series/bleach-thousand-year-blood-war/ -> bleach-thousand-year-blood-war
 */
export function extractIdFromUrl(url: string): string {
    const match = url.match(/\/(series|episode|movies?)\/([^\/]+)/);
    return match ? match[2].replace(/\/$/, '') : '';
}

/**
 * Normalize URL to full absolute URL
 */
export function normalizeUrl(url: string): string {
    if (!url) return '';

    // Already absolute URL
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // Relative URL
    return buildUrl(url);
}

/**
 * Parse episode number from string
 * Example: "1x13" -> { season: 1, episode: 13 }
 * Example: "Episode 5" -> { season: 1, episode: 5 }
 */
export function parseEpisodeNumber(text: string): { season: number; episode: number } {
    // Try format: 1x13
    let match = text.match(/(\d+)x(\d+)/i);
    if (match) {
        return {
            season: parseInt(match[1]),
            episode: parseInt(match[2]),
        };
    }

    // Try format: S1E13
    match = text.match(/s(\d+)e(\d+)/i);
    if (match) {
        return {
            season: parseInt(match[1]),
            episode: parseInt(match[2]),
        };
    }

    // Try format: Episode 13
    match = text.match(/episode\s+(\d+)/i);
    if (match) {
        return {
            season: 1,
            episode: parseInt(match[1]),
        };
    }

    // Default
    return { season: 1, episode: 1 };
}

/**
 * Extract video quality from text
 * Example: "1080p" -> "1080p"
 * Example: "HD" -> "720p"
 */
export function extractQuality(text: string): string {
    const match = text.match(/(\d+p)/i);
    if (match) {
        return match[1];
    }

    if (text.toLowerCase().includes('hd')) {
        return '720p';
    }

    if (text.toLowerCase().includes('sd')) {
        return '480p';
    }

    return 'unknown';
}

/**
 * Determine video type from URL
 */
export function getVideoType(url: string): 'hls' | 'mp4' | 'iframe' | 'other' {
    if (url.includes('.m3u8')) {
        return 'hls';
    }

    if (url.includes('.mp4')) {
        return 'mp4';
    }

    if (url.includes('iframe') || url.includes('embed')) {
        return 'iframe';
    }

    return 'other';
}

/**
 * Extract pagination info from HTML
 */
export function extractPagination($: cheerio.CheerioAPI, currentPage: number = 1): {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
} {
    const paginationLinks = $('.pagination a, .page-numbers a');
    const pageNumbers: number[] = [];

    paginationLinks.each((_, el) => {
        const text = $(el).text().trim();
        const pageNum = parseInt(text);
        if (!isNaN(pageNum)) {
            pageNumbers.push(pageNum);
        }
    });

    const totalPages = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;

    return {
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
}
