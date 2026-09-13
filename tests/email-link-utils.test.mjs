import assert from 'node:assert/strict';
import { normalizeEmailAddress, buildEmailLinkContinuationUrl, isSafeEmailLinkContinuationUrl } from '../public/js/core/email-link-utils.mjs';

assert.equal(normalizeEmailAddress('  User@Example.com  '), 'user@example.com');
assert.equal(buildEmailLinkContinuationUrl({ origin: 'https://example.com', path: 'login.html' }), 'https://example.com/login.html?mode=email-link');
assert.ok(isSafeEmailLinkContinuationUrl('https://example.com/login.html?mode=email-link'));
assert.equal(isSafeEmailLinkContinuationUrl('javascript:alert(1)'), false);
console.log('email-link-utils test passed');
