let deferredPrompt = null;

/**
 * Hubungkan tombol install & area pesan (opsional).
 * Aman dipanggil berkali-kali—kalau elemen tidak ada, langsung return.
 */
export function setupInstallPrompt(buttonEl, msgEl) {
  if (!buttonEl) return;

  // default UI
  buttonEl.disabled = true;
  if (msgEl) msgEl.textContent = '';

  // Browser memberi sinyal kalau app bisa diinstall
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    buttonEl.disabled = false;
    if (msgEl) msgEl.textContent = 'Aplikasi siap diinstal.';
  });

  // Klik tombol “Install”
  buttonEl.addEventListener('click', async () => {
    if (!deferredPrompt) {
      if (msgEl) msgEl.textContent = 'Install belum tersedia.';
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (msgEl) {
      msgEl.textContent = (choice.outcome === 'accepted')
        ? 'Instalasi dimulai.'
        : 'Instalasi dibatalkan.';
    }
    deferredPrompt = null;
    buttonEl.disabled = true;
  });

  // Setelah berhasil terinstal (via prompt atau menu browser)
  window.addEventListener('appinstalled', () => {
    if (msgEl) msgEl.textContent = 'Aplikasi sudah terinstal.';
    buttonEl.disabled = true;
  });
}
