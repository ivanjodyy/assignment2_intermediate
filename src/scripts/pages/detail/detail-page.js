import CONFIG from '../../config';

export default class DetailPage {
  async render() {
    return `
      <section class="page">
        <h1>Detail Cerita</h1>
        <div id="detail" class="card">Memuat...</div>
      </section>
    `;
  }

  async afterRender() {
    const parts = location.hash.split('/');
    const id = parts[parts.length - 1];

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const s = data?.story || {};
      document.getElementById('detail').innerHTML = `
        <article class="card">
          ${s.photoUrl ? `<img src="${s.photoUrl}" alt="Foto cerita" />` : ''}
          <div class="card-body">
            <h2>${s.name || 'Anonim'}</h2>
            <p class="muted">${s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</p>
            <p>${s.description || '-'}</p>
            ${s.lat != null && s.lon != null ? `<p class="muted">Koordinat: ${s.lat}, ${s.lon}</p>` : ''}
          </div>
        </article>
      `;
    } catch (e) {
      document.getElementById('detail').textContent = `Gagal memuat detail: ${e}`;
    }
  }
}
