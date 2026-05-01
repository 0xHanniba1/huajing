import React from 'react';
import { ensureOverlay } from '../../ui/overlay-root';
import { SelBubble } from '../../ui/SelBubble';
import { send } from '../../messaging/rpc';
import { DEFAULT_SETTINGS, Settings, TargetLang } from '../../store/types';

type SelectionSettings = Pick<Settings, 'targetLang' | 'divider' | 'transColor' | 'transFontSize'>;
type SelectionSettingsSource = TargetLang | SelectionSettings;

const MAX_SELECTION_LENGTH = 2000;
const BLOCK_SELECTOR = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dt, dd, figcaption, td, div[data-testid="tweetText"]';

export function bindSelection(getSettings: () => SelectionSettingsSource): () => void {
  let timer: number | null = null;
  const onMouseUp = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const sel = window.getSelection();
      const text = sel?.toString().replace(/\s+/g, ' ').trim() || '';
      if (text.length < 2 || text.length > MAX_SELECTION_LENGTH) return;
      if (!sel?.rangeCount) return;
      const range = sel!.getRangeAt(0);
      const actionRange = range.cloneRange();
      const r = range.getBoundingClientRect();
      ensureOverlay().render(
        <SelBubble
          x={r.left + window.scrollX + r.width / 2 - 80}
          y={r.top + window.scrollY - 44}
          kind={isSingleLookupWord(text) ? 'word' : 'text'}
          showTranslateResult={false}
          onTranslate={async () => {
            const settings = normalizeSettings(getSettings());
            const { translations } = await send({
              type: 'translate-batch', texts: [text], targetLang: settings.targetLang,
            });
            const translation = translations[0] || '';
            if (translation) insertInlineTranslationAfterRange(actionRange, translation, settings);
            ensureOverlay().clear();
            return '';
          }}
          onLookup={async () => {
            const settings = normalizeSettings(getSettings());
            const { entry } = await send({ type: 'lookup-word', word: text, targetLang: settings.targetLang });
            return entry;
          }}
          onAddVocab={async (entry) => {
            await send({
              type: 'add-vocab',
              entry: {
                word: entry.word.toLowerCase(),
                addedAt: Date.now(),
                status: 'new',
                ipa: entry.ipa,
                defs: entry.defs,
                context: text,
                sourceURL: location.href,
              },
            });
          }}
          onSpeak={() => speechSynthesis.speak(new SpeechSynthesisUtterance(text))}
          onClose={() => ensureOverlay().clear()}
        />
      );
    }, 0) as unknown as number;
  };
  const onMouseDown = (e: MouseEvent) => {
    if (isOverlayControlEvent(e)) return;
    ensureOverlay().clear();
  };
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousedown', onMouseDown);

  return () => {
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mousedown', onMouseDown);
    if (timer) clearTimeout(timer);
  };
}

export function isSingleLookupWord(text: string): boolean {
  return /^[A-Za-z][A-Za-z'-]*$/.test(text.trim());
}

function isOverlayControlEvent(e: Event): boolean {
  const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
  return path.some((node) => {
    if (!(node instanceof Element)) return false;
    return !!node.closest('.hj-sel-panel');
  });
}

function normalizeSettings(source: SelectionSettingsSource): SelectionSettings {
  if (typeof source === 'string') {
    return {
      targetLang: source,
      divider: DEFAULT_SETTINGS.divider,
      transColor: DEFAULT_SETTINGS.transColor,
      transFontSize: DEFAULT_SETTINGS.transFontSize,
    };
  }
  return source;
}

export function insertInlineTranslationAfterRange(range: Range, translation: string, settings: SelectionSettings): void {
  const insertion = range.cloneRange();
  insertion.collapse(false);
  const existing = nextElementAtRangeEnd(insertion);
  const span = existing?.classList.contains('hj-trans') ? existing : document.createElement('span');
  span.className = 'hj-trans hj-trans-inline';
  span.textContent = `(${translation.trim()})`;
  span.setAttribute('data-divider', settings.divider);
  span.style.setProperty('--hj-trans-color', settings.transColor);
  span.style.setProperty('--hj-trans-size', `${settings.transFontSize}px`);

  if (!existing?.classList.contains('hj-trans')) insertion.insertNode(span);
  const target = findSelectionContainer(range);
  if (target) (target as HTMLElement).dataset.hj = '1';
}

function nextElementAtRangeEnd(range: Range): HTMLElement | null {
  const node = range.endContainer;
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node as Text;
    if (range.endOffset !== text.length) return null;
    return text.nextSibling instanceof HTMLElement ? text.nextSibling : null;
  }
  return node.childNodes[range.endOffset] instanceof HTMLElement
    ? node.childNodes[range.endOffset] as HTMLElement
    : null;
}

function findSelectionContainer(range: Range): Element | null {
  const node = range.commonAncestorContainer;
  const element = node instanceof Element ? node : node.parentElement;
  return element?.closest(BLOCK_SELECTOR) ?? element ?? null;
}
