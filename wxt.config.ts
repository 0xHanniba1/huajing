import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '化境 Huàjìng',
    description: 'Chrome 翻译插件 — 双语对照 / 替换 / 划词查词',
    version: '0.1.0',
    permissions: ['storage', 'contextMenus', 'activeTab', 'tabs'],
    host_permissions: ['<all_urls>'],
    commands: {
      'toggle-translate': {
        suggested_key: { default: 'Alt+T', mac: 'Alt+T' },
        description: '翻译当前页 / 还原',
      },
      'cycle-mode': {
        suggested_key: { default: 'Alt+A', mac: 'Alt+A' },
        description: '切换翻译模式',
      },
    },
    action: { default_title: '化境 Huàjìng' },
  },
});
