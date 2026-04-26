# 化境 Huàjìng — Chrome MV3 翻译扩展 v0.1 设计

来源设计稿：`~/Downloads/huajing.html`（Stitch/Omelette 打包的 React 原型，已解出全部源码于 `/tmp/huajing_assets/`）。

## 1. 目标与非目标

**目标（v0.1）**：一款个人自用的 Chrome MV3 翻译扩展，对照设计稿还原 4 种翻译模式中的 3 种 + 弹窗设置面板：

- 模式 1 双语对照（沉浸式）
- 模式 2 原文替换 + 还原 toast
- 模式 3 划词 / 悬停查词 / 词典浮卡 / 生词本
- 弹窗设置面板（开关 / 模式选择 / 4 引擎 BYOK / 译文样式：颜色/字号/分隔线 / 行为设置 / 快捷键提示）
- 生词本 options 页（列表 + 搜索 + 删除 + 标记）

**非目标（v0.1 不做）**：

- 模式 4 侧栏 + AI 问答（整个砍）
- 划词气泡的"问 AI"按钮（砍）
- 右键菜单的"问 AI / 在侧栏中打开"（砍）
- Web Store 上架（个人用 load unpacked，不做商店流程）
- 流式 SSE 逐字增量渲染（先做整段一次性）
- PDF 翻译 / iframe 内嵌内容翻译 / 长文流式分页
- 自定义 prompt / 生词本导出 CSV

## 2. 架构总览

```
manifest.json  (MV3, host_permissions: <all_urls>)

content-script.tsx        ──  注入到每个页面
  ├─ 段落抓取（DOM 走查 + MutationObserver）
  ├─ 三种渲染模式（双语 / 替换 / 划词）
  ├─ 浮层（lookup-card / sel-bubble / ctx-menu）
  └─ 与 background 通信

background.ts             ──  service worker
  ├─ 4 个 BYOK 引擎适配器路由
  ├─ 词典查询（本地 ECDICT 优先 + LLM 兜底）
  └─ chrome.storage 与广播门面

popup/                    ──  工具栏弹窗（设计稿 ⑤ 完整还原，砍掉模式 4 卡）
options/                  ──  生词本完整列表（弹窗"生词本 · N"点击进入）
```

**通信**：

- content ↔ background：`chrome.runtime.sendMessage`（普通），长任务用 `chrome.runtime.connect`。
- popup ↔ background：同上。
- settings 改动：popup 写 `chrome.storage.local` → background 广播 `settings:changed` → 所有 content script reconcile。

**注入隔离**：混合策略——

- 模式 1+2 段落级注入（追加 `.hj-trans` / 替换 textContent）必须写主 DOM，否则破坏阅读流；样式由一份 `.hj-` 前缀样式表保证不撞宿主页。
- 模式 3 浮层（lookup-card / sel-bubble / ctx-menu / sel-translation）挂在 Shadow DOM（`<huajing-overlay>` 自定义元素 + open shadow），样式不被宿主污染。

## 3. 技术栈与目录

**栈**：WXT + React 18 + TypeScript + pnpm + Vitest

WXT 选型理由：MV3 + React 体感最佳，content script HMR、自动 manifest、跨 Chrome/Edge/Firefox 一份代码。Plasmo 框架化太重；裸 Vite + 手写 manifest 调试痛苦。

**目录**：

```
huajing/
├─ wxt.config.ts
├─ package.json
├─ tsconfig.json
├─ entrypoints/
│  ├─ background.ts
│  ├─ content.tsx
│  ├─ popup/
│  │  ├─ index.html
│  │  └─ App.tsx
│  └─ options/
│     ├─ index.html
│     └─ App.tsx
├─ src/
│  ├─ engines/      # deepseek.ts / openai.ts / anthropic.ts / gemini.ts + index.ts
│  ├─ dom/          # extractParagraphs / observe / inject
│  ├─ modes/        # BilingualRenderer / ReplaceRenderer / HoverRenderer
│  ├─ dict/         # ecdict.ts (IndexedDB) + llmFallback.ts
│  ├─ store/        # chrome.storage 门面 + Settings/Vocab 类型
│  └─ ui/           # LookupCard / SelBubble / CtxMenu （Shadow DOM 内 React）
├─ assets/
│  └─ ecdict.lemma.json.gz   # ~3MB
└─ public/
   └─ icons/16,48,128       # "化"字 logo
```

**打包**：`pnpm build` → `.output/chrome-mv3/` → chrome://extensions → 加载已解压。

## 4. 翻译管道（模式 1 + 2 共用）

**段落抓取**：

