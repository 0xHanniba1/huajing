const PAGE_CSS = `
.hj-trans {
  display: block;
  font-size: var(--hj-trans-size, 15px);
  color: var(--hj-trans-color, #2b6cb0);
  line-height: 1.75;
  margin-top: 6px;
  padding-top: 8px;
  letter-spacing: .005em;
  font-feature-settings: "palt";
}
.hj-trans[data-divider="solid"]  { border-top: 1px solid rgba(0,0,0,.1); }
.hj-trans[data-divider="dashed"] { border-top: 1px dashed rgba(0,0,0,.18); }
.hj-trans[data-divider="dotted"] { border-top: 1px dotted rgba(0,0,0,.18); }
.hj-trans[data-divider="bracket"]{ border-top: none; padding-top: 4px; position: relative; }
.hj-trans[data-divider="bracket"]::before { content: "│"; color: var(--hj-trans-color, #2b6cb0); opacity: .5; margin-right: 6px; }
.hj-trans[data-divider="none"]   { border-top: none; padding-top: 4px; }

.hj-replaced { border-bottom: 1px dotted rgba(43,108,176,.5); }

.hj-loading {
  display: inline-block; height: .9em; vertical-align: middle; border-radius: 3px;
  background: linear-gradient(90deg, rgba(43,108,176,.14), rgba(43,108,176,.28), rgba(43,108,176,.14));
  background-size: 200% 100%; animation: hj-shimmer 1.1s linear infinite;
}
@keyframes hj-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
`;

let injected = false;
export function injectPageStyles(): void {
  if (injected) return;
  injected = true;
  const style = document.createElement('style');
  style.id = 'hj-page-styles';
  style.textContent = PAGE_CSS;
  (document.head || document.documentElement).appendChild(style);
}
