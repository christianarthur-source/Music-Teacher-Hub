import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function calendarProxyPlugin(): Plugin {
  return {
    name: 'calendar-proxy',
    configureServer(server) {
      server.middlewares.use('/api/calendar-proxy', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          let targetUrl = urlObj.searchParams.get('url');
          if (!targetUrl) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
          }

          if (targetUrl.startsWith('webcal://')) {
            targetUrl = 'https://' + targetUrl.slice(9);
          }

          const response = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
              'Accept': 'text/calendar, text/plain, */*'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Remote calendar responded with HTTP ${response.status}` }));
            return;
          }

          const icsText = await response.text();
          res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
          res.end(icsText);
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'Failed to fetch calendar' }));
        }
      });
    }
  };
}

function youtubeSearchPlugin(): Plugin {
  return {
    name: 'youtube-search-proxy',
    configureServer(server) {
      server.middlewares.use('/api/youtube-search', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', `http://${req.headers.host}`);
          const q = urlObj.searchParams.get('q');
          if (!q) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing q query parameter' }));
            return;
          }

          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
          const response = await fetch(ytUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `YouTube responded with HTTP ${response.status}` }));
            return;
          }

          const html = await response.text();
          const marker = 'var ytInitialData = ';
          let dataStr = '';
          const idx = html.indexOf(marker);
          if (idx !== -1) {
            const start = idx + marker.length;
            const end = html.indexOf(';</script>', start);
            if (end !== -1) {
              dataStr = html.slice(start, end);
            }
          }

          const results: Array<{
            id: string;
            title: string;
            channel: string;
            duration: string;
            thumbnail: string;
            views: string;
            publishedTime: string;
          }> = [];

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
              if (contents && Array.isArray(contents)) {
                for (const section of contents) {
                  const itemSection = section?.itemSectionRenderer?.contents;
                  if (itemSection && Array.isArray(itemSection)) {
                    for (const item of itemSection) {
                      const v = item?.videoRenderer;
                      if (v && v.videoId) {
                        results.push({
                          id: v.videoId,
                          title: v.title?.runs?.map((r: any) => r.text).join('') || v.title?.simpleText || 'Untitled Video',
                          channel: v.ownerText?.runs?.map((r: any) => r.text).join('') || 'YouTube Channel',
                          duration: v.lengthText?.simpleText || '',
                          thumbnail: `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
                          views: v.viewCountText?.simpleText || '',
                          publishedTime: v.publishedTimeText?.simpleText || ''
                        });
                      }
                    }
                  }
                }
              }
            } catch (parseErr) {
              console.error('Failed to parse ytInitialData', parseErr);
            }
          }

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({ results }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message || 'YouTube search failed' }));
        }
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), calendarProxyPlugin(), youtubeSearchPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
