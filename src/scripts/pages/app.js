import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content; #drawerButton; #navigationDrawer;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupGlobalA11y();
    this._setupAuthNav();

    window.addEventListener('hashchange', () => this.renderPage());

    // Logout
    document.addEventListener('click', (e) => {
      if (e.target?.id === 'logout-link') {
        e.preventDefault();
        localStorage.removeItem('token');
        this._setupAuthNav();
        window.location.hash = '#/login';
      }
    });
  }

  _setupGlobalA11y() {
    const skip = document.querySelector('.skip-link');
    skip?.addEventListener('click', (e) => {
      e.preventDefault();
      this.#content.setAttribute('tabindex', '-1');
      this.#content.focus();
    });
  }

  _setupAuthNav() {
    const hasToken = !!localStorage.getItem('token');
    const login = document.getElementById('login-link');
    const register = document.getElementById('register-link');
    const logout = document.getElementById('logout-link');
    if (login) login.style.display = hasToken ? 'none' : '';
    if (register) register.style.display = hasToken ? 'none' : '';
    if (logout) logout.style.display = hasToken ? '' : 'none';
  }

  _setupDrawer() {
    const btn = this.#drawerButton;
    const drawer = this.#navigationDrawer;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      drawer.classList.toggle('open');
      if (drawer.classList.contains('open')) drawer.querySelector('a,button')?.focus();
    });
    drawer.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        drawer.classList.remove('open');
        this.#drawerButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  async renderPage() {
    this.#content.innerHTML = `<section class="page"><p>Memuat halaman…</p></section>`;
    this._setupAuthNav();

    const showError = (title, detail) => {
      const html = detail?.stack
        ? `<pre style="white-space:pre-wrap">${detail.stack}</pre>`
        : `<pre style="white-space:pre-wrap">${String(detail ?? '')}</pre>`;
      this.#content.innerHTML = `<section class="page"><h1>${title}</h1>${html}</section>`;
    };

    try {
      const url = getActiveRoute() || '/';
      let page = routes[url];

      // dukung /detail/:id dinamis
      if (!page && url.startsWith('/detail/')) {
        try {
          const mod = await import('../pages/detail/detail-page');
          page = new mod.default();
        } catch (e) {
          return showError('Gagal memuat halaman detail', e);
        }
      }

      if (!page) {
        return showError('Route tidak ditemukan', `URL aktif: "${url}". Periksa routes.js.`);
      }

      const render = async () => {
        try {
          const html = await page.render();
          this.#content.innerHTML = html || '<section class="page"><p>(Halaman tanpa konten)</p></section>';
          if (page.afterRender) await page.afterRender();
          this.#content.setAttribute('tabindex', '-1');
          this.#content.focus();
        } catch (e) {
          showError('Gagal merender halaman', e);
        }
      };

      if (document.startViewTransition) await document.startViewTransition(render).finished;
      else await render();
    } catch (err) {
      showError('Kesalahan tak terduga saat renderPage()', err);
    }
  }
}
export default App;
