import React from 'react';

export function ReplaceToast({ onRetranslate, onClose }: { onRetranslate: () => void; onClose: () => void }) {
  return (
    <div className="hj-toast">
      <span className="dot" />
      <span className="muted">已替换原文</span>
      <button className="accent" onClick={onRetranslate}>重新翻译</button>
      <button className="close" onClick={onClose}>×</button>
    </div>
  );
}
