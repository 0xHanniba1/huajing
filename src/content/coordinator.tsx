import React from 'react';
import { extractParagraphs, Paragraph } from '../dom/extract';
import { observeNewParagraphs } from '../dom/observe';
import { renderBilingual, removeBilingual } from '../modes/bilingual';
import { renderReplace, restoreAllReplace } from '../modes/replace';
import { Settings, Mode } from '../store/types';
import { send } from '../messaging/rpc';
import { injectPageStyles } from '../ui/page-styles';
import { ensureOverlay } from '../ui/overlay-root';
import { ReplaceToast } from '../ui/Toast';

let active: Mode | null = null;
let unobserve: (() => void) | null = null;
const handled = new Set<string>();

export async function activate(settings: Settings, mode: Mode) {
  if (active) deactivate();
  active = mode;
  injectPageStyles();
  const all = extractParagraphs(document.body);
  await translateAndRender(all, settings, mode);
  unobserve = observeNewParagraphs(document.body, (added) => {
    translateAndRender(added, settings, mode).catch(() => {});
  });
  if (mode === 'replace') showReplaceToast(settings);
}

export function deactivate() {
  if (!active) return;
  unobserve?.(); unobserve = null;
  document.querySelectorAll('[data-hj="1"]').forEach((el) => removeBilingual(el));
  restoreAllReplace();
  ensureOverlay().clear();
  handled.clear();
  active = null;
}

export function rerender(settings: Settings) {
  if (active === 'bilingual') {
    document.querySelectorAll('[data-hj="1"]').forEach((el) => {
      const span = el.querySelector(':scope > .hj-trans');
      if (!span) return;
      span.setAttribute('data-divider', settings.divider);
      (span as HTMLElement).style.setProperty('--hj-trans-color', settings.transColor);
      (span as HTMLElement).style.setProperty('--hj-trans-size', `${settings.transFontSize}px`);
    });
  }
}

async function translateAndRender(paragraphs: Paragraph[], settings: Settings, mode: Mode) {
  const todo = paragraphs.filter((p) => !handled.has(p.hash));
  if (!todo.length) return;
  todo.forEach((p) => handled.add(p.hash));
  for (let i = 0; i < todo.length; i += 8) {
    const batch = todo.slice(i, i + 8);
    const { translations } = await send({
      type: 'translate-batch', texts: batch.map((p) => p.text), targetLang: settings.targetLang,
    });
    batch.forEach((p, j) => {
      const t = translations[j];
      if (!t) return;
      if (mode === 'bilingual') {
        renderBilingual(p.el, t, { divider: settings.divider, color: settings.transColor, fontSize: settings.transFontSize });
      } else if (mode === 'replace') {
        renderReplace(p.el, t);
      }
    });
  }
}

function showReplaceToast(settings: Settings) {
  const ov = ensureOverlay();
  ov.render(
    <ReplaceToast
      onRetranslate={() => { handled.clear(); activate(settings, 'replace'); }}
      onClose={() => ov.clear()}
    />
  );
}
