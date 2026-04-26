import { extractParagraphs, Paragraph } from '../dom/extract';
import { observeNewParagraphs } from '../dom/observe';
import { renderBilingual, removeBilingual } from '../modes/bilingual';
import { Settings } from '../store/types';
import { send } from '../messaging/rpc';
import { injectPageStyles } from '../ui/page-styles';

let active = false;
let unobserve: (() => void) | null = null;
const handled = new Set<string>();

export async function activate(settings: Settings) {
  if (active) return;
  active = true;
  injectPageStyles();
  const all = extractParagraphs(document.body);
  await translateAndRender(all, settings);
  unobserve = observeNewParagraphs(document.body, (added) => {
    translateAndRender(added, settings).catch(() => {});
  });
}

export function deactivate() {
  if (!active) return;
  active = false;
  unobserve?.();
  unobserve = null;
  document.querySelectorAll('[data-hj="1"]').forEach((el) => removeBilingual(el));
  handled.clear();
}

export function rerender(settings: Settings) {
  document.querySelectorAll('[data-hj="1"]').forEach((el) => {
    const span = el.querySelector(':scope > .hj-trans');
    if (!span) return;
    span.setAttribute('data-divider', settings.divider);
    (span as HTMLElement).style.setProperty('--hj-trans-color', settings.transColor);
    (span as HTMLElement).style.setProperty('--hj-trans-size', `${settings.transFontSize}px`);
  });
}

async function translateAndRender(paragraphs: Paragraph[], settings: Settings) {
  const todo = paragraphs.filter((p) => !handled.has(p.hash));
  if (!todo.length) return;
  todo.forEach((p) => handled.add(p.hash));
  for (let i = 0; i < todo.length; i += 8) {
    const batch = todo.slice(i, i + 8);
    const { translations } = await send({
      type: 'translate-batch',
      texts: batch.map((p) => p.text),
      targetLang: settings.targetLang,
    });
    batch.forEach((p, j) => {
      if (translations[j]) {
        renderBilingual(p.el, translations[j], {
          divider: settings.divider,
          color: settings.transColor,
          fontSize: settings.transFontSize,
        });
      }
    });
  }
}
