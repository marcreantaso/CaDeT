import { db } from './db';
export interface LocalAccount { id: string; username: string; salt: string; hash: string; }
const hex = (bytes: Uint8Array) => Array.from(bytes, x => x.toString(16).padStart(2, '0')).join('');
async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 600000, hash: 'SHA-256' }, key, 256)));
}
export async function registerLocal(username: string, password: string, fullName: string, claimLegacy = false) {
  username = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,32}$/.test(username)) throw new Error('Username must contain 3–32 letters, numbers, or underscores.');
  if (password.length < 12 || password.length > 128) throw new Error('Use a password of 12–128 characters.');
  if (!fullName.trim() || fullName.length > 100) throw new Error('Enter your name (up to 100 characters).');
  const salt = hex(crypto.getRandomValues(new Uint8Array(32)));
  const hash = await derive(password, salt);
  return db.transaction('rw', db.accounts, db.profiles, async () => {
    if (await db.accounts.where('username').equals(username).first()) throw new Error('That username is already in use on this device.');
    const legacy = await db.profiles.get('local-user-1');
    if (claimLegacy && (!legacy || await db.accounts.get('local-user-1'))) throw new Error('The previous workspace is unavailable or already claimed.');
    const id = claimLegacy ? 'local-user-1' : crypto.randomUUID();
    const now = new Date().toISOString();
    await db.accounts.add({ id, username, salt, hash });
    await db.profiles.put({ ...(claimLegacy ? legacy : undefined), id, userId: id, fullName: fullName.trim(), preferredIndustries: legacy && claimLegacy ? legacy.preferredIndustries : [], onboardingCompleted: claimLegacy ? !!legacy?.onboardingCompleted : false, onboardingStep: claimLegacy ? legacy?.onboardingStep ?? 0 : 0, createdAt: claimLegacy ? legacy!.createdAt : now, updatedAt: now });
    return id;
  });
}
export async function verifyLocal(username: string, password: string) {
  const account = await db.accounts.where('username').equals(username.trim().toLowerCase()).first();
  const hash = await derive(password.slice(0, 128), account?.salt ?? 'unregistered-account');
  if (!account || account.hash !== hash || password.length > 128) throw new Error('Incorrect username or password.');
  return account.id;
}
