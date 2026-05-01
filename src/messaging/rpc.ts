import { Msg, MsgResult } from './types';

const MESSAGING_UNAVAILABLE_MESSAGE = '扩展消息通道不可用，请刷新页面或重新加载化境扩展';

export async function send<T extends Msg['type']>(
  msg: Extract<Msg, { type: T }>
): Promise<MsgResult[T]> {
  const sendMessage = getRuntimeSendMessage();
  const result = await sendMessage(msg);
  if (isErrorEnvelope(result)) throw new Error(result.error);
  return result;
}

export function onMessage(
  handler: <T extends Msg['type']>(msg: Extract<Msg, { type: T }>) => Promise<MsgResult[T]>
): void {
  chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
    Promise.resolve(handler(msg as any)).then(reply, (err) => reply({ error: String(err) }));
    return true;
  });
}

export async function broadcastToTabs(msg: Msg): Promise<void> {
  const tabs = await chrome.tabs.query({});
  await Promise.all(tabs.map((t) => t.id ? chrome.tabs.sendMessage(t.id, msg).catch(() => {}) : Promise.resolve()));
}

function isErrorEnvelope(value: unknown): value is { error: string } {
  return !!value
    && typeof value === 'object'
    && Object.keys(value).length === 1
    && typeof (value as { error?: unknown }).error === 'string';
}

function getRuntimeSendMessage(): (msg: Msg) => Promise<unknown> {
  const runtime = (globalThis as {
    chrome?: {
      runtime?: {
        sendMessage?: (msg: Msg) => Promise<unknown>;
      };
    };
  }).chrome?.runtime;

  if (typeof runtime?.sendMessage !== 'function') {
    throw new Error(MESSAGING_UNAVAILABLE_MESSAGE);
  }

  return runtime.sendMessage.bind(runtime);
}
