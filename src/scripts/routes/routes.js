import HomePage from '../pages/home/home-page';
import AddPage from '../pages/stories/add-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import SavedPage from '../pages/saved/saved-page';

const routes = {
  '/': HomePage,
  '/add': AddPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/about': AboutPage,
  '/saved': SavedPage,        // <— baru
  '/detail/:id': DetailPage,
};

export default routes;
