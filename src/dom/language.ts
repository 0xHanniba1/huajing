const CJK_RE = /[㐀-鿿豈-﫿]/g;
const ALPHA_RE = /[A-Za-zÀ-ɏ]/;

export function isMostlyCJK(text: string): boolean {
  const len = [...text.replace(/\s/g, '')].length;
  if (len === 0) return false;
  const cjk = (text.match(CJK_RE) || []).length;
  return cjk / len > 0.3;
}

export function shouldTranslate(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return false;
  if (!ALPHA_RE.test(t)) return false;
  if (isMostlyCJK(t)) return false;
  return true;
}
