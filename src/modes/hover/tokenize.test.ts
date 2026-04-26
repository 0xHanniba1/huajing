import { describe, it, expect, beforeEach } from 'vitest';
import { wrapWords, unwrapWords } from './tokenize';

beforeEach(() => { document.body.innerHTML = ''; });

describe('hover tokenize', () => {
  it('把英文单词包 .hj-hover-word', () => {
    document.body.innerHTML = `<p>Hello brave new world.</p>`;
    wrapWords(document.querySelector('p')!);
    const spans = document.querySelectorAll('.hj-hover-word');
    expect([...spans].map((s) => s.textContent)).toEqual(['Hello', 'brave', 'new', 'world']);
  });
  it('保留标点', () => {
    document.body.innerHTML = `<p>Hello, world!</p>`;
    wrapWords(document.querySelector('p')!);
    expect(document.querySelector('p')!.textContent).toBe('Hello, world!');
  });
  it('unwrap 还原', () => {
    document.body.innerHTML = `<p>Hello world</p>`;
    const p = document.querySelector('p')!;
    wrapWords(p);
    unwrapWords(p);
    expect(p.querySelector('.hj-hover-word')).toBeNull();
    expect(p.textContent).toBe('Hello world');
  });
});
