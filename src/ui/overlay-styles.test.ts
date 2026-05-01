import { describe, expect, it } from 'vitest';
import { OVERLAY_CSS } from './overlay-styles';

describe('overlay styles', () => {
  it('keeps selection bubble buttons on one horizontal line', () => {
    expect(OVERLAY_CSS).toContain('white-space: nowrap');
    expect(OVERLAY_CSS).toContain('flex: 0 0 auto');
  });

  it('renders IPA below the lookup word without flex wrapping', () => {
    expect(OVERLAY_CSS).toContain('.hj-wc-head');
    expect(OVERLAY_CSS).toContain('.hj-wc-ipa');
  });

  it('gives translation results a readable card width', () => {
    expect(OVERLAY_CSS).toContain('width: min(420px, calc(100vw - 24px))');
    expect(OVERLAY_CSS).toContain('overflow-wrap: break-word');
  });

  it('includes v2 design classes for the bubble and lookup card', () => {
    expect(OVERLAY_CSS).toContain('.hj-bubble');
    expect(OVERLAY_CSS).toContain('.hj-word-card');
    expect(OVERLAY_CSS).toContain('var(--hj-shadow-card)');
  });
});
