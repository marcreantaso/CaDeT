import { registerSW } from 'virtual:pwa-register';
let state = { available: false, offlineReady: false, error: '' };
const listeners = new Set<() => void>();
export const subscribePWA = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getPWAState = () => state;
function publish(changes: Partial<typeof state>) { state = { ...state, ...changes }; listeners.forEach(fn => fn()); }
let update: ((reload?: boolean) => Promise<void>) | undefined;
let started = false;
export async function installUpdate() {
  try { await update?.(true); } catch { publish({ error: 'Could not apply the update. Reopen the app when online and try again.' }); }
}
export function setupPWA() {
  if (started || !('serviceWorker' in navigator)) return;
  started = true;
  update = registerSW({
    immediate: true,
    onNeedRefresh: () => publish({ available: true, error: '' }),
    onOfflineReady: () => publish({ offlineReady: true }),
    onRegisterError: () => publish({ error: 'Offline setup is unavailable. The app can still be used online.' }),
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      let checking = false;
      const check = async () => {
        if (checking || !navigator.onLine || document.visibilityState !== 'visible') return;
        checking = true;
        try {
          await registration.update();
          if (registration.waiting) publish({ available: true });
        } catch { /* Offline/transient errors should not interrupt the current version. */ }
        finally { checking = false; }
      };
      if (registration.waiting) publish({ available: true });
      window.setInterval(() => { void check(); }, 60 * 60 * 1000);
      window.addEventListener('online', () => { void check(); });
      document.addEventListener('visibilitychange', () => { void check(); });
      void check();
    },
  });
}
