import React, { useEffect, useState } from 'react';
import { useSettings } from './useSettings';
import { ApiConfigSection } from './ApiConfigSection';
import { getVocab } from '../../src/store/storage';
import { modKeyLabel } from '../../src/shared/keyboard';
import { EngineId, Mode, TargetLang, Theme, Divider } from '../../src/store/types';

const MODES: { id: Mode; name: string; sub: string; glyph: string }[] = [
  { id: 'bilingual', name: '双语对照', sub: '沉浸式',  glyph: '译' },
  { id: 'replace',   name: '原文替换', sub: '省屏幕',  glyph: '替' },
  { id: 'hover',     name: '划词 / 悬停', sub: '低干扰', glyph: '划' },
];

export function App() {
  const { settings, patch } = useSettings();
  const [vocabCount, setVocabCount] = useState(0);
  const [host, setHost] = useState('');
  const mod = modKeyLabel();

  useEffect(() => { getVocab().then((v) => setVocabCount(v.length)); }, [settings]);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([t]) => {
      if (t?.url) try { setHost(new URL(t.url).hostname); } catch {}
    });
  }, []);
  useEffect(() => {
    document.body.dataset.theme = settings?.theme === 'dark' ? 'dark' : 'light';
  }, [settings?.theme]);

  if (!settings) return <div style={{ padding: 16 }}>载入中…</div>;

  const isCurrentSiteAuto = !!host && settings.autoSites.includes(host);
  const toggleCurrentSite = () => {
    if (!host) return;
    const next = isCurrentSiteAuto ? settings.autoSites.filter((h) => h !== host) : [...settings.autoSites, host];
    patch({ autoSites: next });
  };

  return (
    <div className="hj-popup">
      <div className="hj-popup-head">
        <span className="hj-logo">化</span>
        <span className="hj-pop-name">化境 Huàjìng<small>v 0.1</small></span>
        <button className="hj-pop-power" data-on={settings.enabled ? 1 : 0} onClick={() => patch({ enabled: !settings.enabled })}><i /></button>
      </div>

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">翻译模式</div>
        <div className="hj-mode-grid">
          {MODES.map((m) => (
            <div key={m.id}
              className={'hj-mode-card' + (settings.mode === m.id ? ' active' : '')}
              onClick={() => patch({ mode: m.id })}>
              <span className="mc-glyph">{m.glyph}</span>
              <span className="mc-text">
                <span className="mc-name">{m.name}</span>
                <span className="mc-sub">{m.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">AI 引擎</div>
        <div className="hj-row">
          <span className="lbl">服务商<small>选择后下方配置 API</small></span>
          <select className="hj-pop-select" value={settings.engine} onChange={(e) => patch({ engine: e.target.value as EngineId })}>
            <option value="deepseek">DeepSeek</option>
            <option value="openai">GPT-4o</option>
            <option value="anthropic">Claude Sonnet</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
        <div className="hj-row">
          <span className="lbl">译文语言</span>
          <select className="hj-pop-select" value={settings.targetLang} onChange={(e) => patch({ targetLang: e.target.value as TargetLang })}>
            <option value="zh-CN">简体中文</option>
            <option value="zh-TW">繁體中文</option>
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <ApiConfigSection settings={settings} patch={patch} />

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">译文样式</div>
        <div className="hj-row">
          <span className="lbl">颜色</span>
          <input type="color" value={settings.transColor} onChange={(e) => patch({ transColor: e.target.value })} style={{ width: 56, height: 22, border: '1px solid var(--hj-line)', borderRadius: 6, padding: 0 }} />
        </div>
        <div className="hj-row">
          <span className="lbl">字号</span>
          <input type="range" min={12} max={20} value={settings.transFontSize} onChange={(e) => patch({ transFontSize: Number(e.target.value) })} />
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--hj-muted)' }}>{settings.transFontSize}px</span>
        </div>
        <div className="hj-row">
          <span className="lbl">分隔线</span>
          <select className="hj-pop-select" value={settings.divider} onChange={(e) => patch({ divider: e.target.value as Divider })}>
            <option value="solid">实线</option>
            <option value="dashed">虚线</option>
            <option value="dotted">点线</option>
            <option value="bracket">引用线</option>
            <option value="none">无</option>
          </select>
        </div>
      </div>

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">行为</div>
        <div className="hj-row">
          <span className="lbl">本站自动翻译<small>{host || '当前页'}</small></span>
          <button className="hj-tiny-toggle" data-on={isCurrentSiteAuto ? 1 : 0} onClick={toggleCurrentSite}><i /></button>
        </div>
        <div className="hj-row">
          <span className="lbl">深色模式</span>
          <button className="hj-tiny-toggle" data-on={settings.theme === 'dark' ? 1 : 0} onClick={() => patch({ theme: (settings.theme === 'dark' ? 'light' : 'dark') as Theme })}><i /></button>
        </div>
        <div className="hj-row">
          <span className="lbl">快捷键<small>翻译 / 切模式</small></span>
          <span className="hj-kbd"><kbd>{mod}</kbd>+<kbd>T</kbd> · <kbd>{mod}</kbd>+<kbd>A</kbd></span>
        </div>
      </div>

      <div className="hj-pop-foot">
        <span>设置</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--hj-muted)' }} />
        <span style={{ cursor: 'pointer' }} onClick={() => chrome.runtime.openOptionsPage()}>生词本 · {vocabCount}</span>
        <span style={{ marginLeft: 'auto' }} className="hj-kbd"><kbd>{mod}</kbd>+<kbd>A</kbd></span>
      </div>
    </div>
  );
}
