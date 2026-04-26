import { describe, it, expect, beforeEach } from 'vitest';
import { renderReplace, restoreReplace, restoreAllReplace } from './replace';

beforeEach(() => { document.body.innerHTML = ''; });

describe('replace renderer', () => {
  it('替换 textContent 并加 .hj-replaced', () => {
    document.body.innerHTML = `<p>Hello world</p>`;
    const p = document.querySelector('p')!;
    renderReplace(p, '你好世界');
    expect(p.textContent).toBe('你好世界');
    expect(p.classList.contains('hj-replaced')).toBe(true);
    expect((p as HTMLElement).dataset.hj).toBe('1');
  });
  it('restoreReplace 还原原文', () => {
    document.body.innerHTML = `<p>Hello world</p>`;
    const p = document.querySelector('p')!;
    renderReplace(p, '你好世界');
    restoreReplace(p);
    expect(p.textContent).toBe('Hello world');
    expect(p.classList.contains('hj-replaced')).toBe(false);
    expect((p as HTMLElement).dataset.hj).toBeUndefined();
  });
  it('restoreAllReplace 全文还原', () => {
    document.body.innerHTML = `<p>One</p><p>Two</p>`;
    document.querySelectorAll('p').forEach((p, i) => renderReplace(p, ['一', '二'][i]));
    restoreAllReplace();
    expect(Array.from(document.querySelectorAll('p')).map((p) => p.textContent)).toEqual(['One', 'Two']);
  });
});
