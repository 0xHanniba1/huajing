const ORIGINAL = new WeakMap<Element, string>();
const TOUCHED = new Set<Element>();

export function renderReplace(el: Element, translation: string): void {
  if (!ORIGINAL.has(el)) ORIGINAL.set(el, el.textContent || '');
  el.textContent = translation;
  el.classList.add('hj-replaced');
  (el as HTMLElement).dataset.hj = '1';
  TOUCHED.add(el);
}

export function restoreReplace(el: Element): void {
  const orig = ORIGINAL.get(el);
  if (orig != null) {
    el.textContent = orig;
    ORIGINAL.delete(el);
  }
  el.classList.remove('hj-replaced');
  delete (el as HTMLElement).dataset.hj;
  TOUCHED.delete(el);
}

export function restoreAllReplace(): void {
  for (const el of TOUCHED) restoreReplace(el);
}
