import React from 'react';

export type CtxMenuItem = { label: string; sc?: string; onSelect: () => void };
export function CtxMenu({ x, y, items }: { x: number; y: number; items: CtxMenuItem[] }) {
  return (
    <div className="hj-ctx-menu" style={{ left: x, top: y }}>
      {items.map((it, i) => (
        <div key={i} className="hj-ctx-item" onClick={it.onSelect}>
          <span>{it.label}</span>
          {it.sc && <span className="sc">{it.sc}</span>}
        </div>
      ))}
    </div>
  );
}
