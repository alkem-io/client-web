import { afterAll } from 'vitest';

export interface SessionStorageMock extends Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  clear: () => void;
}

const createSessionStorageMock = (): SessionStorageMock => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

export const createSessionStorageMockInstance = (): SessionStorageMock => createSessionStorageMock();

const defineSessionStorage = (target: object, storage: SessionStorageMock) => {
  Object.defineProperty(target, 'sessionStorage', {
    value: storage,
    configurable: true,
    writable: true,
    enumerable: true,
  });
};

export const sessionStorageMock = createSessionStorageMock();

let restoreOriginal: (() => void) | null = null;
let installed = false;

const installSessionStorageMock = () => {
  if (installed) {
    return;
  }

  const host = globalThis as typeof globalThis & { sessionStorage?: Storage };
  const originalDescriptor = Object.getOwnPropertyDescriptor(host, 'sessionStorage');

  defineSessionStorage(host, sessionStorageMock);
  if (globalThis.window !== undefined) {
    defineSessionStorage(globalThis.window as Window & { sessionStorage?: Storage }, sessionStorageMock);
  }

  restoreOriginal = () => {
    if (originalDescriptor) {
      Object.defineProperty(host, 'sessionStorage', originalDescriptor);
    } else {
      Reflect.deleteProperty(host, 'sessionStorage');
    }
  };

  installed = true;
};

installSessionStorageMock();

afterAll(() => {
  if (!installed || !restoreOriginal) {
    return;
  }

  try {
    restoreOriginal();
  } catch {
    // ignore restoration errors to avoid masking test failures
  } finally {
    installed = false;
    restoreOriginal = null;
  }
});

export const resetSessionStorageMock = () => {
  sessionStorageMock.clear();
};

export const setSessionStorageImplementation = (storage: SessionStorageMock) => {
  defineSessionStorage(globalThis as typeof globalThis & { sessionStorage?: Storage }, storage);
  if (globalThis.window !== undefined) {
    defineSessionStorage(globalThis.window as Window & { sessionStorage?: Storage }, storage);
  }
};
