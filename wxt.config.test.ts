import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import config from './wxt.config';

describe('extension manifest config', () => {
  it('leaves manifest version to package.json as the single source', () => {
    expect((config as { manifest?: { version?: string } }).manifest?.version).toBeUndefined();

    const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as { version?: string };
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('does not register keyboard commands', () => {
    expect((config as { manifest?: { commands?: unknown } }).manifest?.commands).toBeUndefined();
  });

  it('does not request unused heavy interaction permissions', () => {
    const permissions = (config as { manifest?: { permissions?: string[] } }).manifest?.permissions ?? [];

    expect(permissions).not.toContain('contextMenus');
    expect(permissions).not.toContain('activeTab');
  });

  it('declares the options entrypoint should open in a full tab for WXT output', () => {
    const html = readFileSync(resolve(process.cwd(), 'entrypoints/options/index.html'), 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = doc.querySelector('meta[name="wxt.open_in_tab"]');

    expect(meta?.getAttribute('content')).toBe('true');
  });
});
