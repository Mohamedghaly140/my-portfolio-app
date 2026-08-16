import { beforeEach, describe, expect, mock, test } from 'bun:test';

const shareMock = mock(() => Promise.resolve({ action: 'sharedAction' }));

// Include AppState/Platform so this mock.module does not break other test
// files that also stub react-native (bun applies module mocks globally).
mock.module('react-native', () => ({
  AppState: { addEventListener: mock(() => ({ remove: mock() })) },
  Platform: { OS: 'ios' },
  Share: {
    share: shareMock,
  },
}));

describe('shareProject', () => {
  beforeEach(() => {
    shareMock.mockClear();
  });

  test('shares the canonical project URL (strips trailing slash)', async () => {
    process.env.EXPO_PUBLIC_SITE_URL = 'https://moghaly.com/';
    const { shareProject } = await import('./share');
    shareProject('orth-app');
    expect(shareMock).toHaveBeenCalledTimes(1);
    expect(shareMock).toHaveBeenCalledWith({
      message: 'https://moghaly.com/projects/orth-app',
      url: 'https://moghaly.com/projects/orth-app',
    });
  });

  test('no-ops when EXPO_PUBLIC_SITE_URL is unset', async () => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
    const { shareProject } = await import('./share');
    shareProject('orth-app');
    expect(shareMock).not.toHaveBeenCalled();
  });
});

describe('shareBlogPost', () => {
  beforeEach(() => {
    shareMock.mockClear();
  });

  test('shares the canonical blog URL (strips trailing slash)', async () => {
    process.env.EXPO_PUBLIC_SITE_URL = 'https://moghaly.com/';
    const { shareBlogPost } = await import('./share');
    shareBlogPost('hello-world');
    expect(shareMock).toHaveBeenCalledTimes(1);
    expect(shareMock).toHaveBeenCalledWith({
      message: 'https://moghaly.com/blog/hello-world',
      url: 'https://moghaly.com/blog/hello-world',
    });
  });

  test('no-ops when EXPO_PUBLIC_SITE_URL is unset', async () => {
    delete process.env.EXPO_PUBLIC_SITE_URL;
    const { shareBlogPost } = await import('./share');
    shareBlogPost('hello-world');
    expect(shareMock).not.toHaveBeenCalled();
  });
});
