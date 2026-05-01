export function removeTranslations(el: Element): void {
  el.querySelectorAll('.hj-trans').forEach((node) => node.remove());
  delete (el as HTMLElement).dataset.hj;
}
