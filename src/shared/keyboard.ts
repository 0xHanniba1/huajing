export function modKeyLabel(): string {
  if (typeof navigator === 'undefined') return 'Alt';
  return /Mac|iPhone|iPad/.test(navigator.platform) ? 'Option' : 'Alt';
}
