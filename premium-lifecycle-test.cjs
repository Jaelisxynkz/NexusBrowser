const api = require('../electron/premium-api.cjs');
const core = require('../electron/premium-core.cjs');
const { createHmac } = require('crypto');
const { rmSync } = require('fs');
const { join } = require('path');
process.chdir(join(__dirname, '..'));
try { rmSync('.nexus-data', { recursive: true, force: true }); } catch {}
core.load(); // fresh store
const A = (c, m) => { if (!c) { console.error('FAIL:', m); process.exitCode = 1; } else console.log('PASS:', m); };

(async () => {
  // 1. Account lifecycle
  A(api.register('user@nexus.test', 'Str0ngPass!x', 'Test User').ok, 'register');
  A(!api.register('user@nexus.test', 'Str0ngPass!x').ok, 'duplicate email rejected');
  A(!api.register('bademail', 'Str0ngPass!x').ok, 'invalid email rejected');
  A(!api.register('x@y.test', 'short').ok, 'short password rejected');
  const bad = api.authenticate('user@nexus.test', 'wrong');
  A(!bad.ok && bad.error, 'wrong password rejected');
  const sess = api.authenticate('user@nexus.test', 'Str0ngPass!x', { name: 'Test PC', platform: 'win32' });
  A(sess.ok && sess.token && sess.deviceId, 'login returns token + device');
  const tok = sess.token;
  A(tok.split('|').length === 3, 'token uses safe | separator');
  const who = api.authenticateToken(tok);
  A(who.ok && who.account.email === 'user@nexus.test', 'token auth works');

  // 2. Free entitlements before payment
  A(!api.checkEntitlement(tok, 'VPN_PREMIUM').entitled, 'free plan: VPN_PREMIUM locked');
  A(api.checkEntitlement(tok, 'VPN_PREMIUM').plan === 'free', 'plan reported as free');

  // 3. Checkout stays locked until verified payment
  const co = api.startCheckout(sess.account.id, 'premium');
  A(co.ok && co.checkoutId && co.provider === 'none-configured', 'checkout initiated (unpaid state, honest)');
  A(!api.checkEntitlement(tok, 'VPN_PREMIUM').entitled, 'NOT entitled before webhook');

  // 4. Forged webhook rejected
  A(!api.confirmPayment(co.checkoutId, { provider: 'stripe' }, JSON.stringify({ id: co.checkoutId }), 't=1,v1=deadbeef').ok, 'forged webhook signature rejected');

  // 5. Properly signed webhook (Stripe-style) activates the subscription
  const raw = JSON.stringify({ id: co.checkoutId, event: 'payment.succeeded' });
  const t = Date.now();
  const sig = 't=' + t + ',v1=' + createHmac('sha256', core.load().secret).update(t + '.' + raw).digest('hex');
  A(api.confirmPayment(co.checkoutId, { provider: 'stripe', amountCents: 999 }, raw, sig).ok, 'signed webhook accepted');

  // 6. Entitlements unlocked & correct per plan
  // NOTE: VPN_PREMIUM is NOT a premium entitlement — it's ultimate-only (see plans.ts).
  // Premium unlocks AI_PREMIUM, CLOUD_SYNC, ADVANCED_SECURITY, PREMIUM_THEMES, PREMIUM_AUDIO, ADVANCED_WORKSPACES.
  const e1 = api.checkEntitlement(tok, 'AI_PREMIUM');
  A(e1.entitled && e1.plan === 'premium', 'AI_PREMIUM granted after verified payment');
  A(!api.checkEntitlement(tok, 'VPN_PREMIUM').entitled, 'VPN_PREMIUM correctly NOT granted for premium (ultimate-only)');
  A(api.checkEntitlement(tok, 'PREMIUM_THEMES').entitled, 'PREMIUM_THEMES granted');
  A(api.checkEntitlement(tok, 'ADVANCED_WORKSPACES').entitled, 'ADVANCED_WORKSPACES granted');
  A(api.authenticateToken(tok).account.subscription?.planId === 'premium', 'account reports premium subscription');

  // 7. Devices
  const devs = api.listDevices(sess.account.id);
  A(devs.length === 1 && devs[0].name === 'Test PC', 'device listed');
  A(api.deviceAction(sess.account.id, 'rename', devs[0].id, 'Desktop').ok, 'device renamed');
  A(api.listDevices(sess.account.id)[0].name === 'Desktop', 'rename persisted');

  // 8. Cloud sync round-trip
  A(api.cloudPush(sess.account.id, 'bookmarks', [{ title: 'Nexus', url: 'https://nexus' }]).ok, 'cloud push');
  const pull = api.cloudPull(sess.account.id, 'bookmarks');
  A(pull.ok && pull.payload.length === 1, 'cloud pull returns payload');
  A(api.cloudList(sess.account.id).length === 1, 'cloud list');

  // 9. Billing history
  A(api.billingHistory(sess.account.id).length === 1, 'billing history records payment');

  // 10. Cancel -> canceling until period end, resume restores
  A(api.cancelSubscription(sess.account.id).ok, 'cancel accepted');
  A(api.checkEntitlement(tok, 'AI_PREMIUM').entitled, 'still entitled until period end (cancel at period end)');
  A(api.resumeSubscription(sess.account.id).ok, 'resume works');
  A(api.authenticateToken(tok).account.subscription.status === 'active', 'subscription active after resume');

  // 11. Password recovery
  const rec = api.requestRecovery('user@nexus.test');
  A(rec.ok && rec.recoveryCode, 'recovery code issued');
  A(!api.resetPassword('user@nexus.test', '000000', 'AnotherPass1!').ok, 'wrong recovery code rejected');
  A(api.resetPassword('user@nexus.test', rec.recoveryCode, 'AnotherPass1!').ok, 'password reset with valid code');
  A(api.authenticate('user@nexus.test', 'AnotherPass1!').ok, 'new password authenticates');

  // 12. Sign out invalidates token
  A(api.signOut(tok).ok, 'sign out');
  A(!api.authenticateToken(tok).ok, 'token dead after sign out');
  A(!api.checkEntitlement(tok, 'VPN_PREMIUM').entitled, 'entitlements gone after sign out');

  console.log('\nAll backend checks done. exitCode =', process.exitCode || 0);
  process.exit(process.exitCode || 0);
})().catch((e) => { console.error('ERROR:', e); process.exit(1); });
