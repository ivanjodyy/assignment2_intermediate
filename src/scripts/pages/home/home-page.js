import { getStories } from '../../data/api';
import CONFIG from '../../config';
import { addSaved, deleteSaved, getSaved } from '../../data/db';

export default class HomePage {
  async render() {
    return `
      <section aria-labelledby="home-title" class="page">
        <h1 id="home-title">Beranda</h1>

        <form id="filter-form" class="filter-form" role="search">
          <label for="q">Cari cerita</label>
          <input id="q" name="q" type="search" placeholder="Ketik judul/desk..." />
          <button type="submit">Cari</button>
        </form>

        <div class="layout">
          <div class="list" id="story-list" aria-live="polite"></div>
          <div class="map-wrap">
            <div id="map" class="map" role="application" aria-label="Peta lokasi cerita"></div>
            <div class="map-legend">Klik marker atau item untuk melihat detail.</div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    const data = await getStories(token).catch((e) => ({ error: String(e) }));
    const stories = data?.listStory || [];
    const container = document.getElementById('story-list');
    const q = document.getElementById('q');
    const form = document.getElementById('filter-form');

    const renderList = (items) => {
      container.innerHTML = items.map((s, idx) => `
        <article class="card" data-idx="${idx}" data-id="${s.id}" tabindex="0" aria-labelledby="story-${idx}-title">
          <img src="${s.photoUrl || ''}" alt="${s.name ? 'Foto oleh ' + s.name : 'Foto cerita'}" loading="lazy" />
          <div class="card-body">
            <h2 id="story-${idx}-title">${s.name || 'Anonim'}</h2>
            <p class="muted">${new Date(s.createdAt).toLocaleString()}</p>
            <p>${s.description || '(Tanpa deskripsi)'}</p>
            ${s.lat != null && s.lon != null ? `<p class="muted">Lokasi: ${s.lat.toFixed(4)}, ${s.lon.toFixed(4)}</p>` : ''}

            <div class="row" style="display:flex; gap:.5rem; margin-top:.5rem">
              <button class="btn-save" type="button">Simpan</button>
              <button class="btn-del"  type="button">Hapus</button>
            </div>
            <div class="muted small" data-status></div>
          </div>
        </article>
      `).join('');
    };
    renderList(stories);

    // Map + multiple tile layer
    const map = L.map('map', { center: [-2.5, 118], zoom: 4 });
    const osm = L.tileLayer(CONFIG.MAP_TILE_URL, { attribution: CONFIG.MAP_ATTRIBUTION }).addTo(map);
    const toner = L.tileLayer('https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by Stamen & OpenStreetMap',
    });
    L.control.layers({ 'OpenStreetMap': osm, 'Stamen Toner': toner }, {}, { position: 'topright' }).addTo(map);

    // Markers + popup + sinkron list↔peta
    const markers = [];
    stories.forEach((s, idx) => {
      if (s.lat != null && s.lon != null) {
        const m = L.marker([s.lat, s.lon]).addTo(map).bindPopup(`
          <strong>${s.name || 'Anonim'}</strong><br/>
          ${s.description ? s.description.replace(/</g,'&lt;') : ''}
        `);
        m.on('click', () => {
          const el = container.querySelector(`[data-idx="${idx}"]`);
          el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el?.classList.add('active');
          setTimeout(() => el?.classList.remove('active'), 1500);
        });
        markers.push(m);
      } else {
        markers.push(null);
      }
    });

    // klik kartu → fokus ke marker
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;
      const idx = Number(card.dataset.idx);
      const s = stories[idx];
      if (s?.lat != null && s?.lon != null) {
        map.setView([s.lat, s.lon], 13);
        markers[idx]?.openPopup();
      }
    });

    // simpan/hapus ke IndexedDB
    container.addEventListener('click', async (e) => {
      const btnSave = e.target.closest('.btn-save');
      const btnDel  = e.target.closest('.btn-del');
      const card    = e.target.closest('.card');
      if (!card) return;

      const idx = Number(card.dataset.idx);
      const story = stories[idx];
      const statusEl = card.querySelector('[data-status]');

      if (btnSave) {
        try {
          await addSaved({
            id: story.id,
            name: story.name || 'Anonim',
            description: story.description || '',
            photoUrl: story.photoUrl || '',
            createdAt: story.createdAt,
            lat: story.lat, lon: story.lon,
          });
          statusEl.textContent = 'Tersimpan di perangkat (IndexedDB).';
        } catch (err) {
          statusEl.textContent = 'Gagal menyimpan: ' + err.message;
        }
        return;
      }

      if (btnDel) {
        try {
          await deleteSaved(story.id);
          statusEl.textContent = 'Dihapus dari penyimpanan lokal.';
        } catch (err) {
          statusEl.textContent = 'Gagal hapus: ' + err.message;
        }
      }
    });

    // filter/cari
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = (q.value || '').toLowerCase();
      const filtered = stories.filter(s =>
        (s.name || '').toLowerCase().includes(term) ||
        (s.description || '').toLowerCase().includes(term)
      );
      renderList(filtered);
    });
  }
}
