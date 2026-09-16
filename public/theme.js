// Applied before React and CSS paint to avoid flashing the wrong theme.
(() => {
 const media = window.matchMedia('(prefers-color-scheme: dark)');
 const preference = () => { try { return localStorage.getItem('cadet-theme'); } catch { return null; } };
 const apply = value => {
  const theme = value === 'light' || value === 'dark' ? value : media.matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0e1a' : '#f4f6fb');
  window.dispatchEvent(new Event('cadet-theme'));
 };
 apply(preference());
 media.addEventListener('change', () => { if (!preference()) apply(null); });
 window.addEventListener('storage', e => { if (e.key === 'cadet-theme') apply(e.newValue); });
})();
