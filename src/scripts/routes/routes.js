import HomePage from '../pages/home/home-page';
import AddPage from '../pages/stories/add-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AboutPage from '../pages/about/about-page';
import SavedPage from '../pages/saved/saved-page';   

const routes = {
  '/': new HomePage(),
  '/add': new AddPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/about': new AboutPage(),
  '/saved': new SavedPage(),       
};

export default routes;
