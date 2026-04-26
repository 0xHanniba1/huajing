import { Divider } from '../store/types';

export type BilingualOpts = { divider: Divider; color: string; fontSize: number };

export function renderBilingual(el: Element, translation: string, opts: BilingualOpts): void {
  let span = el.querySelector(':scope > .hj-trans') as HTMLElement | null;
  if (!span) {
    span = document.createElement('span');
    span.className = 'hj-trans';
    el.appendChild(span);
  }
  span.textContent = translation;
  span.setAttribute('data-divider', opts.divider);
  span.style.setProperty('--hj-trans-color', opts.color);
  span.style.setProperty('--hj-trans-size', `${opts.fontSize}px`);
  (el as HTMLElement).dataset.hj = '1';
}

export function removeBilingual(el: Element): void {
  el.querySelector(':scope > .hj-trans')?.remove();
  delete (el as HTMLElement).dataset.hj;
}
