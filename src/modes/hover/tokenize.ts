export function wrapWords(root: Element): void {
  if ((root as HTMLElement).dataset.hjHover) return;
  (root as HTMLElement).dataset.hjHover = '1';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (p.closest('.hj-trans, .hj-hover-word')) return NodeFilter.FILTER_REJECT;
      if (['CODE','PRE','SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const texts: Text[] = [];
  let cur: Node | null;
  while ((cur = walker.nextNode())) texts.push(cur as Text);
  for (const t of texts) splitText(t);
}

function splitText(node: Text): void {
  const text = node.nodeValue!;
  if (!/[A-Za-z]/.test(text)) return;
  const frag = document.createDocumentFragment();
  const re = /([A-Za-z][A-Za-z'\-]*)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index!, end = start + m[0].length;
    if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));
    const span = document.createElement('span');
    span.className = 'hj-hover-word';
    span.textContent = m[0];
    frag.appendChild(span);
    last = end;
  }
  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  node.replaceWith(frag);
}

export function unwrapWords(root: Element): void {
  delete (root as HTMLElement).dataset.hjHover;
  root.querySelectorAll('.hj-hover-word').forEach((s) => {
    s.replaceWith(document.createTextNode(s.textContent || ''));
  });
  root.normalize();
}
