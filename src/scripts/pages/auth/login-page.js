import CONFIG from '../../config';

export default class LoginPage {
  async render() {
    return `
      <section class="page">
        <h1>Login</h1>
        <form id="login-form" class="card" style="padding:1rem;max-width:720px">
          <div style="margin-bottom:.75rem">
            <label for="email"><b>Email</b></label><br/>
            <input id="email" name="email" type="email" autocomplete="email" style="width:100%"/>
          </div>
          <div style="margin-bottom:.75rem">
            <label for="password"><b>Kata Sandi</b></label><br/>
            <input id="password" name="password" type="password" autocomplete="current-password" style="width:100%"/>
          </div>
          <button type="submit">Masuk</button>
          <div id="login-msg" class="muted" role="status" aria-live="polite" style="margin-top:.5rem"></div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const form   = document.getElementById('login-form');
    const email  = document.getElementById('email');
    const pass   = document.getElementById('password');
    const msg    = document.getElementById('login-msg');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = 'Memproses...';
      try {
        const res = await fetch(`${CONFIG.BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.value, password: pass.value }),
        });
        const data = await res.json();
        if (!res.ok || data?.error) throw new Error(data?.message || res.statusText);

        localStorage.setItem('token', data.loginResult?.token || '');
        msg.textContent = 'Berhasil masuk. Mengalihkan...';
        setTimeout(() => { window.location.hash = '#/'; }, 500);
      } catch (err) {
        msg.textContent = 'Gagal login: ' + err.message;
      }
    });
  }
}
