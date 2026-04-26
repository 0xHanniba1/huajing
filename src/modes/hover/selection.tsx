import React from 'react';
import { ensureOverlay } from '../../ui/overlay-root';
import { SelBubble } from '../../ui/SelBubble';
import { CtxMenu } from '../../ui/CtxMenu';
import { send } from '../../messaging/rpc';
import { modKeyLabel } from '../../shared/keyboard';
import { TargetLang } from '../../store/types';

export function bindSelection(getTargetLang: () => TargetLang) {
  document.addEventListener('mouseup', (_e) => {
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      if (text.length < 2 || text.length > 200) return;
      const range = sel!.getRangeAt(0);
      const r = range.getBoundingClientRect();
      ensureOverlay().render(
        <SelBubble
          x={r.left + window.scrollX + r.width / 2 - 80}
          y={r.top + window.scrollY - 44}
          onTranslate={async () => {
            const { translations } = await send({
              type: 'translate-batch', texts: [text], targetLang: getTargetLang(),
            });
            alert(translations[0] || '(空)');
          }}
          onSpeak={() => speechSynthesis.speak(new SpeechSynthesisUtterance(text))}
          onCopy={() => navigator.clipboard.writeText(text)}
        />
      );
    }, 0);
  });
  document.addEventListener('mousedown', (e) => {
    if ((e.target as Element).closest?.('.hj-sel-bubble, .hj-ctx-menu, .hj-lookup-card')) return;
    ensureOverlay().clear();
  });
  document.addEventListener('contextmenu', (e) => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() || '';
    if (!text) return;
    e.preventDefault();
    const mod = modKeyLabel();
    ensureOverlay().render(
      <CtxMenu
        x={e.pageX} y={e.pageY}
        items={[
          { label: '翻译选中', sc: `${mod}+T`, onSelect: async () => {
            const { translations } = await send({ type: 'translate-batch', texts: [text], targetLang: getTargetLang() });
            alert(translations[0] || '(空)');
            ensureOverlay().clear();
          }},
          { label: '朗读',        sc: `${mod}+S`, onSelect: () => { speechSynthesis.speak(new SpeechSynthesisUtterance(text)); ensureOverlay().clear(); }},
          { label: '加入生词本',                  onSelect: async () => {
            await send({ type: 'add-vocab', entry: { word: text.toLowerCase(), addedAt: Date.now(), status: 'new', context: undefined, sourceURL: location.href } });
            ensureOverlay().clear();
          }},
        ]}
      />
    );
  });
}
