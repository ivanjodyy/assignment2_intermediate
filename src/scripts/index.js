import '../styles/styles.css';
import App from './pages/app';
import { setupInstallPrompt } from './pwa/install';
import { ensureServiceWorker } from './pwa/sw-register';

document.addEventListener('DOMContentLoaded', async () => {

  window.__APP_BOOTED__ = false;

  const showFatal = (err) => {
    console.error('BOOT ERROR:', err);
    const el = document.querySelector('#main-content');
    if (el) {
      el.innerHTML = `
        <section class="page">
          <h1>Kesalahan saat memuat aplikasi</h1>
          <pre style="white-space:pre-wrap">${
            (err && err.stack) ? err.stack : String(err)
          }</pre>
        </section>
      `;
    }
  };

  try {

    try { await ensureServiceWorker(); } catch (e) { console.warn('SW register warn:', e); }

 
    try {
      const btn = document.getElementById('btn-install');
      const msg = document.getElementById('install-msg');
      setupInstallPrompt(btn, msg);
    } catch (e) {
      console.warn('install prompt warn:', e);
    }

    const app = new App({
      content: document.querySelector('#main-content'),
      drawerButton: document.querySelector('#drawer-button'),
      navigationDrawer: document.querySelector('#navigation-drawer'),
    });

    await app.renderPage();
  } catch (e) {
    showFatal(e);
  } finally {
    window.__APP_BOOTED__ = true;
  }
});