- DOM 中挑块级容器：`p, li, h1-h6, blockquote, dt, dd, figcaption, td`，按 closest 块去重。
- 跳过：空段、纯数字/符号、`data-hj="1"`（防自循环）、祖先含 `code|pre|script|style|noscript|kbd`。
- **语种检测**：CJK 字符比例 > 30% 视为已是中文，跳过；否则视为外文。不引 `franc`（多 200KB）。
- 段落对象：`Paragraph { id, el, text, hash }`，`hash` 是 text 的 fnv-1a；同 hash 全局只翻一次。

**批量调度（核心性能）**：

- 段落入队列，每 80ms 出队一批，每批 ≤ 8 段或 ≤ 1500 token。
- service worker 拼成一个 prompt 调当前 BYOK 引擎，返回后按段落边界切回多个译文。
- prompt 模板（4 引擎通用）：

  ```
  你是一位精确的翻译。把下面用 ⟦n⟧…⟦/n⟧ 包裹的段落各自译为简体中文，
  保持原始顺序，不要解释，只输出 ⟦n⟧译文⟦/n⟧ 的拼接结果。

  ⟦1⟧{P1}⟦/1⟧
  ⟦2⟧{P2}⟦/2⟧
  …
  ```

- content script 收到译文 → 按 id 找回 DOM 节点 → 交给当前模式渲染器。
- 全局缓存 `Map<hash, translation>` → `chrome.storage.session`（标签页内重排不重翻）。

**4 个引擎适配器**（`src/engines/`）：

```ts
type Engine = {
  id: 'deepseek' | 'openai' | 'anthropic' | 'gemini';
  translateBatch(paragraphs: string[], opts: { targetLang: string; model: string; apiKey: string; baseURL: string }):
    Promise<string[]>;   // v0.1 整段一次性，不流式
};
```

- DeepSeek / GPT-4o：OpenAI 兼容 `/chat/completions`，一份代码两个 baseURL。
- Claude：Anthropic Messages API。
- Gemini：`generativeLanguage:generateContent`。
- key/baseURL/model 全在 `chrome.storage.local`，service worker 直接读，content script 永远碰不到 key。

**模式 1 渲染（双语）**：原 `<p>` 末尾追加 `<span class="hj-trans" data-divider={...}>{译文}</span>`，css 完全照搬设计稿 `.yj-trans`。

**模式 2 渲染（替换）**：原文存到 `WeakMap<Element, string>`，`textContent = 译文`，加 `class="hj-replaced"`（保留虚下划线）。底部"已替换原文 / 重新翻译 / ×" toast 用 `position: fixed; bottom: 12px; right: 12px;`，挂在 Shadow DOM 浮层里。

**MutationObserver**：监听 body `subtree: true, childList: true`，新节点入抓取队列。`data-hj="1"` 防自循环。

## 5. 模式 3：划词 / 悬停 / 词典

**词典数据源（双层）**：

1. **本地 ECDICT（首选）**：开源中英词典 lemma 精简版，约 30 万词条，含 IPA / 词性 / 中文释义 / CET-4/6/考研/IELTS 等标签。gzip 后 ~3MB 打进 `assets/`。装机后首次启动 → service worker 解压 → 写入 IndexedDB → 之后查询 < 1ms。
2. **LLM 兜底**：本地查不到 → 当前 BYOK 引擎结构化 prompt（要 JSON：word/ipa/pos/defs[]/examples）→ 解析回填 → 写入 IndexedDB 作为补丁。

查询接口：`background.lookup(word) → DictEntry`，content script 走 `chrome.runtime.sendMessage`。

**单词热区**：进入模式 3 时用 `Intl.Segmenter` 按 `word` 切，过滤纯标点/数字，每个英文单词包一层 `<span class="hj-hover-word">`。鼠标进入 200ms 触发查询，离开 800ms 关闭，鼠标进入卡片本身锁定。

**lookup-card**：完全照搬设计稿 `.yj-lookup-card`。发音按钮调 `speechSynthesis.speak(word)`，不依赖外部 API。卡片在 Shadow DOM。

**划词气泡**：监听 `mouseup` + `getSelection()`，选中长度 ≥ 2 字符且非全空白 → 选区上方画 `.yj-sel-bubble`。按钮：

- **翻译**：选中文本走一次 `engine.translateBatch([sel])`，结果在气泡下方画小卡。
- **朗读**：`speechSynthesis.speak(sel)`。
- **复制**：`navigator.clipboard.writeText(sel)`。

（设计稿里的"问 AI"按钮 v0.1 整个砍掉，不渲染、不留位。）

