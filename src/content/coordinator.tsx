import { removeTranslations } from '../modes/translation-node';
import { bindSelection } from '../modes/hover/selection';
import { Settings, Mode } from '../store/types';
import { injectPageStyles } from '../ui/page-styles';
import { ensureOverlay } from '../ui/overlay-root';

let active: Mode | null = null;
let cleanupSelection: (() => void) | null = null;
let currentSettings: Settings | null = null;

export async function activate(settings: Settings, mode: Mode) {
  if (active) deactivate();
  currentSettings = settings;
  active = mode;
  injectPageStyles();
  cleanupSelection = bindSelection(() => currentSettings ?? settings);
}

export function deactivate() {
  if (!active) return;
  cleanupSelection?.(); cleanupSelection = null;
  document.querySelectorAll('[data-hj="1"]').forEach((el) => removeTranslations(el));
  ensureOverlay().clear();
  active = null;
  currentSettings = null;
}

export function rerender(settings: Settings) {
  currentSettings = settings;
  if (!active) return;
  document.querySelectorAll('.hj-trans').forEach((span) => {
    span.setAttribute('data-divider', settings.divider);
    (span as HTMLElement).style.setProperty('--hj-trans-color', settings.transColor);
    (span as HTMLElement).style.setProperty('--hj-trans-size', `${settings.transFontSize}px`);
  });
}
