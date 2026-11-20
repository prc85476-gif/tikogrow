/**
 * Safe Link Opener for Telegram WebApp and Standard Browsers
 * Automatically selects Telegram.WebApp.openTelegramLink, openLink, or standard window.open.
 */
export function openLinkSafely(url) {
  if (!url) return;
  const cleanUrl = String(url).trim();
  if (!cleanUrl) return;

  try {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (tg) {
      // 1. If it is a Telegram channel, group, bot, or invite link
      if (
        cleanUrl.includes('t.me/') ||
        cleanUrl.startsWith('tg://') ||
        cleanUrl.startsWith('@')
      ) {
        let tgLink = cleanUrl;
        if (tgLink.startsWith('@')) {
          tgLink = `https://t.me/${tgLink.slice(1)}`;
        }
        if (typeof tg.openTelegramLink === 'function') {
          tg.openTelegramLink(tgLink);
          return;
        }
      }

      // 2. If it is an external link (Twitter/X, YouTube, Website, etc.)
      if (typeof tg.openLink === 'function') {
        tg.openLink(cleanUrl);
        return;
      }
    }
  } catch (err) {
    console.warn('[openLinkSafely] Telegram WebApp API error:', err);
  }

  // 3. Fallback for standard browsers
  try {
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('[openLinkSafely] window.open failed:', err);
    window.location.href = cleanUrl;
  }
}
