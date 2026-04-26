import { Msg, MsgResult } from './types';

export async function send<T extends Msg['type']>(
  msg: Extract<Msg, { type: T }>
): Promise<MsgResult[T]> {
  return chrome.runtime.sendMessage(msg);
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
