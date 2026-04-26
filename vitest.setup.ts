import 'fake-indexeddb/auto';

// minimal chrome.* shim — individual tests can override per-key
const storageData: Record<string, unknown> = {};
(globalThis as any).chrome = {
  storage: {
    local: {
      get: async (keys?: string | string[] | null) => {
        if (!keys) return { ...storageData };
        const ks = Array.isArray(keys) ? keys : [keys];
        return Object.fromEntries(ks.map((k) => [k, storageData[k]]));
      },
      set: async (items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        listeners.forEach((fn) => fn(items, 'local'));
      },
      remove: async (keys: string | string[]) => {
        const ks = Array.isArray(keys) ? keys : [keys];
        ks.forEach((k) => delete storageData[k]);
      },
      clear: async () => { for (const k of Object.keys(storageData)) delete storageData[k]; },
    },
    onChanged: { addListener: (fn: any) => listeners.push(fn) },
  },
  runtime: {
    sendMessage: async () => undefined,
    onMessage: { addListener: () => {} },
    getURL: (p: string) => `chrome-extension://test/${p}`,
  },
};
const listeners: any[] = [];

beforeEach(() => {
  for (const k of Object.keys(storageData)) delete storageData[k];
  listeners.length = 0;
});
