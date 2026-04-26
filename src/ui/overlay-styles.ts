export const OVERLAY_CSS = `
:host { all: initial; }
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

.hj-lookup-card {
  position: absolute; z-index: 50; width: 280px;
  background: #fff; color: #1a1a1a;
  border: 1px solid #e6e8eb; border-radius: 10px;
  box-shadow: 0 18px 40px -12px rgba(20,30,50,.18), 0 4px 12px -4px rgba(20,30,50,.08);
  padding: 12px 14px 10px;
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, "PingFang SC", system-ui, sans-serif;
  animation: hj-pop .12s ease-out both;
}
@keyframes hj-pop {
  from { opacity: 0; transform: translateY(4px) scale(.98); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
.hj-lookup-card .lk-head { display: flex; align-items: baseline; gap: 8px; padding-bottom: 6px; }
.hj-lookup-card .lk-word { font-size: 18px; font-weight: 600; letter-spacing: -.01em; }
.hj-lookup-card .lk-ipa  { font-size: 12px; color: #6b7280; font-family: ui-monospace, "SF Mono", Menlo, monospace; }
.hj-lookup-card .lk-pron {
  margin-left: auto; width: 22px; height: 22px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  background: #e8f0fb; color: #2b6cb0; cursor: pointer; border: none; padding: 0;
}
.hj-lookup-card .lk-pos  { font-style: italic; color: #6b7280; font-size: 12px; margin-right: 6px; }
.hj-lookup-card .lk-defs { margin: 4px 0 8px; }
.hj-lookup-card .lk-def  { display: flex; gap: 8px; padding: 2px 0; }
.hj-lookup-card .lk-actions {
  display: flex; flex-wrap: wrap; gap: 6px;
  border-top: 1px solid #e6e8eb;
  padding-top: 8px; margin-top: 4px; font-size: 11px; color: #6b7280;
}
.hj-lookup-card .lk-chip {
  padding: 3px 8px; border-radius: 4px; background: #f6f7f9;
  cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
}
.hj-lookup-card .lk-chip:hover { background: #e8f0fb; color: #2b6cb0; }
`;
