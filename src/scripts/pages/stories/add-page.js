// src/scripts/pages/stories/add-page.js
import CONFIG from '../../config';

export default class AddPage {
  async render() {
    return `
      <section class="page">
        <h1>Tambah Cerita</h1>

        <p class="muted">Isi form berikut, klik peta untuk memilih lokasi.</p>

        <form id="add-form" class="card" style="padding:1rem">
          <div style="margin-bottom:.75rem">
            <label for="description"><b>Deskripsi</b></label><br/>
            <textarea id="description" name="description" rows="4" style="width:100%"></textarea>
          </div>

          <div style="margin-bottom:.75rem">
            <label for="photo"><b>Foto</b></label><br/>
            <input id="photo" name="photo" type="file" accept="image/*"/>
          </div>

          <!-- ✅ A11y fix: fieldset+legend dan label terasosiasi per input -->
          <div style="margin-bottom:.75rem">
            <fieldset style="border:0;padding:0;margin:0">
              <legend><b>Lokasi</b></legend>

              <div id="map" style="height:380px;border:1px solid #e5e7eb;border-radius:.5rem;margin:.5rem 0;"></div>

              <div style="display:flex; gap:2%; align-items:flex-start">
                <div style="flex:1">
                  <label for="lat"><b>Latitude</b></label>
                  <input id="lat" name="lat" type="text" inputmode="decimal" placeholder="-6.200000"
                         aria-describedby="loc-help" style="width:100%"/>
                </div>
                <div style="flex:1">
                  <label for="lon"><b>Longitude</b></label>
                  <input id="lon" name="lon" type="text" inputmode="decimal" placeholder="106.816666"
                         aria-describedby="loc-help" style="width:100%"/>
                </div>
              </div>

              <p id="loc-help" class="muted">Klik peta untuk mengisi koordinat.</p>
            </fieldset>
          </div>

          <button type="submit">Kirim</button>
          <div id="add-msg" class="muted" role="status" aria-live="polite" style="margin-top:.5rem"></div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form  = document.getElementById('add-form');
    const photo = document.getElementById('photo');
    const desc  = document.getElementById('description');
    const latEl = document.getElementById('lat');
    const lonEl = document.getElementById('lon');
    const msg   = document.getElementById('add-msg');

    const map = L.map('map').setView([-2.5, 118], 5);
    L.tileLayer(CONFIG.MAP_TILE_URL, { attribution: CONFIG.MAP_ATTRIBUTION }).addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      latEl.value = lat.toFixed(6);
      lonEl.value = lng.toFixed(6);
      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);
    });

    if (!form) return;
    const saveToOutbox = async (row) => {
      const open = indexedDB.open('ceritapeta-db', 1);
      const db = await new Promise((res, rej) => {
        open.onupgradeneeded = () => {
          const d = open.result;
          if (!d.objectStoreNames.contains('outbox')) {
            d.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
          }
        };
        open.onsuccess = () => res(open.result);
        open.onerror = () => rej(open.error);
      });
      await new Promise((res, rej) => {
        const tx = db.transaction('outbox', 'readwrite');
        tx.objectStore('outbox').add(row);
        tx.oncomplete = () => { db.close(); res(); };
        tx.onerror = () => { db.close(); rej(tx.error); };
      });
    };

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      msg.textContent = 'Mengirim...';

      const token = localStorage.getItem('token');
      const endpoint = token ? `${CONFIG.BASE_URL}/stories` : `${CONFIG.BASE_URL}/stories/guest`;

      try {
        const fd = new FormData();
        fd.append('description', (desc.value || '').trim());
        if (photo.files && photo.files[0]) fd.append('photo', photo.files[0]);
        if (latEl.value) fd.append('lat', latEl.value);
        if (lonEl.value) fd.append('lon', lonEl.value);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        const data = await res.json();

        if (!res.ok || data?.error) {
          throw new Error(data?.message || res.statusText);
        }
        try {
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.filter(k => k.startsWith('data-')).map(k => caches.delete(k)));
          }
        } catch {}

        msg.textContent = 'Berhasil menambahkan cerita. Mengalihkan ke beranda...';
        window.location.hash = '#/';
      } catch (e) {
        if (!navigator.onLine || e.name === 'TypeError') {
          try {
            const row = {
              endpoint,
              token,
              description: (desc.value || '').trim(),
              lat: latEl.value ? Number(latEl.value) : null,
              lon: lonEl.value ? Number(lonEl.value) : null,
              photoName: photo.files && photo.files[0] ? photo.files[0].name : undefined,
              photoBlob: photo.files && photo.files[0] ? photo.files[0] : null,
            };
            await saveToOutbox(row);

            try {
              const reg = await navigator.serviceWorker?.ready;
              await reg?.sync?.register('sync-stories');
            } catch {}

            msg.textContent = 'Offline: cerita masuk antrean. Buka lagi saat online untuk mengirim.';
            setTimeout(() => (window.location.hash = '#/'), 700);
            return;
          } catch {
          }
        }
        msg.textContent = 'Gagal: ' + e.message;
      }
    });
  }
}
