import React, { useState } from 'react';
import { DictEntry } from '../dict/types';

export type SelBubbleProps = {
  x: number; y: number;
  kind?: 'text' | 'word';
  onTranslate: () => string | Promise<string>;
  onLookup?: () => DictEntry | null | Promise<DictEntry | null>;
  onSpeak: () => void;
  onAddVocab?: (entry: DictEntry) => void | Promise<void>;
  onClose?: () => void;
  showTranslateResult?: boolean;
};

export function SelBubble({ x, y, kind = 'text', onTranslate, onLookup, onSpeak, onAddVocab, onClose, showTranslateResult = true }: SelBubbleProps) {
  const [busyAction, setBusyAction] = useState<'lookup' | 'translate' | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [result, setResult] = useState('');
  const [entry, setEntry] = useState<DictEntry | null>(null);

  const busy = busyAction !== null;

  const handleLookup = async () => {
    setBusyAction('lookup');
    setResult('');
    setEntry(null);
    setAdded(false);
    try {
      const next = await onLookup?.();
      if (next) setEntry(next);
      else setResult('未找到释义');
    } catch (e) {
      setResult(e instanceof Error ? e.message : '查词失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleTranslate = async () => {
    setBusyAction('translate');
    setResult('');
    setEntry(null);
    setAdded(false);
    try {
      const next = await onTranslate();
      if (showTranslateResult) setResult(next || '(空)');
    } catch (e) {
      setResult(e instanceof Error ? e.message : '翻译失败');
    } finally {
      setBusyAction(null);
    }
  };

  const handleAddVocab = async () => {
    if (!entry || !onAddVocab) return;
    setAdding(true);
    setResult('');
    try {
      await onAddVocab(entry);
      setAdded(true);
    } catch (e) {
      setResult(e instanceof Error ? e.message : '加入生词本失败');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="hj-sel-panel" style={{ left: x, top: y }}>
      <div className="hj-bubble">
        {kind === 'word' && onLookup && (
          <>
            <button aria-label="查词" onClick={handleLookup} disabled={busy}>
              <BubbleIcon name="search" />
              <span>{busyAction === 'lookup' ? '查询中' : '查词'}</span>
            </button>
            <span className="sep" />
          </>
        )}
        <button aria-label="翻译" onClick={handleTranslate} disabled={busy}>
          <BubbleIcon name="translate" />
          <span>{busyAction === 'translate' ? '翻译中' : '翻译'}</span>
        </button>
        <span className="sep" />
        <button aria-label="朗读" onClick={onSpeak} disabled={busy}>
          <BubbleIcon name="speaker" />
          <span>朗读</span>
        </button>
        <span className="sep" />
        <button aria-label="关闭" className="hj-bubble-close" onClick={onClose} disabled={busy} title="关闭">
          <BubbleIcon name="close" />
        </button>
      </div>
      {entry && (
        <div className="hj-word-card">
          <div className="hj-wc-head">
            <div className="hj-wc-title">
              <span className="hj-wc-word">{entry.word}</span>
              {entry.ipa && <span className="hj-wc-ipa">{entry.ipa}</span>}
            </div>
          </div>
          <div className="hj-wc-defs">
            {entry.defs.map((def, i) => (
              <div className="hj-wc-def" key={i}>
                {def.pos && <span className="hj-wc-pos">{def.pos}</span>}
                <span>{def.text}</span>
              </div>
            ))}
          </div>
          {onAddVocab && (
            <div className="hj-wc-foot">
              <span className="hj-wc-tags">
                <span className="hj-wc-cache">缓存</span>
              </span>
              <button className={'hj-wc-add' + (added ? ' is-added' : '')} onClick={handleAddVocab} disabled={adding || added}>
                {added ? '已加入' : (adding ? '加入中' : '加入生词本')}
              </button>
            </div>
          )}
        </div>
      )}
      {result && <div className="hj-sel-result">{result}</div>}
    </div>
  );
}

function BubbleIcon({ name }: { name: 'search' | 'translate' | 'speaker' | 'close' }) {
  if (name === 'search') {
    return (
      <svg className="hj-ico hj-ico-search" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5 21 21" />
      </svg>
    );
  }
  if (name === 'translate') {
    return (
      <svg className="hj-ico hj-ico-translate" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 5h8" />
        <path d="M8 3v2" />
        <path d="M5 9c1.4 2.2 3.6 3.8 6.5 4.8" />
        <path d="M12 5c-.5 3.9-2.5 6.8-6 8.8" />
        <path d="M14 20 17.2 12 21 20" />
        <path d="M15.4 17h4.1" />
      </svg>
    );
  }
  if (name === 'speaker') {
    return (
      <svg className="hj-ico hj-ico-speaker" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 10v4h4l5 4V6l-5 4H4Z" />
        <path d="M16.5 9.5c1.4 1.5 1.4 5.5 0 7" />
        <path d="M19 7c2.5 2.8 2.5 7.2 0 10" />
      </svg>
    );
  }
  return (
    <svg className="hj-ico hj-ico-close" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  );
}
