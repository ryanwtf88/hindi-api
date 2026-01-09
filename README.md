# Hindi Anime API

A comprehensive RESTful API for scraping anime content from [watchanimeworld.in](https://watchanimeworld.in), built with Hono.js and Bun.

## Features

- **Home Page Data** - Latest series, movies, trending, and popular content
- **Search Engine** - Full-text search with pagination and autocomplete suggestions
- **Anime Details** - Comprehensive information with seasons, episodes, and related content
- **Episode Streaming** - Extract video sources and streaming links from multiple servers
- **Category Browsing** - Filter by genre, language (Hindi, Tamil, Telugu, English), type
- **Stream Proxy** - CORS bypass and optimized embed player with HLS.js support
- **High Performance** - In-memory caching with TTL
- **Cloudflare Bypass** - Cookie jar support and user-agent rotation
- **Swagger UI** - Interactive API documentation at root endpoint

## Installation

To host the API locally, follow these steps:

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher
- [Node.js](https://nodejs.org) v18 or higher

### Quick Start

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ryanwtf88/hindi-api.git
    cd hindi-api
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Start the development server:**

    ```bash
    bun run dev
    ```

    The API will be available at `http://localhost:3001`.

4.  **Build for production:**

    ```bash
    bun run build
    ```

5.  **Start the production server:**

    ```bash
    bun start
    ```

## API Endpoints

### Documentation

- **Interactive Docs**: `GET /docs` - API documentation and endpoint list
- **Health Check**: `GET /health` - Server health status

### Core Endpoints

A detailed list of all available endpoints can be found in the [Swagger UI documentation](https://hindi-anime-api.vercel.app/docs).

## Configuration

Edit `src/config.ts` to customize:

- Cache TTL settings
- Server port and host
- Request timeout and retries
- User agents for rotation

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

If you discover a security vulnerability, please follow the instructions in [SECURITY.md](SECURITY.md) to report it.

## Disclaimer

This API is for educational purposes only. Web scraping may be subject to the website's terms of service. Please ensure you have the right to scrape this content and use it responsibly.
