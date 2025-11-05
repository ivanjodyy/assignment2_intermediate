export const getActiveRoute = () => {
  const hash = window.location.hash || '#/';
  const clean = hash.replace('#', '');
  return clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : clean;
};
