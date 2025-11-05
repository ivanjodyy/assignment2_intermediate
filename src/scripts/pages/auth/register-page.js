import CONFIG from '../../config';

export default class RegisterPage {
  async render() {
    return `
      <section class="page">
        <h1>Daftar</h1>
        <form id="register-form" class="card" style="padding:1rem;max-width:720px">
          <div style="margin-bottom:.75rem">
            <label for="name"><b>Nama</b></label><br/>
            <input id="name" name="name" type="text" autocomplete="name" style="width:100%"/>
          </div>
          <div style="margin-bottom:.75rem">
            <label for="email"><b>Email</b></label><br/>
            <input id="email" name="email" type="email" autocomplete="email" style="width:100%"/>
          </div>
          <div style="margin-bottom:.75rem">
            <label for="password"><b>Kata Sandi</b></label><br/>
            <input id="password" name="password" type="password" autocomplete="new-password" style="width:100%"/>
          </div>
          <button type="submit">Buat Akun</button>
          <div id="register-msg" class="muted" role="status" aria-live="polite" style="margin-top:.5rem"></div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const pass = document.getElementById('password');
    const msg  = document.getElementById('register-msg');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = 'Mendaftarkan...';
      try {
        const res = await fetch(`${CONFIG.BASE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.value, email: email.value, password: pass.value }),
        });
        const data = await res.json();
        if (!res.ok || data?.error) throw new Error(data?.message || res.statusText);

        msg.textContent = 'Berhasil daftar. Silakan login.';
        setTimeout(() => { window.location.hash = '#/login'; }, 600);
      } catch (err) {
        msg.textContent = 'Gagal daftar: ' + err.message;
      }
    });
  }
}
