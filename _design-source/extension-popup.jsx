// extension-popup.jsx — Toolbar action popup
// Now supports: per-engine API key / Base URL / model 配置（BYOK 模式）

const ENGINE_PRESETS = {
  'DeepSeek': {
    baseURL: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    keyHint: 'sk-...',
    docs: 'platform.deepseek.com',
  },
  'GPT-4o': {
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    keyHint: 'sk-proj-...',
    docs: 'platform.openai.com',
  },
  'Claude Sonnet': {
    baseURL: 'https://api.anthropic.com/v1',
    models: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
    keyHint: 'sk-ant-...',
    docs: 'console.anthropic.com',
  },
  'Gemini': {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
    keyHint: 'AIza...',
    docs: 'aistudio.google.com',
  },
};

function ExtensionPopup({ mode, setMode, engine, setEngine, dark, setDark, theme }) {
  const [enabled, setEnabled] = React.useState(true);
  const [autoSites, setAutoSites] = React.useState(true);
  const [advOpen, setAdvOpen] = React.useState(true);
  const [showKey, setShowKey] = React.useState(false);
  const [tested, setTested] = React.useState('idle'); // idle | testing | ok | fail

  // Per-engine config persisted in component state (mock — real ext would use chrome.storage)
  const [config, setConfig] = React.useState(() => {
    const init = {};
    Object.entries(ENGINE_PRESETS).forEach(([k, v]) => {
      init[k] = { apiKey: '', baseURL: v.baseURL, model: v.models[0] };
    });
    // pre-fill DeepSeek with a fake key so the demo is more believable
    init['DeepSeek'].apiKey = 'sk-••••••••••••••••••••••••3f9a';
    return init;
  });

  const cur = config[engine];
  const preset = ENGINE_PRESETS[engine];

  function updateCur(patch) {
    setConfig(c => ({ ...c, [engine]: { ...c[engine], ...patch } }));
    setTested('idle');
  }

  function testConnection() {
    if (!cur.apiKey) return;
    setTested('testing');
    setTimeout(() => setTested(Math.random() > 0.15 ? 'ok' : 'fail'), 900);
  }

  const modes = [
    { id: 'bilingual', name: '双语对照', sub: '沉浸式', glyph: '译' },
    { id: 'replace',   name: '原文替换', sub: '省屏幕',  glyph: '替' },
    { id: 'hover',     name: '划词 / 悬停', sub: '低干扰', glyph: '划' },
    { id: 'sidebar',   name: '侧栏 + AI', sub: '深度阅读', glyph: '栏' },
  ];

  const statusDot = {
    idle:    { c: '#9aa0a6', t: '未测试' },
    testing: { c: '#2b6cb0', t: '测试中…' },
    ok:      { c: '#34c759', t: '连接正常' },
    fail:    { c: '#e34c4c', t: '连接失败' },
  }[tested];

  return (
    <div className="yj-popup" data-theme={theme}>
      <div className="yj-popup-head">
        <span className="yj-logo">化</span>
        <span className="yj-pop-name">化境 Huàjìng<small>v 1.4 · 当前页：thedaily.example.com</small></span>
        <button className="yj-pop-power" data-on={enabled ? 1 : 0} onClick={() => setEnabled(v => !v)}>
          <i />
        </button>
      </div>

      <div className="yj-pop-section">
        <div className="yj-pop-section-title">翻译模式</div>
        <div className="yj-mode-grid">
          {modes.map(m => (
            <div key={m.id}
              className={'yj-mode-card' + (mode === m.id ? ' active' : '')}
              onClick={() => setMode(m.id)}
            >
              <span className="mc-glyph">{m.glyph}</span>
              <span className="mc-text">
                <span className="mc-name">{m.name}</span>
                <span className="mc-sub">{m.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="yj-pop-section">
        <div className="yj-pop-section-title">AI 引擎</div>
        <div className="yj-row">
          <span className="lbl">服务商<small>选择后下方配置 API</small></span>
          <select className="yj-pop-select" value={engine} onChange={(e) => setEngine(e.target.value)}>
            <option>DeepSeek</option>
            <option>GPT-4o</option>
            <option>Claude Sonnet</option>
            <option>Gemini</option>
          </select>
        </div>
        <div className="yj-row">
          <span className="lbl">译文语言</span>
          <select className="yj-pop-select" defaultValue="简体中文">
            <option>简体中文</option>
            <option>繁體中文</option>
            <option>日本語</option>
            <option>English</option>
          </select>
        </div>
      </div>

      {/* ─── API 配置（按引擎独立）─────────────────────────── */}
      <div className="yj-pop-section">
        <div
          onClick={() => setAdvOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', marginBottom: advOpen ? 10 : 0,
          }}>
          <div className="yj-pop-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>API 配置 · {engine}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 9.5, letterSpacing: 0,
              color: statusDot.c, textTransform: 'none', fontWeight: 500,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusDot.c }} />
              {statusDot.t}
            </span>
          </div>
          <span style={{
            color: 'var(--yj-muted)',
            transform: advOpen ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform .15s', fontSize: 10,
          }}>▶</span>
        </div>

        {advOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* API Key */}
            <FieldBlock label="API Key" hint={`从 ${preset.docs} 获取`}>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  className="yj-pop-input"
                  type={showKey ? 'text' : 'password'}
                  placeholder={preset.keyHint}
                  value={cur.apiKey}
                  onChange={(e) => updateCur({ apiKey: e.target.value })}
                />
                <button className="yj-icon-btn" title={showKey ? '隐藏' : '显示'}
                  onClick={() => setShowKey(v => !v)}>{showKey ? '🙈' : '👁'}</button>
              </div>
            </FieldBlock>

            {/* Base URL */}
            <FieldBlock label="Base URL" hint="代理或自托管时修改">
              <input
                className="yj-pop-input"
                value={cur.baseURL}
                onChange={(e) => updateCur({ baseURL: e.target.value })}
                placeholder={preset.baseURL}
              />
            </FieldBlock>

            {/* Model */}
            <FieldBlock label="模型" hint="按需选择速度/质量">
              <select
                className="yj-pop-select" style={{ width: '100%' }}
                value={cur.model}
                onChange={(e) => updateCur({ model: e.target.value })}
              >
                {preset.models.map(m => <option key={m}>{m}</option>)}
                <option value="__custom">自定义…</option>
              </select>
            </FieldBlock>

            <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
              <button
                className="yj-btn-primary"
                disabled={!cur.apiKey || tested === 'testing'}
                onClick={testConnection}>
                {tested === 'testing' ? '测试中…' : '测试连接'}
              </button>
              <button className="yj-btn-ghost">保存</button>
              <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 10.5, color: 'var(--yj-muted)' }}>
                数据仅保存于本机
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="yj-pop-section">
        <div className="yj-pop-section-title">行为</div>
        <div className="yj-row">
          <span className="lbl">本站自动翻译<small>thedaily.example.com</small></span>
          <button className="yj-tiny-toggle" data-on={autoSites ? 1 : 0} onClick={() => setAutoSites(v => !v)}><i /></button>
        </div>
        <div className="yj-row">
          <span className="lbl">深色模式</span>
          <button className="yj-tiny-toggle" data-on={dark ? 1 : 0} onClick={() => setDark(v => !v)}><i /></button>
        </div>
        <div className="yj-row">
          <span className="lbl">快捷键<small>触发翻译 / 切换模式</small></span>
          <span className="yj-kbd">
            <kbd>{window.__YJ_MOD || 'Alt'}</kbd>+<kbd>T</kbd>
          </span>
        </div>
      </div>

      <div className="yj-pop-foot">
        <span>设置</span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--yj-muted)' }} />
        <span>生词本 · 142</span>
        <span style={{ marginLeft: 'auto' }} className="yj-kbd"><kbd>{window.__YJ_MOD || 'Alt'}</kbd>+<kbd>A</kbd></span>
      </div>
    </div>
  );
}

function FieldBlock({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--yj-fg)', fontWeight: 500,
      }}>
        <span>{label}</span>
        <span style={{ fontSize: 10, color: 'var(--yj-muted)', fontWeight: 400 }}>{hint}</span>
      </div>
      {children}
    </div>
  );
}

window.ExtensionPopup = ExtensionPopup;
