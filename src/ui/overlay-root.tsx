import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { OVERLAY_CSS } from './overlay-styles';

let host: HTMLElement | null = null;
let root: Root | null = null;

export function ensureOverlay(): { render: (node: React.ReactNode) => void; clear: () => void } {
  if (!host) {
    host = document.createElement('huajing-overlay');
    Object.assign(host.style, { position: 'fixed', top: '0', left: '0', width: '0', height: '0', zIndex: '2147483647' } as CSSStyleDeclaration);
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = OVERLAY_CSS;
    shadow.appendChild(style);
    const mountPoint = document.createElement('div');
    mountPoint.id = 'hj-mount';
    shadow.appendChild(mountPoint);
    document.documentElement.appendChild(host);
    root = createRoot(mountPoint);
  }
  return {
    render: (node) => root!.render(<>{node}</>),
    clear:  () => root!.render(<></>),
  };
}
