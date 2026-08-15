import { describe, expect, test } from 'bun:test';

import { isConfiguredHttpUrl } from './is-configured-http-url';

describe('isConfiguredHttpUrl', () => {
  test('accepts http and https URLs', () => {
    expect(isConfiguredHttpUrl('https://github.com/ghaly')).toBe(true);
    expect(isConfiguredHttpUrl('http://example.com')).toBe(true);
  });

  test('rejects missing, placeholder, and non-http values', () => {
    expect(isConfiguredHttpUrl(undefined)).toBe(false);
    expect(isConfiguredHttpUrl('')).toBe(false);
    expect(isConfiguredHttpUrl('#')).toBe(false);
    expect(isConfiguredHttpUrl('mailto:hi@example.com')).toBe(false);
    expect(isConfiguredHttpUrl('not-a-url')).toBe(false);
  });
});
