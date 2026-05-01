import { describe, it, expect, beforeEach } from 'vitest';
import { extractParagraphs } from './extract';

beforeEach(() => { document.body.innerHTML = ''; });

describe('extractParagraphs', () => {
  it('抓 <p> + <li> + <h2>', () => {
    document.body.innerHTML = `
      <article>
        <h2>Title of the section</h2>
        <p>First paragraph with content.</p>
        <ul><li>Bullet item one here</li><li>Bullet item two here</li></ul>
      </article>`;
    const ps = extractParagraphs(document.body);
    expect(ps.map((p) => p.text)).toEqual([
      'Title of the section',
      'First paragraph with content.',
      'Bullet item one here',
      'Bullet item two here',
    ]);
  });
  it('跳过 <code><pre><script><style>', () => {
    document.body.innerHTML = `
      <p>Real paragraph for translate.</p>
      <pre>some code here</pre>
      <code>inline code block</code>
      <script>const x = 1;</script>`;
    const ps = extractParagraphs(document.body);
    expect(ps.map((p) => p.text)).toEqual(['Real paragraph for translate.']);
  });
  it('跳过 data-hj 标记的节点', () => {
    document.body.innerHTML = `<p data-hj="1">Already touched paragraph</p><p>New paragraph here</p>`;
    const ps = extractParagraphs(document.body);
    expect(ps.map((p) => p.text)).toEqual(['New paragraph here']);
  });
  it('跳过中文段落', () => {
    document.body.innerHTML = `<p>你好世界今天天气真好啊</p><p>Hello world over here</p>`;
    const ps = extractParagraphs(document.body);
    expect(ps.map((p) => p.text)).toEqual(['Hello world over here']);
  });
  it('给每段一个稳定 id 与 hash', () => {
    document.body.innerHTML = `<p>One paragraph here</p><p>Two paragraph here</p>`;
    const ps = extractParagraphs(document.body);
    expect(ps[0]!.id).toBeTruthy();
    expect(ps[0]!.hash).toBeTruthy();
    expect(ps[0]!.id).not.toBe(ps[1]!.id);
  });
  it('includes the root node when it is itself a translatable block', () => {
    document.body.innerHTML = `<p>New dynamic paragraph here.</p>`;
    const p = document.querySelector('p')!;
    const ps = extractParagraphs(p);
    expect(ps.map((item) => item.text)).toEqual(['New dynamic paragraph here.']);
  });
  it('抓 X/Twitter tweetText div 正文', () => {
    document.body.innerHTML = `
      <article>
        <div data-testid="tweetText" lang="en">
          <span>My philosophy is curiosity &amp; adventure.</span>
        </div>
      </article>`;
    const ps = extractParagraphs(document.body);
    expect(ps.map((p) => p.text)).toEqual(['My philosophy is curiosity & adventure.']);
  });
});
