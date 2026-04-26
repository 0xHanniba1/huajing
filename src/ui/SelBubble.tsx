import React from 'react';

export type SelBubbleProps = {
  x: number; y: number;
  onTranslate: () => void;
  onSpeak: () => void;
  onCopy: () => void;
};

export function SelBubble({ x, y, onTranslate, onSpeak, onCopy }: SelBubbleProps) {
  return (
    <div className="hj-sel-bubble" style={{ left: x, top: y }}>
      <button onClick={onTranslate}>翻译</button>
      <span className="sep" />
      <button onClick={onSpeak}>朗读</button>
      <span className="sep" />
      <button onClick={onCopy}>复制</button>
    </div>
  );
}
