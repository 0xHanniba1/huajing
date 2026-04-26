import React from 'react';
import { DictEntry } from '../dict/types';

export type LookupCardProps = {
  entry: DictEntry;
  x: number; y: number;
  onAddVocab: () => void;
  onClose: () => void;
};

export function LookupCard({ entry, x, y, onAddVocab, onClose }: LookupCardProps) {
  return (
    <div className="hj-lookup-card" style={{ left: x, top: y }} onMouseLeave={onClose}>
      <div className="lk-head">
        <span className="lk-word">{entry.word}</span>
        <span className="lk-ipa">{entry.ipa}</span>
        <button className="lk-pron" title="发音" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(entry.word))}>▶</button>
      </div>
      <div className="lk-defs">
        {entry.defs.map((d, i) => (
          <div key={i} className="lk-def">
            {d.pos && <span className="lk-pos">{d.pos}</span>}
            <span>{d.text}</span>
          </div>
        ))}
      </div>
      <div className="lk-actions">
        {(entry.tags || []).map((t, i) => <span key={i} className="lk-chip">{t}</span>)}
        <span className="lk-chip" onClick={onAddVocab}>＋ 加入生词本</span>
      </div>
    </div>
  );
}
