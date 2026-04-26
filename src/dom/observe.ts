import { extractParagraphs, Paragraph } from './extract';

export function observeNewParagraphs(
  root: HTMLElement,
  onAdded: (paragraphs: Paragraph[]) => void
): () => void {
  let pending: Set<Element> = new Set();
  let timer: number | null = null;

  const flush = () => {
    timer = null;
    const adds: Paragraph[] = [];
    for (const el of pending) {
      adds.push(...extractParagraphs(el));
    }
    pending.clear();
    if (adds.length) onAdded(adds);
  };

  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const el = node as Element;
        if ((el as HTMLElement).dataset?.hj === '1') continue;
        if (el.closest('huajing-overlay')) continue;
        pending.add(el);
      }
    }
    if (timer == null) timer = setTimeout(flush, 120) as unknown as number;
  });

  obs.observe(root, { childList: true, subtree: true });
  return () => { obs.disconnect(); if (timer) clearTimeout(timer); };
}
