import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '化境 Huàjìng',
    description: 'Chrome 翻译插件 — 划词查词 / 划词翻译',
    version: '1.0.0',
    permissions: ['storage', 'tabs'],
    host_permissions: ['<all_urls>'],
    action: { default_title: '化境 Huàjìng' },
  },
});
