// article-shells.jsx — The four translation-mode demonstrations.

// ─── Shared toolbar inside each browser-window page ──────────────────────────
function ArticleToolbar({ modeLabel, modeIcon, current, onChange, hideSwitcher }) {
  const modes = [
    { id: 'bilingual', label: '对照' },
    { id: 'replace',   label: '替换' },
    { id: 'hover',     label: '划词' },
    { id: 'sidebar',   label: '侧栏' },
  ];
  return (
    <div className="yj-toolbar">
      <span className="yj-mode-pill">
        <span className="glyph">{modeIcon}</span>{modeLabel}
      </span>
      <span className="yj-kbd">
        <kbd>{window.__YJ_MOD || 'Alt'}</kbd>+<kbd>A</kbd> 切换模式 · <kbd>{window.__YJ_MOD || 'Alt'}</kbd>+<kbd>T</kbd> 翻译/还原
      </span>
      {!hideSwitcher && (
        <span className="yj-modeswitch">
          {modes.map(m => (
            <button key={m.id} className={current === m.id ? 'on' : ''} onClick={() => onChange?.(m.id)}>
              {m.label}
            </button>
          ))}
        </span>
      )}
    </div>
  );
}

function ArticleHeader() {
  const a = window.ARTICLE;
  return (
    <>
      <div className="yj-kicker">{a.kicker}</div>
      <h1 className="yj-title">{a.title}</h1>
      <div className="yj-byline">
        <span className="yj-author-pill"><span className="yj-avatar" />{a.byline.author}</span>
        <span className="dot" />
        <span>{a.byline.outlet}</span>
        <span className="dot" />
        <span>{a.byline.date}</span>
        <span className="dot" />
        <span>{a.byline.read}</span>
      </div>
      <div className="yj-hero">{a.hero}</div>
    </>
  );
}

