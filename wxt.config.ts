import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '化境 Huàjìng',
    description: 'Chrome 翻译插件 — 划词查词 / 划词翻译',
    // version 不在此处声明，WXT 取 package.json 的 version 作为唯一来源
    permissions: ['storage', 'tabs'],
    host_permissions: ['<all_urls>'],
    action: {
      default_title: '化境 Huàjìng',
      default_icon: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png', 128: 'icon/128.png' },
    },
  },
});
