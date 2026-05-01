import { afterEach, describe, expect, it, vi } from 'vitest';
import { send } from './rpc';

const originalSendMessage = chrome.runtime.sendMessage;

afterEach(() => {
  chrome.runtime.sendMessage = originalSendMessage;
});

describe('rpc send', () => {
  it('throws when the background replies with an error envelope', async () => {
    chrome.runtime.sendMessage = vi.fn(async () => ({ error: 'boom' }));

    await expect(send({ type: 'test-connection', engineId: 'deepseek' })).rejects.toThrow('boom');
  });
});
