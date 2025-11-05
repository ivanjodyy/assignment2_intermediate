import '../styles/styles.css';
import App from './pages/app';
import { setupInstallPrompt } from './pwa/install';
import { ensureServiceWorker } from './pwa/sw-register';

document.addEventListener('DOMContentLoaded', async () => {
  // default: tandai belum boot
  window.__APP_BOOTED__ = false;

  const showFatal = (err) => {
    console.error('BOOT ERROR:', err);
    const el = document.querySelector('#main-content');
    if (el) {
      el.innerHTML = `
        <section class="page">
          <h1>Kesalahan saat memuat aplikasi</h1>
          <pre style="white-space:pre-wrap">${(err && err.stack) ? err.stack : String(err)}</pre>
        </section>
      `;
    }
  };

  try {
    // Jangan biarkan SW gagal menghentikan boot (khusus http)
    try { await ensureServiceWorker(); } catch (e) { console.warn('SW register warn:', e); }
    try { setupInstallPrompt(); } catch (e) { console.warn('install prompt warn:', e); }

    const app = new App({
      content: document.querySelector('#main-content'),
      drawerButton: document.querySelector('#drawer-button'),
      navigationDrawer: document.querySelector('#navigation-drawer'),
    });

    await app.renderPage();
  } catch (e) {
    showFatal(e);
  } finally {
    // Apapun yang terjadi, matikan “Aplikasi belum termuat”
    window.__APP_BOOTED__ = true;
  }
});
