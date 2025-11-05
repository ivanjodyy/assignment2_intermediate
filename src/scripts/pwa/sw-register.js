export async function ensureServiceWorker() {
  // SW hanya diaktifkan pada konteks aman: https, atau http://localhost
  const isSecure = window.isSecureContext || location.hostname === 'localhost';
  if (!('serviceWorker' in navigator) || !isSecure) return;

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.warn('SW register failed:', e);
  }
}
