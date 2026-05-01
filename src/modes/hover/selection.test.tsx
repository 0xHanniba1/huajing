import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindSelection, isSingleLookupWord } from './selection';

const { clearMock, renderMock, sendMock } = vi.hoisted(() => ({
  clearMock: vi.fn(),
  renderMock: vi.fn(),
  sendMock: vi.fn(async (msg: any) => {
    if (msg.type === 'translate-batch') {
      return { translations: msg.texts.map((text: string) => `zh:${text}`) };
    }
    return { ok: true };
  }),
}));

vi.mock('../../ui/overlay-root', () => ({
  ensureOverlay: () => ({ clear: clearMock, render: renderMock }),
}));

vi.mock('../../messaging/rpc', () => ({
  send: sendMock,
}));

afterEach(() => {
  document.body.innerHTML = '';
  clearMock.mockClear();
  renderMock.mockClear();
  sendMock.mockClear();
  vi.restoreAllMocks();
});

describe('selection controller', () => {
  it('detects single English words for dictionary lookup', () => {
    expect(isSingleLookupWord('philosophy')).toBe(true);
    expect(isSingleLookupWord('My philosophy')).toBe(false);
    expect(isSingleLookupWord('123')).toBe(false);
  });

  it('returns cleanup that removes document listeners', () => {
    const cleanup = bindSelection(() => 'zh-CN') as unknown as () => void;

    cleanup();
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    expect(clearMock).not.toHaveBeenCalled();
  });

  it('does not clear the overlay when mousedown originates inside a shadow overlay control', () => {
    const cleanup = bindSelection(() => 'zh-CN') as unknown as () => void;
    const host = document.createElement('huajing-overlay');
    const bubble = document.createElement('div');
    bubble.className = 'hj-sel-panel';
    const button = document.createElement('button');
    bubble.appendChild(button);
    document.body.appendChild(host);

    const event = new MouseEvent('mousedown', { bubbles: true, composed: true });
    Object.defineProperty(event, 'composedPath', {
      value: () => [button, bubble, host, document, window],
    });
    host.dispatchEvent(event);

    expect(clearMock).not.toHaveBeenCalled();

    cleanup();
    host.remove();
  });

  it('inserts phrase translation immediately after the selected text', async () => {
    document.body.innerHTML = `<article><p>Custom Timelines powered by Grok; endless noise.</p></article>`;
    const textNode = document.querySelector('p')!.firstChild!;
    const selected = 'Custom Timelines powered by Grok';
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, selected.length);
    (range as Range & { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () => ({
      left: 10, top: 20, width: 120, height: 20, right: 130, bottom: 40, x: 10, y: 20, toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => selected,
      rangeCount: 1,
      getRangeAt: () => range,
    } as unknown as Selection);

    const cleanup = bindSelection(() => 'zh-CN') as unknown as () => void;
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(renderMock).toHaveBeenCalled();
    const bubble = renderMock.mock.calls[0][0];
    expect(bubble.props.kind).toBe('text');
    expect(bubble.props.showTranslateResult).toBe(false);

    await bubble.props.onTranslate();

    const trans = document.querySelector('.hj-trans')!;
    expect(sendMock).toHaveBeenCalledWith({
      type: 'translate-batch',
      texts: [selected],
      targetLang: 'zh-CN',
    });
    expect(trans.textContent).toBe(`(zh:${selected})`);
    expect(trans.previousSibling?.textContent).toContain(selected);
    expect(trans.nextSibling?.textContent).toContain('; endless noise.');
    expect(clearMock).toHaveBeenCalled();

    cleanup();
  });

  it('stores pronunciation and definitions when adding a looked-up word to vocab', async () => {
    document.body.innerHTML = `<p>disrupt</p>`;
    const textNode = document.querySelector('p')!.firstChild!;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 'disrupt'.length);
    (range as Range & { getBoundingClientRect: () => DOMRect }).getBoundingClientRect = () => ({
      left: 10, top: 20, width: 80, height: 20, right: 90, bottom: 40, x: 10, y: 20, toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(window, 'getSelection').mockReturnValue({
      toString: () => 'disrupt',
      rangeCount: 1,
      getRangeAt: () => range,
    } as unknown as Selection);

    const cleanup = bindSelection(() => 'zh-CN') as unknown as () => void;
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const bubble = renderMock.mock.calls[0][0];
    await bubble.props.onAddVocab({
      word: 'disrupt',
      ipa: "/dIs'rupt/",
      defs: [{ pos: 'v.', text: '扰乱；使中断；使混乱' }],
    });

    expect(sendMock).toHaveBeenCalledWith({
      type: 'add-vocab',
      entry: expect.objectContaining({
        word: 'disrupt',
        status: 'new',
        ipa: "/dIs'rupt/",
        defs: [{ pos: 'v.', text: '扰乱；使中断；使混乱' }],
        context: 'disrupt',
      }),
    });

    cleanup();
  });
});
