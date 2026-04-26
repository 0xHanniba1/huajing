import React, { useState } from 'react';
import { Settings, ENGINE_PRESETS } from '../../src/store/types';
import { send } from '../../src/messaging/rpc';

export function ApiConfigSection({ settings, patch }: { settings: Settings; patch: (p: Partial<Settings>) => void }) {
  const [open, setOpen] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [tested, setTested] = useState<'idle'|'testing'|'ok'|'fail'>('idle');
  const cur = settings.engineConfigs[settings.engine];
  const preset = ENGINE_PRESETS[settings.engine];
  const docs = { deepseek: 'platform.deepseek.com', openai: 'platform.openai.com', anthropic: 'console.anthropic.com', gemini: 'aistudio.google.com' }[settings.engine];
  const keyHint = { deepseek: 'sk-...', openai: 'sk-proj-...', anthropic: 'sk-ant-...', gemini: 'AIza...' }[settings.engine];

  const updateCur = (p: Partial<typeof cur>) => {
    patch({ engineConfigs: { ...settings.engineConfigs, [settings.engine]: { ...cur, ...p } } });
    setTested('idle');
  };

  async function testConnection() {
    if (!cur.apiKey) return;
    setTested('testing');
    const r = await send({ type: 'test-connection', engineId: settings.engine });
    setTested(r.ok ? 'ok' : 'fail');
  }

  const dot = { idle: { c: '#9aa0a6', t: '未测试' }, testing: { c: '#2b6cb0', t: '测试中…' }, ok: { c: '#34c759', t: '连接正常' }, fail: { c: '#e34c4c', t: '连接失败' } }[tested];

  return (
    <div className="hj-pop-section">
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: open ? 10 : 0 }}>
        <div className="hj-pop-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>API 配置 · {settings.engine}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: dot.c, textTransform: 'none', fontWeight: 500 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot.c }} />{dot.t}
          </span>
        </div>
        <span style={{ color: 'var(--hj-muted)', transform: open ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform .15s', fontSize: 10 }}>▶</span>
      </div>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="API Key" hint={`从 ${docs} 获取`}>
            <div style={{ display: 'flex', gap: 4 }}>
              <input className="hj-pop-input" type={showKey ? 'text' : 'password'} placeholder={keyHint}
                value={cur.apiKey} onChange={(e) => updateCur({ apiKey: e.target.value })} />
              <button className="hj-icon-btn" onClick={() => setShowKey((v) => !v)}>{showKey ? '🙈' : '👁'}</button>
            </div>
          </Field>
          <Field label="Base URL" hint="代理或自托管时修改">
            <input className="hj-pop-input" value={cur.baseURL} onChange={(e) => updateCur({ baseURL: e.target.value })} />
          </Field>
          <Field label="模型" hint="按需选择速度/质量">
            <select className="hj-pop-select" style={{ width: '100%' }} value={cur.model} onChange={(e) => updateCur({ model: e.target.value })}>
              {preset.models.map((m) => <option key={m}>{m}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="hj-btn-primary" disabled={!cur.apiKey || tested === 'testing'} onClick={testConnection}>
              {tested === 'testing' ? '测试中…' : '测试连接'}
            </button>
            <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 10.5, color: 'var(--hj-muted)' }}>数据仅保存于本机</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 11, fontWeight: 500 }}>
        <span>{label}</span>
        <span style={{ fontSize: 10, color: 'var(--hj-muted)', fontWeight: 400 }}>{hint}</span>
      </div>
      {children}
    </div>
  );
}
