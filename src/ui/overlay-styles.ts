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
`;
