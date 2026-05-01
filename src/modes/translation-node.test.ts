import { describe, expect, it } from 'vitest';
import { removeTranslations } from './translation-node';

describe('translation nodes', () => {
  it('removes inline translation nodes and clears the marker', () => {
    document.body.innerHTML = `<p data-hj="1">Hello <span class="hj-trans hj-trans-inline">你好</span></p>`;
    const p = document.querySelector('p')!;

    removeTranslations(p);

    expect(p.querySelector('.hj-trans')).toBeNull();
    expect((p as HTMLElement).dataset.hj).toBeUndefined();
  });
});
