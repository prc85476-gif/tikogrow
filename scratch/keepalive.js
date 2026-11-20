// Tunnel Keepalive: pings the public tunnel every 25 seconds to prevent idle timeout
const TUNNEL_URL = 'https://branches-humanity-mag-announcements.trycloudflare.com/api/config';

console.log('[Keepalive] Started for:', TUNNEL_URL);

async function ping() {
  try {
    const res = await fetch(TUNNEL_URL, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      // Quiet success
    } else {
      console.warn('[Keepalive] Non-200 status:', res.status);
    }
  } catch (err) {
    console.warn('[Keepalive Ping Error]:', err.message);
  }
}

// Initial ping
ping();
// Recurring ping every 25 seconds
setInterval(ping, 25000);

