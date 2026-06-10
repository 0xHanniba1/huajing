import { afterEach, describe, expect, it, vi } from 'vitest';
import { send } from './rpc';

const originalRuntime = chrome.runtime;

afterEach(() => {
  (chrome as any).runtime = originalRuntime;
});

describe('rpc send', () => {
  it('throws when the background replies with an error envelope', async () => {
    chrome.runtime.sendMessage = vi.fn(async () => ({ error: 'boom' }));

    await expect(send({ type: 'test-connection', engineId: 'deepseek' })).rejects.toThrow('boom');
  });

  it('throws a clear error when extension messaging is unavailable', async () => {
    (chrome as any).runtime = undefined;

    await expect(send({ type: 'test-connection', engineId: 'deepseek' }))
      .rejects.toThrow('扩展消息通道不可用');
  });

  it('throws a clear error when Chrome invalidates the extension context', async () => {
    chrome.runtime.sendMessage = vi.fn(async () => {
      throw new Error('Extension context invalidated.');
    });

    await expect(send({ type: 'test-connection', engineId: 'deepseek' }))
      .rejects.toThrow('扩展已重新加载，请刷新当前页面');
  });
});
