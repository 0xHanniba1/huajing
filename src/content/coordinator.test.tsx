import { afterEach, describe, expect, it, vi } from 'vitest';
import { activate, deactivate } from './coordinator';
import { DEFAULT_SETTINGS, Settings } from '../store/types';

const { sendMock } = vi.hoisted(() => {
  const sendMock = vi.fn(async (msg: any) => {
    if (msg.type === 'translate-batch') {
      return { translations: msg.texts.map((text: string) => `zh:${text}`) };
    }
    return { ok: true };
  });
  return { sendMock };
});

vi.mock('../messaging/rpc', () => ({ send: sendMock }));

const settings: Settings = {
  ...DEFAULT_SETTINGS,
  engineConfigs: { ...DEFAULT_SETTINGS.engineConfigs },
};

afterEach(() => {
  deactivate();
  document.body.innerHTML = '';
  sendMock.mockClear();
});

describe('content coordinator', () => {
  it('does not wrap page words in selection-only mode', async () => {
    document.body.innerHTML = `<main><p>Hello brave new world.</p></main>`;

    await activate(settings, 'hover');

    expect(document.querySelectorAll('.hj-hover-word')).toHaveLength(0);
    expect(document.body.textContent).toBe('Hello brave new world.');
  });

  it('does not translate paragraphs automatically', async () => {
    document.body.innerHTML = `<main><p>Repeated paragraph with enough words.</p></main>`;

    await activate(settings, 'hover');

    expect(sendMock).not.toHaveBeenCalled();
    expect(document.querySelectorAll('.hj-trans')).toHaveLength(0);
  });
});
