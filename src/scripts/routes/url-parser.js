export const getActiveRoute = () => {
  const hash = window.location.hash || '#/';
  const clean = hash.replace('#', '');
  // Normalisasi: hilangkan trailing slash
  return clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : clean;
};
