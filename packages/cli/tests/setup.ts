import { vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

// Mock file system operations
vi.mock('node:fs/promises');

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset console mocks
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();
});

afterEach(() => {
  // Restore console
  Object.assign(console, originalConsole);
});

// Test utilities
export const createMockFile = (content: string) => {
  return Promise.resolve(content);
};

export const createMockDirectory = (files: Record<string, string>) => {
  const mockFs = vi.mocked(fs);
  
  mockFs.readFile.mockImplementation((filePath: string) => {
    const normalizedPath = path.normalize(filePath.toString());
    const fileName = path.basename(normalizedPath);
    
    if (files[fileName]) {
      return Promise.resolve(files[fileName]);
    }
    
    throw new Error(`File not found: ${filePath}`);
  });
  
  mockFs.writeFile.mockResolvedValue(undefined);
  mockFs.mkdir.mockResolvedValue(undefined);
};

export const expectConsoleOutput = (method: 'log' | 'error' | 'warn' | 'info', message: string) => {
  expect(console[method]).toHaveBeenCalledWith(expect.stringContaining(message));
};
