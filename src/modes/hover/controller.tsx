import React from 'react';
import { ensureOverlay } from '../../ui/overlay-root';
import { LookupCard } from '../../ui/LookupCard';
import { send } from '../../messaging/rpc';
import { DictEntry } from '../../dict/types';

let timer: number | null = null;
let activeWord: string | null = null;

export function bindHover(root: HTMLElement, onAddVocab: (entry: DictEntry, ctxText: string) => void) {
  root.addEventListener('mouseover', (e) => {
    const t = e.target as HTMLElement;
    if (!t.classList?.contains('hj-hover-word')) return;
    if (timer) clearTimeout(timer);
    const word = t.textContent || '';
    timer = setTimeout(async () => {
      activeWord = word;
      const r = t.getBoundingClientRect();
      const { entry } = await send({ type: 'lookup-word', word });
      if (!entry || activeWord !== word) return;
      const ctx = (t.closest('p,li,blockquote,td') as HTMLElement | null)?.textContent || '';
      ensureOverlay().render(
        <LookupCard
          entry={entry}
          x={r.left + window.scrollX}
          y={r.bottom + window.scrollY + 6}
          onAddVocab={() => onAddVocab(entry, ctx)}
          onClose={close}
        />
      );
    }, 200) as unknown as number;
  });
  root.addEventListener('mouseout', (e) => {
    const t = e.target as HTMLElement;
    if (!t.classList?.contains('hj-hover-word')) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(close, 800) as unknown as number;
  });
}

function close() {
  activeWord = null;
  ensureOverlay().clear();
}
