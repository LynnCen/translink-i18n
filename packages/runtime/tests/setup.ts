import { vi } from 'vitest';

// Mock DOM APIs for Node.js environment
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
});

// Mock fetch API
global.fetch = vi.fn();

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
  },
  writable: true,
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();

  // Reset localStorage mock
  const localStorage = window.localStorage;
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  localStorage.clear.mockClear();

  // Reset sessionStorage mock
  const sessionStorage = window.sessionStorage;
  sessionStorage.getItem.mockClear();
  sessionStorage.setItem.mockClear();
  sessionStorage.removeItem.mockClear();
  sessionStorage.clear.mockClear();

  // Reset fetch mock
  global.fetch.mockClear();
});

// Test utilities
export const createMockTranslationResource = (
  translations: Record<string, string>
) => {
  return translations;
};

export const createMockI18nOptions = (overrides = {}) => {
  return {
    defaultLanguage: 'zh-CN',
    fallbackLanguage: 'zh-CN',
    supportedLanguages: ['zh-CN', 'en-US'],
    resources: {
      'zh-CN': {
        welcome: '欢迎使用',
        greeting: '你好，{{name}}！',
        user: {
          profile: '用户资料',
          settings: '设置',
        },
      },
      'en-US': {
        welcome: 'Welcome',
        greeting: 'Hello, {{name}}!',
        user: {
          profile: 'User Profile',
          settings: 'Settings',
        },
      },
    },
    cache: {
      enabled: true,
      maxSize: 100,
      ttl: 5000,
      storage: 'memory',
    },
    ...overrides,
  };
};

export const waitForNextTick = () =>
  new Promise(resolve => setTimeout(resolve, 0));
