# 化境 Huajing

Chrome MV3 翻译扩展。支持划词查词、划词翻译、朗读、生词本，以及 DeepSeek / OpenAI / Anthropic / Gemini 的 BYOK 配置。

> 当前项目面向本地加载使用，暂未发布到 Chrome Web Store。

- **设计 spec**：`docs/superpowers/specs/2026-04-26-huajing-design.md`
- **实施计划**：`docs/superpowers/plans/2026-04-26-huajing-v0.1.md`
- **设计稿源**：`_design-source/`（在浏览器开 `index.html` 看原型）

## 普通用户安装

不需要执行 `pnpm`，也不需要安装 Git、Node.js 或任何开发工具。

1. 打开 [Releases](https://github.com/0xHanniba1/huajing/releases)
2. 下载最新版里的 `huajing-chrome-mv3.zip`
3. 解压这个 zip，得到一个包含 `manifest.json` 的文件夹
4. 打开 Chrome，进入 `chrome://extensions/`
5. 开启右上角“开发者模式”
6. 点击“加载已解压的扩展程序”
7. 选择第 3 步解压出来的文件夹
8. 打开扩展弹窗，选择服务商，填写 API Key，点击“测试连接”

更新版本时，下载新的 zip，解压后覆盖旧文件夹，然后在 `chrome://extensions/` 里点击化境卡片上的刷新按钮。

## Features

- 划词查词：选中单个英文单词后展示音标、释义，并可加入生词本
- 划词翻译：选中短语或句子后调用配置的 LLM 翻译
- 多服务商：DeepSeek、OpenAI、Anthropic、Gemini
- BYOK：API Key 仅保存在本机浏览器 `chrome.storage.local`
- 生词本：搜索、删除、标记学习状态
- 样式配置：译文颜色、字号、分隔样式和浅/深色模式

## 开发者运行

```bash
pnpm install

pnpm dev
```

开发模式加载方式：

1. 打开 `chrome://extensions/`
2. 开启开发者模式
3. 点击“加载已解压的扩展程序”
4. 选择 `.output/chrome-mv3/`
5. 打开扩展弹窗，选择服务商，填写 API Key，点击“测试连接”

构建生产包：

```bash
pnpm build
pnpm zip
```

## Usage

- 选中单个英文单词：弹出查词/朗读操作，查词结果可加入生词本
- 选中短语或句子：弹出翻译/朗读操作，译文显示在所选文本附近
- 弹窗底栏“生词本”：打开完整列表，支持搜索、删除、标记掌握

## Configuration

Base URL 需要填写服务商根地址，不要填写完整接口路径。例如：

```text
DeepSeek: https://api.deepseek.com/v1
OpenAI: https://api.openai.com/v1
```

使用 OpenAI 兼容中转站时也应填写根地址：

```text
https://your-proxy.example.com/v1
```

扩展会自动拼接 `/models` 和 `/chat/completions`。

## Test

```bash
pnpm test
pnpm test:run
```

测试覆盖：引擎适配器、storage 门面、prompt 构造与解析、fnv-1a、划词气泡、translate-router 缓存。

## Privacy

- API Key 只保存在本机浏览器存储中
- 项目不内置任何服务商密钥
- 翻译请求会发送到用户配置的服务商或中转站
- 生词本和扩展设置保存在本机

## Known Limitations

- 不流式：翻译需等待服务商完整返回
- 侧栏 + AI 问答模式未实现
- 不翻译 PDF / iframe / 长文流式分页

## Project Layout

```
huajing/
├─ entrypoints/        # WXT 约定的 background / content / popup / options 入口
├─ src/
│  ├─ store/           # Settings + VocabEntry + chrome.storage 门面
│  ├─ messaging/       # 类型化 RPC 契约
│  ├─ engines/         # 4 个 BYOK 引擎适配器
│  ├─ dom/             # fnv-1a hash（翻译缓存键）
│  ├─ modes/           # selection-based translation / lookup
│  ├─ dict/            # DictEntry 类型定义
│  ├─ ui/              # Shadow DOM 浮层组件 + 注入样式
│  ├─ background/      # SW 路由 + 翻译缓存 + lookup
│  └─ content/         # content script coordinator
└─ public/             # 静态资源
```

## License

ISC
