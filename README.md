# 化境 Huàjìng — Chrome MV3 翻译扩展

个人自用 v0.1，不上 Web Store。3 种翻译模式 + 4 引擎 BYOK + 本地 ECDICT 词典 + 生词本。

- **设计 spec**：`docs/superpowers/specs/2026-04-26-huajing-design.md`
- **实施计划**：`docs/superpowers/plans/2026-04-26-huajing-v0.1.md`
- **设计稿源**：`_design-source/`（在浏览器开 `index.html` 看原型）

## 快速开始

```bash
pnpm install

# 一次性：构建本地词典（需要先去 https://github.com/skywind3000/ECDICT 下载 ecdict.csv）
pnpm tsx scripts/build-ecdict.ts /path/to/ecdict.csv
cp assets/ecdict.lemma.json.gz public/ecdict.lemma.json.gz

pnpm dev          # 开发模式（热更）
# 或
pnpm build        # 产物在 .output/chrome-mv3/
```

加载方式：`chrome://extensions/` → 开发者模式 → 加载已解压 → 选 `.output/chrome-mv3/`。
打开扩展弹窗 → 选引擎、填 API Key → 点"测试连接"绿后即可使用。

## 使用

- **`Alt+T`**：翻译当前页 / 还原
- **`Alt+A`**：循环切换 双语 / 替换 / 悬停 三种模式
- 弹窗里"本站自动翻译"开关 → 该域名下次打开自动翻译
- 模式 1 双语对照：每段下面追加中文译文
- 模式 2 原文替换：段落直接替换为中文，右下角 toast 可还原 / 重译
- 模式 3 悬停查词：
  - 鼠标悬停英文单词 → 出查词卡（IPA + 释义 + 标签）
  - 选中文本 → 弹出气泡：翻译 / 朗读 / 复制
  - 选中后右键 → 自绘菜单：翻译 / 朗读 / 加入生词本
- 弹窗底栏 "生词本 · N" → 完整列表（搜索 / 删除 / 标记掌握）

## 单测

```bash
pnpm test         # watch
pnpm test:run     # 跑一次
```

47 个测试覆盖：4 个引擎适配器、storage 门面、prompt 构造与解析、段落抓取、CJK 检测、fnv-1a、ECDICT IndexedDB、LLM 兜底、bilingual / replace / hover tokenize、translate-router 缓存。

## 已知限制（v0.1）

- 不流式：翻译要等整批回完才出译文（v0.2 规划加 SSE）
- 模式 4（侧栏 + AI 问答）未实现
- 替换模式会清掉段落内 `<a>` 等子元素结构（v0.1 接受这个 trade-off）
- 不翻译 PDF / iframe / 长文流式分页

## 项目布局

```
huajing/
├─ entrypoints/        # WXT 约定的 background / content / popup / options 入口
├─ src/
│  ├─ store/           # Settings + VocabEntry + chrome.storage 门面
│  ├─ messaging/       # 类型化 RPC 契约
│  ├─ engines/         # 4 个 BYOK 引擎适配器
│  ├─ dom/             # 段落抓取 / 语种检测 / hash / MutationObserver
│  ├─ modes/           # bilingual / replace / hover 三种渲染模式
│  ├─ dict/            # ECDICT IndexedDB + LLM 兜底
│  ├─ ui/              # Shadow DOM 浮层组件 + 注入样式
│  ├─ shared/          # 跨域工具
│  ├─ background/      # SW 路由 + 翻译缓存 + lookup
│  └─ content/         # 协调 4 模式的 coordinator
├─ assets/             # ECDICT 数据（gitignore）
└─ public/             # 静态资源（icons + ecdict gz，gitignore）
```
