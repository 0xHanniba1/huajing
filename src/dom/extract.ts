import { fnvHash } from './hash';
import { shouldTranslate } from './language';

export type Paragraph = {
  id: string;
  el: Element;
  text: string;
  hash: string;
};

const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dt, dd, figcaption, td';
const SKIP_ANCESTORS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'KBD', 'SAMP', 'TEXTAREA']);

let counter = 0;

export function extractParagraphs(root: ParentNode = document.body): Paragraph[] {
  const out: Paragraph[] = [];
  const els = root.querySelectorAll(BLOCK_SELECTOR);
  for (const el of els) {
    if ((el as HTMLElement).dataset?.hj) continue;
    if (hasSkipAncestor(el)) continue;
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!shouldTranslate(text)) continue;
    let id = (el as HTMLElement).dataset.hjId;
    if (!id) {
      id = `hj${++counter}`;
      (el as HTMLElement).dataset.hjId = id;
    }
    out.push({ id, el, text, hash: fnvHash(text) });
  }
  return out;
}

function hasSkipAncestor(el: Element): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_ANCESTORS.has(cur.tagName)) return true;
    cur = cur.parentElement;
  }
  return false;
}