// ─── Mode 1 · Bilingual ──────────────────────────────────────────────────────
function BilingualMode({ divider, fontSize, transColor, switchMode }) {
  const a = window.ARTICLE;
  return (
    <div className="yj-page">
      <div className="yj-article" style={{ '--yj-translation-size': fontSize + 'px', '--yj-translation': transColor }}>
        <ArticleToolbar modeLabel="双语对照（沉浸式）" modeIcon="译" current="bilingual" onChange={switchMode} />
        <ArticleHeader />
        {a.paragraphs.map((p, i) => (
          <p key={i} className="yj-p">
            {p.en}
            <span className="yj-trans" data-divider={divider}>{p.zh}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

// ─── Mode 2 · Replacement (with loading shimmer + revert toast) ──────────────
function ReplaceMode({ switchMode }) {
  const a = window.ARTICLE;
  const [state, setState] = React.useState('loaded'); // 'loading' | 'loaded'
  const [showRevert, setShowRevert] = React.useState(true);

  function retranslate() {
    setState('loading');
    setShowRevert(false);
    setTimeout(() => { setState('loaded'); setShowRevert(true); }, 1100);
  }

  return (
    <div className="yj-page">
      <div className="yj-article">
        <ArticleToolbar modeLabel="原文替换" modeIcon="替" current="replace" onChange={switchMode} />
        <ArticleHeader />
        {a.paragraphs.map((p, i) => (
          <p key={i} className="yj-p">
            {state === 'loading' ? (
              <>
                <span className="yj-loading" style={{ width: '92%' }} />{' '}
                <span className="yj-loading" style={{ width: '74%' }} />{' '}
                <span className="yj-loading" style={{ width: '58%' }} />
              </>
            ) : (
              <span className="yj-replaced">{p.zh}</span>
            )}
          </p>
        ))}
        {showRevert && (
          <div style={{
            position: 'sticky', bottom: 12, marginTop: 12,
            display: 'inline-flex', gap: 8, alignItems: 'center',
            padding: '6px 8px 6px 12px',
            background: 'var(--yj-card)',
            border: '1px solid var(--yj-line)',
            borderRadius: 999, fontSize: 12,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34c759' }} />
            <span style={{ color: 'var(--yj-muted)' }}>已替换原文</span>
            <button onClick={retranslate}
              style={{ border: 0, background: 'transparent', color: 'var(--yj-accent)', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              重新翻译
            </button>
            <button onClick={() => setShowRevert(false)}
              style={{ border: 0, background: 'transparent', color: 'var(--yj-muted)', cursor: 'pointer', font: 'inherit', padding: 0 }}>
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mode 3 · Hover / word lookup ────────────────────────────────────────────
function HoverMode({ switchMode }) {
  const a = window.ARTICLE;
  const [hovered, setHovered] = React.useState(null); // {word, x, y}
  const [selBubble, setSelBubble] = React.useState(null);
  const [ctxMenu, setCtxMenu] = React.useState(null);
  const articleRef = React.useRef(null);

  function onWordEnter(word, e) {
    const a = articleRef.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setHovered({ word, x: r.left - a.left, y: r.bottom - a.top + 6 });
  }
  function onWordLeave() {
    // small delay to allow moving onto card
    setTimeout(() => setHovered(h => h?.lock ? h : null), 80);
  }

  function onArticleContextMenu(e) {
    e.preventDefault();
    const a = articleRef.current.getBoundingClientRect();
    setCtxMenu({ x: e.clientX - a.left, y: e.clientY - a.top });
    setSelBubble(null);
  }

  // simulate selection bubble on click of a target paragraph
  function selectPhrase(e) {
    const a = articleRef.current.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setSelBubble({ x: r.left - a.left + r.width/2 - 80, y: r.top - a.top - 44 });
    setHovered(null); setCtxMenu(null);
  }

  React.useEffect(() => {
    const close = () => { setCtxMenu(null); };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Render a paragraph, splitting one chosen "hoverWord" out so it can become a hot word
  function renderParagraph(p, idx) {
    if (!p.hoverWord) {
      return <p key={idx} className="yj-p" onClick={selectPhrase}>{p.en}</p>;
    }
    const i = p.en.indexOf(p.hoverWord);
    const before = p.en.slice(0, i);
    const after  = p.en.slice(i + p.hoverWord.length);
    return (
      <p key={idx} className="yj-p" onClick={selectPhrase}>
        {before}
        <span
          className="yj-hover-word"
          onMouseEnter={(e) => onWordEnter(p.hoverWord, e)}
          onMouseLeave={onWordLeave}
          onClick={(e) => { e.stopPropagation(); onWordEnter(p.hoverWord, e); }}
        >{p.hoverWord}</span>
        {after}
      </p>
    );
  }

  const def = hovered ? window.HOVER_DEFS[hovered.word] : null;

  return (
    <div className="yj-page">
      <div className="yj-article" ref={articleRef} onContextMenu={onArticleContextMenu}>
        <ArticleToolbar modeLabel="划词 / 悬停查询" modeIcon="划" current="hover" onChange={switchMode} />
        <ArticleHeader />
        {a.paragraphs.map(renderParagraph)}

        {def && (
          <div className="yj-lookup-card"
            style={{ left: hovered.x, top: hovered.y }}
            onMouseEnter={() => setHovered(h => ({...h, lock: true}))}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="lk-head">
              <span className="lk-word">{def.word}</span>
              <span className="lk-ipa">{def.ipa}</span>
              <button className="lk-pron" title="发音">▶</button>
            </div>
            <div className="lk-defs">
              {def.defs.map((d, i) => (
                <div key={i} className="lk-def">
                  <span className="lk-pos">{d.pos}</span>
                  <span>{d.text}</span>
                </div>
              ))}
            </div>
            <div className="lk-actions">
              {def.tags.map((t, i) => (
                <span key={i} className="lk-chip">
                  {i === 0 && <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor' }}/>}
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {selBubble && (
          <div className="yj-sel-bubble" style={{ left: selBubble.x, top: selBubble.y }}>
            <button>翻译</button>
            <span className="sep" />
            <button>朗读</button>
            <span className="sep" />
            <button>问 AI</button>
            <span className="sep" />
            <button>复制</button>
          </div>
        )}

        {ctxMenu && (
          <div className="yj-ctx-menu" style={{ left: ctxMenu.x, top: ctxMenu.y }}>
            <div className="yj-ctx-item">翻译选中文字 <span className="sc">{(window.__YJ_MOD||'Alt')}+T</span></div>
            <div className="yj-ctx-item">问 AI 助手    <span className="sc">{(window.__YJ_MOD||'Alt')}+Q</span></div>
            <div className="yj-ctx-item">朗读           <span className="sc">{(window.__YJ_MOD||'Alt')}+S</span></div>
            <div className="yj-ctx-sep" />
            <div className="yj-ctx-item">加入生词本</div>
            <div className="yj-ctx-item">在侧栏中打开</div>
          </div>
        )}

        <div className="yj-floater">
          <span className="dot" />
          化境 · 监听中
        </div>
      </div>
    </div>
  );
}

// ─── Mode 4 · Sidebar + AI ───────────────────────────────────────────────────
function SidebarMode({ engine, switchMode }) {
  const a = window.ARTICLE;
  const [tab, setTab] = React.useState('translate'); // 'translate' | 'ask'
  const [draft, setDraft] = React.useState('');
  const [history, setHistory] = React.useState([
    { role: 'ai', text: { summary: '本文讨论浏览器扩展正在经历一场低调的复兴，由小型团队和 AI 工具驱动。', points: [
      '过去十年扩展生态停滞，使用率低',
      '新一代扩展由小团队 + AI 推动',
      '它们补充而非替代浏览器'
    ] } }
  ]);
  const [thinking, setThinking] = React.useState(false);
  const inputRef = React.useRef(null);

  function send(prompt) {
    const text = (prompt ?? draft).trim();
    if (!text) return;
    setHistory(h => [...h, { role: 'user', text }]);
    setDraft('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setHistory(h => [...h, { role: 'ai', text: {
        body: `从上下文看，"${text.length > 24 ? text.slice(0,24) + '…' : text}" 在文中指：作者认为新一代浏览器扩展并不是要"取代"浏览器，而是在用户已有的工作流上做轻量增强。这里的关键词是 augment（增强）而非 replace（替换）。`
      }}]);
    }, 900);
  }

  function quick(q) { send(q); }

  return (
    <div className="yj-page yj-with-side">
      <div className="yj-article">
        <ArticleToolbar modeLabel="侧栏对照 + AI 问答" modeIcon="栏" current="sidebar" onChange={switchMode} />
        <ArticleHeader />
        {a.paragraphs.map((p, i) => <p key={i} className="yj-p">{p.en}</p>)}
      </div>

      <aside className="yj-side">
        <div className="yj-side-tabs">
          <div className={'yj-side-tab' + (tab === 'translate' ? ' active' : '')} onClick={() => setTab('translate')}>译文</div>
          <div className={'yj-side-tab' + (tab === 'ask' ? ' active' : '')} onClick={() => setTab('ask')}>AI 问答</div>
          <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 11, color: 'var(--yj-muted)' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 4, background: 'var(--yj-card)'
            }}>{a.title.slice(0, 22)}…</span>
          </span>
        </div>

        <div className="yj-side-body">
          {tab === 'translate' ? (
            <>
              <div className="yj-side-orig">
                <span className="src-label">EN · 原文</span>
                {a.paragraphs[0].en}
              </div>
              <div className="yj-side-trans">
                <span className="src-label">ZH · 译文</span>
                {a.paragraphs[0].zh}
              </div>
            </>
          ) : (
            <>
              {history.map((m, i) => (
                m.role === 'ai' ? (
                  <div key={i} className="yj-ai-block">
                    <div className="yj-ai-head"><span className="yj-ai-dot" />AI 助手 · 基于本页内容</div>
                    <div className="yj-ai-msg">
                      {m.text.summary && <div style={{ marginBottom: 6 }}>{m.text.summary}</div>}
                      {m.text.points && (
                        <ul>{m.text.points.map((pt, j) => <li key={j}>{pt}</li>)}</ul>
                      )}
                      {m.text.body && <div>{m.text.body}</div>}
                    </div>
                  </div>
                ) : (
                  <div key={i} style={{
                    margin: '12px 0 12px auto',
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: '12px 12px 2px 12px',
                    background: 'var(--yj-card)',
                    fontSize: 13, lineHeight: 1.55,
                    width: 'fit-content',
                    marginLeft: 'auto',
                  }}>{m.text}</div>
                )
              ))}
              {thinking && (
                <div className="yj-ai-block" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <span className="yj-ai-dot" />
                  <span style={{ fontSize: 12, color: 'var(--yj-muted)' }}>思考中</span>
                  <ThinkingDots />
                </div>
              )}
            </>
          )}
        </div>

        <div className="yj-side-input">
          {tab === 'ask' && (
            <div className="yj-quickrow">
              <span className="yj-quick" onClick={() => quick('总结一下本文')}>总结一下</span>
              <span className="yj-quick" onClick={() => quick('这段话是什么意思？')}>这段什么意思</span>
              <span className="yj-quick" onClick={() => quick('帮我解释术语')}>专业语解释</span>
            </div>
          )}
          <div className="yj-input-wrap">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={tab === 'ask' ? '问 AI 关于本页的任何问题…' : '输入要翻译的文字…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button className="yj-send" disabled={!draft.trim()} onClick={() => send()} title="发送 (Enter)">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L12 7M12 7L8 3M12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="yj-engine-row">
            <span className="yj-engine-tag">
              <span className="yj-engine-dot" />引擎：{engine}
            </span>
            <span>Shift+Enter 换行 · Enter 发送</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

function ThinkingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--yj-accent)',
          animation: `yj-bounce 1s ${i*0.15}s infinite ease-in-out`
        }} />
      ))}
      <style>{`@keyframes yj-bounce {
        0%,80%,100% { opacity: .3; transform: translateY(0); }
        40% { opacity: 1; transform: translateY(-2px); }
      }`}</style>
    </span>
  );
}

Object.assign(window, {
  BilingualMode, ReplaceMode, HoverMode, SidebarMode,
});
