export async function ensureServiceWorker() {
  const isSecure = window.isSecureContext || location.hostname === 'localhost';
  if (!('serviceWorker' in navigator) || !isSecure) return; // non-secure context: abaikan

  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (e) {
    console.warn('SW register failed:', e);
  }
}
