export const OVERLAY_CSS = `
:host {
  all: initial;
  --hj-bg: #ffffff;
  --hj-fg: #1a1d21;
  --hj-muted: #6b7280;
  --hj-faint: #9aa0a6;
  --hj-line: #e6e8eb;
  --hj-card: #f6f7f9;
  --hj-card-2: #eef0f3;
  --hj-accent: #2b6cb0;
  --hj-accent-soft: #e8f0fb;
  --hj-translation: #2b6cb0;
  --hj-shadow-card: 0 18px 40px -12px rgba(20,30,50,0.18), 0 4px 12px -4px rgba(20,30,50,0.08);
}
.hj-toast {
  position: fixed; bottom: 12px; right: 12px;
  display: inline-flex; gap: 8px; align-items: center;
  padding: 6px 8px 6px 12px;
  background: #fff; border: 1px solid #e6e8eb;
  border-radius: 999px; font: 12px/1.4 -apple-system, system-ui, sans-serif;
  box-shadow: 0 6px 14px -6px rgba(0,0,0,.15);
}
.hj-toast .dot { width: 6px; height: 6px; border-radius: 50%; background: #34c759; }
.hj-toast .muted { color: #6b7280; }
.hj-toast button { border: 0; background: transparent; cursor: pointer; font: inherit; padding: 0; }
.hj-toast .accent { color: #2b6cb0; }
.hj-toast .close  { color: #6b7280; }

@keyframes hj-pop {
  from { opacity: 0; transform: translateY(4px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.hj-sel-panel {
  position: absolute; z-index: 55;
  max-width: min(420px, calc(100vw - 24px));
  font: 12px/1 -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
  animation: hj-pop .12s ease-out both;
}
.hj-bubble {
  background: #20242b; color: #fff;
  border-radius: 8px;
  padding: 4px;
  display: inline-flex; flex-direction: row; align-items: center; gap: 1px;
  width: max-content; max-width: 100%;
  white-space: nowrap;
  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.35);
}
.hj-bubble button {
  background: transparent; border: 0; color: #fff;
  padding: 5px 10px; border-radius: 5px; cursor: pointer;
  font: 600 12px/1 -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
  flex: 0 0 auto; white-space: nowrap;
}
.hj-bubble button:disabled { cursor: default; opacity: .7; }
.hj-bubble button:hover { background: rgba(255,255,255,0.12); }
.hj-bubble .sep { width: 1px; align-self: stretch; background: rgba(255,255,255,0.15); margin: 4px 1px; }
.hj-bubble .hj-ico {
  width: 14px; height: 14px;
  flex: 0 0 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.hj-bubble .hj-bubble-close {
  padding-left: 8px;
  padding-right: 8px;
}
.hj-bubble .hj-ico-close {
  width: 13px; height: 13px; flex-basis: 13px;
  opacity: .82;
  stroke-width: 2.6;
}
.hj-sel-result {
  margin-top: 6px; padding: 8px 10px;
  width: min(420px, calc(100vw - 24px));
  max-height: 220px; overflow: auto;
  background: var(--hj-bg); color: var(--hj-fg);
  border: 1px solid var(--hj-line); border-radius: 8px;
  box-shadow: var(--hj-shadow-card);
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
  white-space: normal;
  overflow-wrap: break-word;
  box-sizing: border-box;
}
.hj-word-card {
  margin-top: 6px;
  width: min(320px, calc(100vw - 24px));
  max-height: 260px; overflow: auto;
  background: var(--hj-bg); color: var(--hj-fg);
  border: 1px solid var(--hj-line);
  border-radius: 12px;
  box-shadow: var(--hj-shadow-card);
  padding: 14px 16px 12px;
  font: 13px/1.55 -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
  white-space: normal;
  box-sizing: border-box;
}
.hj-wc-head { display: flex; align-items: center; }
.hj-wc-title { display: flex; align-items: baseline; gap: 8px; flex: 1; min-width: 0; }
.hj-wc-word { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; color: var(--hj-fg); }
.hj-wc-ipa {
  font-size: 12px; color: var(--hj-muted);
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  white-space: normal; overflow-wrap: anywhere;
}
.hj-wc-defs { margin: 10px 0 8px; }
.hj-wc-def { display: flex; gap: 8px; padding: 2px 0; }
.hj-wc-pos { font-style: italic; color: var(--hj-muted); font-size: 12px; min-width: 22px; flex: 0 0 auto; }
.hj-wc-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding-top: 10px; margin-top: 4px;
  border-top: 1px solid var(--hj-line);
}
.hj-wc-tags { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.hj-wc-cache {
  font-size: 10.5px; padding: 2px 7px; border-radius: 4px;
  background: var(--hj-accent-soft); color: var(--hj-accent);
  display: inline-flex; align-items: center; gap: 3px;
}
.hj-wc-add {
  border: 0; background: var(--hj-accent); color: #fff;
  font-size: 11.5px; padding: 5px 10px; border-radius: 6px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 4px; font-weight: 500;
}
.hj-wc-add:hover { transform: translateY(-1px); }
.hj-wc-add.is-added { background: #34c759; }
.hj-wc-add:disabled { cursor: default; }
`;
