import axios, { AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { config } from '../config';

// Create cookie jar for session management
const jar = new CookieJar();

// Create axios instance with cookie jar support
const httpClient: AxiosInstance = wrapper(axios.create({
    timeout: config.request.timeout,
    jar,
    withCredentials: true,
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
    }
}));

// Add request interceptor for user agent rotation
httpClient.interceptors.request.use((config) => {
    const randomUserAgent = getRandomUserAgent();
    config.headers['User-Agent'] = randomUserAgent;
    return config;
});

// Add response interceptor for retry logic
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config: requestConfig } = error;

        if (!requestConfig || !requestConfig.retry) {
            requestConfig.retry = 0;
        }

        // Retry on network errors or 5xx errors
        if (
            requestConfig.retry < config.request.maxRetries &&
            (!error.response || error.response.status >= 500)
        ) {
            requestConfig.retry += 1;

            // Wait before retrying
            await new Promise(resolve =>
                setTimeout(resolve, config.request.retryDelay * requestConfig.retry)
            );

            return httpClient(requestConfig);
        }

        return Promise.reject(error);
    }
);

function getRandomUserAgent(): string {
    const userAgents = config.userAgents;
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export { httpClient };

/**
 * Fetch HTML content from a URL
 */
export async function fetchHtml(url: string): Promise<string> {
    try {
        const response = await httpClient.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw new Error(`Failed to fetch ${url}`);
    }
}

/**
 * Build full URL from relative path
 */
export function buildUrl(path: string): string {
    if (path.startsWith('http')) {
        return path;
    }
    return `${config.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
}
