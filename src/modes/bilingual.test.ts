import { describe, it, expect, beforeEach } from 'vitest';
import { renderBilingual, removeBilingual } from './bilingual';

beforeEach(() => { document.body.innerHTML = ''; });

describe('bilingual renderer', () => {
  it('在段落末尾追加 .hj-trans 节点', () => {
    document.body.innerHTML = `<p data-hj-id="hj1">Hello world</p>`;
    const p = document.querySelector('p')!;
    renderBilingual(p, '你好世界', { divider: 'solid', color: '#2b6cb0', fontSize: 15 });
    const span = p.querySelector('.hj-trans')!;
    expect(span.textContent).toBe('你好世界');
    expect(span.getAttribute('data-divider')).toBe('solid');
    expect((p as HTMLElement).dataset.hj).toBe('1');
  });
  it('重复渲染替换原 .hj-trans，不重复', () => {
    document.body.innerHTML = `<p>Hello</p>`;
    const p = document.querySelector('p')!;
    renderBilingual(p, '你好', { divider: 'solid', color: '#000', fontSize: 14 });
    renderBilingual(p, '世界', { divider: 'dashed', color: '#000', fontSize: 14 });
    const spans = p.querySelectorAll('.hj-trans');
    expect(spans.length).toBe(1);
    expect(spans[0].textContent).toBe('世界');
    expect(spans[0].getAttribute('data-divider')).toBe('dashed');
  });
  it('removeBilingual 还原干净', () => {
    document.body.innerHTML = `<p>Hello</p>`;
    const p = document.querySelector('p')!;
    renderBilingual(p, '你好', { divider: 'solid', color: '#000', fontSize: 14 });
    removeBilingual(p);
    expect(p.querySelector('.hj-trans')).toBeNull();
    expect((p as HTMLElement).dataset.hj).toBeUndefined();
  });
});
