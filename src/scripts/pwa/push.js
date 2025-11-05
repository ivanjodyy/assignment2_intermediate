import CONFIG from '../config';

function urlBase64ToUint8Array(base64) {
  const pad = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i=0;i<raw.length;i++) out[i] = raw.charCodeAt(i);
  return out;
}

function assertSW() {
  const isSecure = window.isSecureContext || location.hostname === 'localhost';
  if (!('serviceWorker' in navigator) || !isSecure) {
    throw new Error('Service Worker/Push perlu HTTPS atau http://localhost');
  }
}

export async function isPushEnabled() {
  try {
    assertSW();
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    return !!sub;
  } catch { return false; }
}

export async function enablePush() {
  assertSW();
  if (!('Notification' in window)) throw new Error('Notifikasi tidak didukung');
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Izin notifikasi ditolak');

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) throw new Error('Service worker belum aktif');

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
  });
  localStorage.setItem('push-subscription', JSON.stringify(sub));

  // kirim ke server
  const token = localStorage.getItem('token');
  const body = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.toJSON().keys.p256dh,
      auth: sub.toJSON().keys.auth,
    },
  };
  const res = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data?.error) throw new Error(data?.message || 'Gagal subscribe di server');

  return sub;
}

export async function disablePush() {
  try {
    assertSW();
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const token = localStorage.getItem('token');
      await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
      localStorage.removeItem('push-subscription');
    }
  } catch (e) {
    console.warn('disablePush warning:', e);
  }
}
