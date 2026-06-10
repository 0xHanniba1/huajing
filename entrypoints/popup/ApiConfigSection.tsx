import React, { useEffect, useState } from 'react';
import { Settings, ENGINE_PRESETS, EngineConfig, EngineId } from '../../src/store/types';
import { send } from '../../src/messaging/rpc';

export function ApiConfigSection({ settings, patch }: { settings: Settings; patch: (p: Partial<Settings>) => void }) {
  const [open, setOpen] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [tested, setTested] = useState<'idle'|'testing'|'ok'|'fail'>('idle');
  const [modelLookup, setModelLookup] = useState<{ status: 'idle'|'loading'|'ok'|'fail'; models: string[]; error?: string }>({ status: 'idle', models: [] });
  const cur = settings.engineConfigs[settings.engine];
  const preset = ENGINE_PRESETS[settings.engine];
  const modelListId = `hj-model-options-${settings.engine}`;
  const modelOptions = uniqueStrings([...modelLookup.models, ...preset.models]);
  const docs = { deepseek: 'platform.deepseek.com', openai: 'platform.openai.com', anthropic: 'console.anthropic.com', gemini: 'aistudio.google.com' }[settings.engine];
  const keyHint = { deepseek: 'sk-...', openai: 'sk-proj-...', anthropic: 'sk-ant-...', gemini: 'AIza...' }[settings.engine];

  useEffect(() => {
    setModelLookup({ status: 'idle', models: [] });
  }, [settings.engine, cur.baseURL, cur.apiKey]);

  const updateCur = (p: Partial<typeof cur>) => {
    patch({ engineConfigs: { ...settings.engineConfigs, [settings.engine]: { ...cur, ...p } } });
    setTested('idle');
  };

  async function testConnection() {
    if (!cur.apiKey) return;
    setTested('testing');
    try {
      const r = await send({ type: 'test-connection', engineId: settings.engine });
      setTested(r.ok ? 'ok' : 'fail');
    } catch {
      setTested('fail');
    }
  }

  async function queryModels() {
    if (!cur.baseURL.trim() || modelLookup.status === 'loading') return;
    setModelLookup({ status: 'loading', models: [] });
    try {
      const models = await fetchAvailableModels(settings.engine, cur);
      setModelLookup({ status: 'ok', models });
    } catch (e) {
      setModelLookup({ status: 'fail', models: [], error: e instanceof Error ? e.message : '查询失败' });
    }
  }

  const dot = { idle: { c: '#9aa0a6', t: '未测试' }, testing: { c: '#2b6cb0', t: '测试中…' }, ok: { c: '#34c759', t: '连接正常' }, fail: { c: '#e34c4c', t: '连接失败' } }[tested];
  const modelHint = {
    idle: '可选预设，也可手输',
    loading: '正在查询模型',
    ok: `已加载 ${modelLookup.models.length} 个模型`,
    fail: modelLookup.error || '查询失败',
  }[modelLookup.status];

  return (
    <div className="hj-pop-section">
      <div className="hj-collapse-head" onClick={() => setOpen((v) => !v)}>
        <div className="hj-pop-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>API 配置 · {settings.engine}</span>
          <span className="hj-status-tag" style={{ color: dot.c }}>
            <span className="dot" style={{ background: dot.c }} />{dot.t}
          </span>
        </div>
        <span className={'hj-chev' + (open ? ' open' : '')}>⌄</span>
      </div>
      {open && (
        <div className="hj-api-body">
          <Field label="API Key" hint={`从 ${docs} 获取`}>
            <div className="hj-input-with-btn">
              <input className="hj-input" type={showKey ? 'text' : 'password'} placeholder={keyHint}
                value={cur.apiKey} onChange={(e) => updateCur({ apiKey: e.target.value })} />
              <button
                className="hj-icon-btn"
                type="button"
                aria-label={showKey ? '隐藏 API Key' : '显示 API Key'}
                title={showKey ? '隐藏 API Key' : '显示 API Key'}
                onClick={() => setShowKey((v) => !v)}
              >
                <EyeIcon off={showKey} />
              </button>
            </div>
          </Field>
          <Field label="Base URL" hint="代理或自托管时修改">
            <input className="hj-input" value={cur.baseURL} onChange={(e) => updateCur({ baseURL: e.target.value })} />
          </Field>
          <Field
            label="模型"
            hint={modelHint}
            action={
              <button className="hj-model-query-btn hj-link-btn" type="button" disabled={!cur.baseURL.trim() || modelLookup.status === 'loading'} onClick={queryModels}>
                {modelLookup.status === 'loading' ? '查询中' : '查询模型'}
              </button>
            }
          >
            <input
              className="hj-input"
              list={modelListId}
              placeholder={preset.defaultModel}
              value={cur.model}
              onChange={(e) => updateCur({ model: e.target.value })}
            />
            <datalist id={modelListId}>
              {modelOptions.map((m) => <option key={m} value={m} />)}
            </datalist>
            {modelLookup.models.length > 0 && (
              <select
                aria-label="查询到的可用模型"
                className="hj-pop-select"
                style={{ width: '100%', marginTop: 4 }}
                value=""
                onChange={(e) => e.target.value && updateCur({ model: e.target.value })}
              >
                <option value="">选择查询到的模型</option>
                {modelLookup.models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
          </Field>
          <div className="hj-api-actions">
            <button className="hj-btn-primary" disabled={!cur.apiKey || tested === 'testing'} onClick={testConnection}>
              {tested === 'testing' ? '测试中…' : '测试连接'}
            </button>
            <span className="hj-api-note">数据仅保存于本机</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, action, children }: { label: string; hint: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="hj-field">
      <div className="hj-field-head">
        <span>{label}</span>
        <span className="hj-field-side">
          <span className="hj-field-hint">{hint}</span>
          {action}
        </span>
      </div>
      {children}
    </div>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M2.8 12c2.3-4.2 5.6-6.3 9.2-6.3s6.9 2.1 9.2 6.3c-2.3 4.2-5.6 6.3-9.2 6.3S5.1 16.2 2.8 12Z" />
      <circle cx="12" cy="12" r="2.7" />
      {off && <path d="M5 4.5 19 19.5" />}
    </svg>
  );
}

async function fetchAvailableModels(engine: EngineId, config: EngineConfig): Promise<string[]> {
  let lastError = '查询失败';
  for (const url of modelListUrls(engine, config)) {
    const r = await fetch(url, { headers: modelListHeaders(engine, config.apiKey) });
    if (!r.ok) {
      lastError = `HTTP ${r.status}`;
      continue;
    }
    const models = extractModelNames(await r.json());
    if (models.length) return models;
    lastError = '未返回模型';
  }
  throw new Error(lastError);
}

function modelListUrls(engine: EngineId, config: EngineConfig): string[] {
  const baseURL = config.baseURL.trim().replace(/\/+$/, '');
  if (!baseURL) return [];
  if (engine === 'gemini') {
    const url = new URL(`${baseURL}/models`);
    if (config.apiKey) url.searchParams.set('key', config.apiKey);
    return [url.toString()];
  }
  return [`${baseURL}/models`, `${baseURL}/model`];
}

function modelListHeaders(engine: EngineId, apiKey: string): Record<string, string> {
  if (!apiKey) return {};
  if (engine === 'anthropic') {
    return { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
  }
  if (engine === 'gemini') return {};
  return { Authorization: `Bearer ${apiKey}` };
}

function extractModelNames(payload: unknown): string[] {
  const body = payload as { data?: unknown; models?: unknown };
  const list = Array.isArray(payload) ? payload
    : Array.isArray(body?.data) ? body.data
    : Array.isArray(body?.models) ? body.models
    : [];

  return uniqueStrings(list.map((item) => {
    if (typeof item === 'string') return cleanModelName(item);
    if (!item || typeof item !== 'object') return '';
    const record = item as { id?: unknown; name?: unknown; model?: unknown };
    const name = record.id ?? record.name ?? record.model;
    return typeof name === 'string' ? cleanModelName(name) : '';
  }));
}

function cleanModelName(name: string): string {
  return name.trim().replace(/^models\//, '');
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