**右键菜单**：自绘 `.yj-ctx-menu`（不用 `chrome.contextMenus`，原生菜单体验差）。监听 `contextmenu` → preventDefault → 鼠标位置开菜单。条目：翻译选中 / 朗读 / 加入生词本。（"问 AI / 在侧栏中打开"砍掉。）

**生词本**：

```ts
type VocabEntry = {
  word: string;
  addedAt: number;
  status: 'new' | 'learning' | 'mastered';
  context?: string;     // 来源句子
  sourceURL?: string;
};
```

- 存 `chrome.storage.local`（量大就迁 IndexedDB；几千词以下足够）。
- 弹窗底栏 "生词本 · N" 实时显示总数；点击 → `chrome.runtime.openOptionsPage()` 打开 options 页（列表 + 搜索 + 删除 + 标记）。

## 6. 存储与行为

**`chrome.storage.local` schema**：

```ts
type EngineId = 'deepseek' | 'openai' | 'anthropic' | 'gemini';

type Settings = {
  enabled: boolean;
  mode: 'bilingual' | 'replace' | 'hover';
  targetLang: 'zh-CN' | 'zh-TW' | 'ja' | 'en';
  engine: EngineId;
  engineConfigs: Record<EngineId, { apiKey: string; baseURL: string; model: string }>;
  theme: 'light' | 'dark' | 'auto';
  autoSites: string[];                  // 自动翻译的 hostname 白名单
  transColor: string;
  transFontSize: number;
  divider: 'solid' | 'dashed' | 'dotted' | 'bracket' | 'none';
};

// keys: 'settings' (Settings), 'vocab' (VocabEntry[])
```

**行为规则**：

- 当前页 hostname 在 `autoSites` 内 → content script mount 后按 `mode` 自动翻译。
- 不在 → mount 但等待主动触发：弹窗按钮 / `Alt+T` 翻译当前页 / `Alt+A` 切换模式。
- 弹窗改设置 → 写 storage → background 广播 → content script 重新 reconcile（不重抓段落，只切渲染层）。
- 引擎切换：已翻译段落不重翻（hash 缓存生效）；新译用新引擎。
- "测试连接"按钮：真打一次 1-token 请求验 key，结果绿/红回显。

**快捷键**：`chrome.commands` 注册 `Alt+T` / `Alt+A`，service worker 收到后给 active tab 的 content script 发消息。Mac 由 UI 用 `navigator.platform` 判断显示 `Option` 或 `Alt`（设计稿原样）。

## 7. 测试与验收

不上 e2e（扩展 e2e 工具链投入产出不划算）。

**单元测试（Vitest）**：

- `src/engines/*` 4 个适配器：mock `fetch`，验证请求体 + 响应解析。
- `src/dom/extractParagraphs`：mock DOM，验证抓取 / 跳过规则。
- `src/dict/ecdict`：验证查询命中 / 未命中 / 多义词排序。

**手测脚本**：固定一组演示页 URL，人工跑一遍清单：

- NYT / The Guardian（长文 + 复杂 DOM）
- Wikipedia EN（结构化段落）
- MDN（含代码块需跳过）
- Hacker News（短段评论）

清单：首屏翻译 < 5s（4 段并发）；SPA 翻新内容（路由切换、加载更多）；模式切换不留垃圾节点（切回原文还原干净）；生词本增删持久化；4 引擎切换都能成功翻译一段。

**加载方式**：`pnpm dev` 起 WXT，浏览器装 `.output/chrome-mv3` 即可热更。

## 8. v0.1 砍/留对照表

| 设计稿元素 | v0.1 |
|---|---|
| 模式 1 双语对照 | ✅ |
| 模式 2 原文替换 + 还原 toast | ✅ |
| 模式 3 划词 / 悬停查词 / 词典浮卡 / 生词本 | ✅ |
| 模式 4 侧栏 + AI 问答 | ❌ |
| 弹窗：开关 / 模式卡（只画 1/2/3）/ 4 引擎 BYOK / API 配置 / 行为开关 / 快捷键 | ✅ |
| 划词气泡 "问 AI" 按钮 | ❌ |
| 右键菜单 "问 AI / 在侧栏中打开" | ❌ |
| 生词本 options 页 | ✅ |
| 深色模式 / 译文样式（颜色/字号/分隔线）/ 平台键名 | ✅ |
| "测试连接" 按钮（真打 1-token 请求） | ✅ |
| 流式逐字渲染 | ❌（v0.2） |
| PDF / iframe / 长文流式 | ❌（v0.2+） |
