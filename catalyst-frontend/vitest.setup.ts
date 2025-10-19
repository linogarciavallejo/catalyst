import { afterEach, vi, beforeAll } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock fetch globally to prevent real network requests
beforeAll(() => {
  global.fetch = vi.fn().mockRejectedValue(new Error('Fetch not mocked in tests'));
});

// Mock WebSocket to prevent connection attempts
class MockWebSocket {
  constructor() {
    console.warn('[TEST] WebSocket constructor called - mocking connection');
  }
  addEventListener() {}
  removeEventListener() {}
  send() {}
  close() {}
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = MockWebSocket.CLOSED;
}
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

// Cleanup after each test case
afterEach(() => {
  vi.clearAllMocks();
});
