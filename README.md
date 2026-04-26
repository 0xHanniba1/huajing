# 化境 Huàjìng — Chrome MV3 翻译扩展

个人自用版本，不上 Web Store。详见 `docs/superpowers/specs/2026-04-26-huajing-design.md`。

## 开发

```bash
pnpm install
pnpm dev          # 开发模式（热更新）
pnpm build        # 产物在 .output/chrome-mv3/
pnpm test         # vitest watch
```

加载方式：`chrome://extensions/` → 开发者模式 → 加载已解压 → 选 `.output/chrome-mv3/`。

## 设计稿源

`_design-source/` 是从 `~/Downloads/huajing.html`（Stitch 打包的 React 原型）解出的源码，仅供实现时对照视觉与交互。
