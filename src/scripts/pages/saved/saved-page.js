// src/scripts/pages/saved/saved-page.js
import { getAllSaved, deleteSaved } from '../../data/db';

export default class SavedPage {
  async render() {
    return `
      <section class="page">
        <h1>Tersimpan (IndexedDB)</h1>
        <p class="muted">Data yang kamu simpan akan muncul di sini, bisa diakses offline.</p>
        <div id="saved-list" class="list"></div>
      </section>
    `;
  }
  async afterRender() {
    const list = document.getElementById('saved-list');
    const rows = await getAllSaved();
    if (!rows.length) { list.innerHTML = '<p class="muted">Belum ada data tersimpan.</p>'; return; }

    list.innerHTML = rows.map((s) => `
      <article class="card" data-id="${s.id}">
        <img src="${s.photoUrl || ''}" alt="" loading="lazy"/>
        <div class="card-body">
          <h2>${s.name || 'Anonim'}</h2>
          <p>${s.description || ''}</p>
          <div class="row" style="display:flex; gap:.5rem; margin-top:.5rem">
            <button class="btn-del" type="button">Hapus</button>
          </div>
          <div class="muted small" data-status></div>
        </div>
      </article>
    `).join('');

    list.addEventListener('click', async (e) => {
      const card = e.target.closest('.card'); if (!card) return;
      if (e.target.closest('.btn-del')) {
        const id = card.dataset.id;
        await deleteSaved(id);
        card.remove();
      }
    });
  }
}
