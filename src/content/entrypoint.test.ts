import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, Settings } from '../store/types';

const getSettingsMock = vi.fn();
const patchSettingsMock = vi.fn();
const activateMock = vi.fn(async () => {});
const deactivateMock = vi.fn();
const rerenderMock = vi.fn();

vi.mock('../store/storage', () => ({
  getSettings: getSettingsMock,
  patchSettings: patchSettingsMock,
}));

vi.mock('./coordinator', () => ({
  activate: activateMock,
  deactivate: deactivateMock,
  rerender: rerenderMock,
}));

function makeSettings(patch: Partial<Settings> = {}): Settings {
  return {
    ...DEFAULT_SETTINGS,
    engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs },
    ...patch,
  };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('content entrypoint', () => {
  it('starts the selection tool whenever the extension is enabled', async () => {
    let listener: ((msg: any) => void) | undefined;
    (globalThis as any).defineContentScript = (definition: unknown) => definition;
    chrome.runtime.onMessage.addListener = vi.fn((fn) => { listener = fn as (msg: any) => void; });
    window.history.pushState({}, '', '/article');

    getSettingsMock.mockResolvedValue(makeSettings({
      enabled: true,
      mode: 'hover',
      autoSites: [],
    }));

    const mod = await import('../../entrypoints/content');
    await mod.default.main({} as never);

    expect(activateMock).toHaveBeenCalledWith(expect.objectContaining({ mode: 'hover' }), 'hover');

    listener?.({
      type: 'settings-changed',
      settings: makeSettings({
        enabled: true,
        mode: 'hover',
        autoSites: [],
      }),
    });

    expect(activateMock).toHaveBeenLastCalledWith(expect.objectContaining({ mode: 'hover' }), 'hover');
    expect(rerenderMock).toHaveBeenCalledWith(expect.objectContaining({ mode: 'hover' }));
  });

  it('stops the selection tool when the extension is disabled', async () => {
    let listener: ((msg: any) => void) | undefined;
    (globalThis as any).defineContentScript = (definition: unknown) => definition;
    chrome.runtime.onMessage.addListener = vi.fn((fn) => { listener = fn as (msg: any) => void; });
    window.history.pushState({}, '', '/article');

    getSettingsMock.mockResolvedValue(makeSettings({ enabled: true, mode: 'hover', autoSites: [] }));

    const mod = await import('../../entrypoints/content');
    await mod.default.main({} as never);
    vi.clearAllMocks();

    listener?.({
      type: 'settings-changed',
      settings: makeSettings({ enabled: false, mode: 'hover', autoSites: [] }),
    });

    expect(deactivateMock).toHaveBeenCalledTimes(1);
    expect(activateMock).not.toHaveBeenCalled();
  });

  it('does not respond to keyboard command messages', async () => {
    let listener: ((msg: any) => void) | undefined;
    (globalThis as any).defineContentScript = (definition: unknown) => definition;
    chrome.runtime.onMessage.addListener = vi.fn((fn) => { listener = fn as (msg: any) => void; });
    window.history.pushState({}, '', '/article');

    getSettingsMock.mockResolvedValue(makeSettings({
      enabled: true,
      mode: 'hover',
      autoSites: [],
    }));

    const mod = await import('../../entrypoints/content');
    await mod.default.main({} as never);
    vi.clearAllMocks();

    listener?.({ type: 'cmd-toggle' });
    listener?.({ type: 'cmd-cycle-mode' });

    expect(deactivateMock).not.toHaveBeenCalled();
    expect(activateMock).not.toHaveBeenCalled();
    expect(patchSettingsMock).not.toHaveBeenCalled();
  });
});
