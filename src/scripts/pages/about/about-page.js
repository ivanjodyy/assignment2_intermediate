import { setupInstallPrompt } from '../../pwa/install';
import { isPushEnabled, enablePush, disablePush } from '../../pwa/push';

export default class AboutPage {
  async render() {
    return `
      <section class="page">
        <h1>Tentang Aplikasi</h1>
        <p class="muted">Proyek SPA + PWA (install & offline), push notification, IndexedDB, peta.</p>

        <h2>Install Aplikasi</h2>
        <button id="btn-install" style="width:100%">Install</button>
        <div id="install-msg" class="muted" role="status" aria-live="polite"></div>

        <h2>Notifikasi</h2>
        <button id="btn-push" style="width:100%">Cek Status...</button>
        <div id="push-msg" class="muted" role="status" aria-live="polite"></div>
      </section>
    `;
  }

  async afterRender() {
    // Install PWA
    const btnInstall = document.getElementById('btn-install');
    const installMsg = document.getElementById('install-msg');
    setupInstallPrompt(btnInstall, installMsg);

    // Push Notification
    const btnPush = document.getElementById('btn-push');
    const pushMsg = document.getElementById('push-msg');

    const refreshPushUI = async () => {
      const enabled = await isPushEnabled();
      btnPush.textContent = enabled ? 'Nonaktifkan Push' : 'Aktifkan Push';
      pushMsg.textContent = enabled ? 'Push aktif.' : 'Push nonaktif.';
    };

    await refreshPushUI();

    btnPush.addEventListener('click', async () => {
      try {
        const enabled = await isPushEnabled();
        if (enabled) {
          await disablePush();
          pushMsg.textContent = 'Push dimatikan.';
        } else {
          await enablePush();
          pushMsg.textContent = 'Push diaktifkan.';
        }
      } catch (e) {
        pushMsg.textContent = 'Gagal mengubah push: ' + (e?.message || e);
      } finally {
        await refreshPushUI();
      }
    });
  }
}
