import React, { useEffect, useState } from 'react';
import { useSettings } from './useSettings';
import { ApiConfigSection } from './ApiConfigSection';
import { getVocab } from '../../src/store/storage';
import { EngineId, TargetLang, Theme, Divider } from '../../src/store/types';

export function App() {
  const { settings, patch } = useSettings();
  const [vocabCount, setVocabCount] = useState(0);

  useEffect(() => { getVocab().then((v) => setVocabCount(v.length)); }, [settings]);
  useEffect(() => {
    document.body.dataset.theme = settings?.theme === 'dark' ? 'dark' : 'light';
  }, [settings?.theme]);

  if (!settings) return <div style={{ padding: 16 }}>载入中…</div>;

  return (
    <div className="hj-popup">
      <div className="hj-pop-head">
        <span className="hj-logo">化</span>
        <span className="hj-pop-name">
          <span className="n">化境 Huàjìng</span>
          <span className="v">v{chrome.runtime.getManifest().version}</span>
        </span>
        <div className="hj-pop-head-right">
          <span className="lbl-sm">深色模式</span>
          <button
            className="hj-tiny-toggle"
            type="button"
            aria-label="深色模式"
            title="深色模式"
            data-on={settings.theme === 'dark' ? 1 : 0}
            onClick={() => patch({ theme: (settings.theme === 'dark' ? 'light' : 'dark') as Theme })}
          >
            <i />
          </button>
          <button
            className="hj-pop-power"
            type="button"
            aria-label={settings.enabled ? '关闭插件' : '开启插件'}
            data-on={settings.enabled ? 1 : 0}
            onClick={() => patch({ enabled: !settings.enabled })}
          >
            <i />
          </button>
        </div>
      </div>

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">AI 引擎</div>
        <div className="hj-row">
          <span className="hj-row-l">
            <span className="lbl">服务商</span>
            <span className="lbl-sub">选择后下方配置 API</span>
          </span>
          <span className="hj-row-r">
            <select className="hj-pop-select" value={settings.engine} onChange={(e) => patch({ engine: e.target.value as EngineId })}>
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Gemini</option>
            </select>
          </span>
        </div>
        <div className="hj-row">
          <span className="hj-row-l">
            <span className="lbl">译文语言</span>
          </span>
          <span className="hj-row-r">
            <select className="hj-pop-select" value={settings.targetLang} onChange={(e) => patch({ targetLang: e.target.value as TargetLang })}>
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </span>
        </div>
      </div>

      <ApiConfigSection settings={settings} patch={patch} />

      <div className="hj-pop-section">
        <div className="hj-pop-section-title">译文样式</div>
        <div className="hj-row">
          <span className="hj-row-l">
            <span className="lbl">颜色</span>
          </span>
          <label className="hj-row-r hj-color-swatch" style={{ background: settings.transColor }}>
            <input type="color" value={settings.transColor} onChange={(e) => patch({ transColor: e.target.value })} />
          </label>
        </div>
        <div className="hj-row">
          <span className="hj-row-l">
            <span className="lbl">字号</span>
          </span>
          <span className="hj-row-r">
            <input className="hj-slider" type="range" min={12} max={20} value={settings.transFontSize} onChange={(e) => patch({ transFontSize: Number(e.target.value) })} />
            <span className="val">{settings.transFontSize}px</span>
          </span>
        </div>
        <div className="hj-row">
          <span className="hj-row-l">
            <span className="lbl">分隔线</span>
          </span>
          <span className="hj-row-r">
            <select className="hj-pop-select" value={settings.divider} onChange={(e) => patch({ divider: e.target.value as Divider })}>
              <option value="solid">实线</option>
              <option value="dashed">虚线</option>
              <option value="dotted">点线</option>
              <option value="bracket">括号</option>
              <option value="none">无</option>
            </select>
          </span>
        </div>
      </div>

      <div className="hj-pop-foot">
        <span className="hj-foot-link" onClick={() => chrome.runtime.openOptionsPage()}>生词本 · {vocabCount}</span>
      </div>
    </div>
  );
}
