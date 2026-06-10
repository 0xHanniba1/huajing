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
        const changes: Record<string, { oldValue?: unknown; newValue: unknown }> = {};
        for (const [k, v] of Object.entries(items)) {
          changes[k] = { oldValue: storageData[k], newValue: v };
        }
        Object.assign(storageData, items);
        listeners.forEach((fn) => fn(changes, 'local'));
      },
      remove: async (keys: string | string[]) => {
        const ks = Array.isArray(keys) ? keys : [keys];
        ks.forEach((k) => delete storageData[k]);
      },
      clear: async () => { for (const k of Object.keys(storageData)) delete storageData[k]; },
    },
    onChanged: {
      addListener: (fn: any) => listeners.push(fn),
      removeListener: (fn: any) => {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      },
    },
  },
  runtime: {
    sendMessage: async () => undefined,
    onMessage: { addListener: () => {} },
    getURL: (p: string) => `chrome-extension://test/${p}`,
    getManifest: () => ({ version: '0.0.0-test' }),
  },
};
const listeners: any[] = [];

beforeEach(() => {
  for (const k of Object.keys(storageData)) delete storageData[k];
  listeners.length = 0;
});
