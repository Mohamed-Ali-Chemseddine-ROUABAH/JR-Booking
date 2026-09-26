import assert from 'node:assert/strict';
import { normalizeEmailAddress, buildEmailLinkContinuationUrl, buildPublicProfileReturnTo, sanitizeAuthReturnTo, isSafeEmailLinkContinuationUrl } from '../public/js/core/email-link-utils.mjs';

assert.equal(normalizeEmailAddress('  User@Example.com  '), 'user@example.com');
assert.equal(buildEmailLinkContinuationUrl({ origin: 'https://example.com', path: 'login.html' }), 'https://example.com/login.html?mode=email-link');
assert.ok(isSafeEmailLinkContinuationUrl('https://example.com/login.html?mode=email-link', 'https://example.com'));
const bookingReturnTo = buildPublicProfileReturnTo({ origin: 'https://example.com', profileId: 'professional-1', serviceId: 2, date: '2026-10-05', start: '09:30' });
assert.equal(bookingReturnTo, 'profile.html?pro=professional-1&service=2&requestedDate=2026-10-05&requestedStart=09%3A30');
assert.equal(sanitizeAuthReturnTo(bookingReturnTo, 'https://example.com'), bookingReturnTo);
assert.ok(isSafeEmailLinkContinuationUrl(`https://example.com/login.html?mode=email-link&returnTo=${encodeURIComponent(bookingReturnTo)}`, 'https://example.com'));
assert.equal(sanitizeAuthReturnTo('//evil.example/profile.html?pro=professional-1', 'https://example.com'), null);
assert.equal(sanitizeAuthReturnTo('https://evil.example/profile.html?pro=professional-1', 'https://example.com'), null);
assert.equal(sanitizeAuthReturnTo('profile.html?pro=professional-1&clientEmail=victim%40example.com', 'https://example.com'), null);
assert.equal(sanitizeAuthReturnTo('profile.html?pro=professional-1&pro=another-profile', 'https://example.com'), null);
assert.equal(buildPublicProfileReturnTo({ origin: 'https://example.com', profileId: 'professional-1', date: '2026-02-30' }), null);
assert.equal(buildPublicProfileReturnTo({ origin: 'https://example.com', profileId: 'professional-1', date: '2026-10-05', start: '24:00' }), null);
assert.equal(isSafeEmailLinkContinuationUrl('javascript:alert(1)'), false);
console.log('email-link-utils test passed');
