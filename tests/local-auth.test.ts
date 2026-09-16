import 'fake-indexeddb/auto';
import assert from 'node:assert/strict';
import { test, beforeEach, after } from 'node:test';
import { db } from '../src/lib/db';
import { registerLocal, verifyLocal } from '../src/lib/localAuth';
beforeEach(async () => { await db.delete(); await db.open(); });
after(async () => { await db.delete(); });
test('password verification, normalized usernames, and separate profiles', async () => {
 const a = await registerLocal('Alice', 'correct-password-123', 'Alice');
 const b = await registerLocal('bob', 'different-password-123', 'Bob');
 assert.notEqual(a,b);
 assert.equal(await verifyLocal(' ALICE ', 'correct-password-123'), a);
 await assert.rejects(verifyLocal('alice', 'wrong-password'));
 await assert.rejects(registerLocal('ALICE', 'correct-password-123', 'Duplicate'));
 const saved = await db.accounts.get(a);
 assert.notEqual(saved?.hash, 'correct-password-123');
 assert.equal('password' in saved!, false);
 assert.equal((await db.profiles.get(b))?.fullName, 'Bob');
 db.close(); await db.open();
 assert.equal(await verifyLocal('bob', 'different-password-123'), b);
});
test('legacy data is preserved and claimed only explicitly, once', async () => {
 const now = new Date().toISOString();
 await db.profiles.add({id:'local-user-1',userId:'local-user-1',fullName:'Previous',preferredIndustries:[],onboardingCompleted:true,onboardingStep:6,createdAt:now,updatedAt:now});
 const fresh = await registerLocal('fresh','correct-password-123','Fresh');
 assert.notEqual(fresh, 'local-user-1');
 assert.equal((await db.profiles.get('local-user-1'))?.fullName, 'Previous');
 assert.equal(await registerLocal('owner','correct-password-123','Owner',true),'local-user-1');
 assert.equal((await db.profiles.get('local-user-1'))?.onboardingCompleted,true);
 await assert.rejects(registerLocal('other','correct-password-123','Other',true));
});
test('invalid usernames and weak passwords do not create accounts', async () => {
 await assert.rejects(registerLocal('a!','correct-password-123','Name'));
 await assert.rejects(registerLocal('valid','short','Name'));
 assert.equal(await db.accounts.count(),0);
});
