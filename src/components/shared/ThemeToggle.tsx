import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
export function ThemeToggle() {
 const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
 useEffect(() => {
  const sync = () => setTheme(document.documentElement.dataset.theme || 'dark');
  window.addEventListener('cadet-theme', sync);
  return () => window.removeEventListener('cadet-theme', sync);
 }, []);
 function toggle() {
  const next = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#0a0e1a' : '#f4f6fb');
  try { localStorage.setItem('cadet-theme', next); } catch { /* Theme remains usable without storage. */ }
  window.dispatchEvent(new Event('cadet-theme'));
 }
 return <button type="button" onClick={toggle} className="btn btn-secondary theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>;
}
