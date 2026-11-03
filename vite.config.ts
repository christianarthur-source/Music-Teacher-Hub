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

export default defineConfig({
  plugins: [react(), calendarProxyPlugin()],
  server: {
    port: 5173,
    host: true
  }
});
