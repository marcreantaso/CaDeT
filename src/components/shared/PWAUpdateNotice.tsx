import { useState, useSyncExternalStore } from 'react';
import { getPWAState, subscribePWA, installUpdate } from '../../pwa-setup';
export function PWAUpdateNotice() {
 const state = useSyncExternalStore(subscribePWA, getPWAState);
 const [later, setLater] = useState(false);
 const [busy, setBusy] = useState(false);
 const [dismissed, setDismissed] = useState(false);
 if (state.available) return <aside className="pwa-notice" aria-label="App update">
   {later ? <button className="btn btn-secondary" onClick={() => setLater(false)}>Update available</button> : <>
   <h2 className="text-base">A new CaDeT version is ready</h2>
   <p>Save your work first. Updating reloads the app and signs you out. Saved career records stay on this device. Other open CaDeT tabs may also reload.</p>
   {state.error && <p role="alert">{state.error}</p>}
   <div className="flex gap-3 mt-3"><button className="btn btn-primary" disabled={busy} onClick={async () => { setBusy(true); await installUpdate(); setBusy(false); }}>Update now</button><button className="btn btn-secondary" disabled={busy} onClick={() => setLater(true)}>Later</button></div></>}
 </aside>;
 if (dismissed || (!state.offlineReady && !state.error)) return null;
 return <aside className="pwa-notice" role="status"><p>{state.error || 'CaDeT is ready to use offline.'}</p><button className="btn btn-secondary mt-2" onClick={() => setDismissed(true)}>Dismiss</button></aside>;
}
