import { Hono } from 'hono';
import { getStreamData, proxyStream } from '../scrapers/stream';
import { stream as streamResponse } from 'hono/streaming';

const stream = new Hono();

/**
 * GET /api/stream/:episodeId
 * Get stream URL for an episode
 */
stream.get('/:episodeId', async (c) => {
    try {
        const episodeId = c.req.param('episodeId');
        const data = await getStreamData(episodeId);
        return c.json(data);
    } catch (error) {
        console.error('Error in /api/stream/:episodeId:', error);
        return c.json({
            success: false,
            error: 'Failed to get stream data',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

/**
 * GET /api/stream/:episodeId/proxy
 * Proxy the actual stream (for CORS bypass)
 */
stream.get('/:episodeId/proxy', async (c) => {
    try {
        const episodeId = c.req.param('episodeId');
        const streamData = await getStreamData(episodeId);

        if (!streamData.success || !streamData.streamUrl) {
            return c.json({
                success: false,
                error: 'No stream URL found',
            }, 404);
        }

        // Proxy the stream
        const response = await proxyStream(streamData.streamUrl);

        // Set appropriate headers
        c.header('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        c.header('Access-Control-Allow-Origin', '*');

        // Stream the response
        return streamResponse(c, async (stream) => {
            for await (const chunk of response.data) {
                await stream.write(chunk);
            }
        });
    } catch (error) {
        console.error('Error in /api/stream/:episodeId/proxy:', error);
        return c.json({
            success: false,
            error: 'Failed to proxy stream',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, 500);
    }
});

/**
 * GET /api/embed/:episodeId
 * Get optimized embed player HTML
 */
stream.get('/embed/:episodeId', async (c) => {
    try {
        const episodeId = c.req.param('episodeId');
        const streamData = await getStreamData(episodeId);

        if (!streamData.success || !streamData.streamUrl) {
            return c.html(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Stream Not Found</title>
          <style>
            body { margin: 0; padding: 0; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; }
          </style>
        </head>
        <body>
          <div>Stream not found</div>
        </body>
        </html>
      `);
        }

        // Return a simple HTML player
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stream Player</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #000; }
          video { width: 100%; height: 100vh; object-fit: contain; }
        </style>
      </head>
      <body>
        ${streamData.type === 'hls' ? `
          <video id="player" controls autoplay></video>
          <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
          <script>
            const video = document.getElementById('player');
            const videoSrc = '${streamData.streamUrl}';
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(videoSrc);
              hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = videoSrc;
            }
          </script>
        ` : `
          <video controls autoplay>
            <source src="${streamData.streamUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        `}
      </body>
      </html>
    `;

        return c.html(html);
    } catch (error) {
        console.error('Error in /api/embed/:episodeId:', error);
        return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body { margin: 0; padding: 0; background: #000; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div>Error loading stream</div>
      </body>
      </html>
    `);
    }
});

export default stream;
