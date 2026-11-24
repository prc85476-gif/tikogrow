/**
 * GigaPub Ad SDK Integration
 * Script: https://ad.gigapub.tech/script?id=9074
 */

export function playGigaAd() {
  return new Promise((resolve, reject) => {
    const triggerAd = () => {
      try {
        const res = window.showGiga();
        if (res && typeof res.then === 'function') {
          res
            .then(() => resolve({ success: true }))
            .catch((err) => reject(err || new Error('Ad was closed or skipped before completion.')));
        } else {
          resolve({ success: true });
        }
      } catch (err) {
        reject(err || new Error('Failed to launch GigaPub Ad.'));
      }
    };

    // 1. If window.showGiga is already ready
    if (typeof window !== 'undefined' && typeof window.showGiga === 'function') {
      triggerAd();
      return;
    }

    // 2. Ensure script is injected if missing
    if (typeof document !== 'undefined' && !document.querySelector('script[src*="ad.gigapub.tech"]')) {
      const script = document.createElement('script');
      script.src = 'https://ad.gigapub.tech/script?id=9074';
      script.async = true;
      document.head.appendChild(script);
    }

    // 3. Wait up to 3.5 seconds for SDK initialization
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window !== 'undefined' && typeof window.showGiga === 'function') {
        clearInterval(interval);
        triggerAd();
      } else if (attempts > 35) {
        clearInterval(interval);
        reject(new Error('GigaPub Ad SDK is not available. Please check your network or disable ad blockers.'));
      }
    }, 100);
  });
}

