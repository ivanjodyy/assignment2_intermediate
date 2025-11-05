import { bindInstallUI } from '../../pwa/install';
import { bindPushUI } from '../../pwa/push';

export default class AboutPage {
  async render() {
    return `
      <section class="page">
        <h1>Tentang Aplikasi</h1>
        <p class="muted">Proyek SPA dengan peta, form, aksesibilitas, PWA (install + offline), push, dan IndexedDB.</p>

        <h2>Install Aplikasi</h2>
        <button id="btn-install" style="width:100%">Install</button>
        <div id="install-msg" class="muted" role="status" aria-live="polite" style="margin:.5rem 0 1rem"></div>

        <h2>Notifikasi</h2>
        <button id="btn-push" style="width:100%">Cek Status...</button>
        <div id="push-msg" class="muted" role="status" aria-live="polite" style="margin-top:.5rem"></div>
      </section>
    `;
  }

  async afterRender() {
    // Semua binding UI dilakukan di sini (setelah elemen ada)
    bindInstallUI(
      document.getElementById('btn-install'),
      document.getElementById('install-msg'),
    );
    bindPushUI(
      document.getElementById('btn-push'),
      document.getElementById('push-msg'),
    );
  }
}
