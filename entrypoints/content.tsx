import { getSettings } from '../src/store/storage';
import { activate, deactivate, rerender } from '../src/content/coordinator';
import { Msg } from '../src/messaging/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    let settings = await getSettings();
    let started = false;

    const tryActivate = async () => {
      if (!settings.enabled) return;
      if (settings.autoSites.includes(location.hostname)) {
        if ((settings.mode === 'bilingual' || settings.mode === 'replace') && !started) { await activate(settings, settings.mode); started = true; }
      }
    };

    await tryActivate();

    chrome.runtime.onMessage.addListener((msg: Msg) => {
      if (msg.type === 'settings-changed') {
        settings = msg.settings;
        if (started) rerender(settings);
        else tryActivate();
      } else if (msg.type === 'cmd-toggle') {
        if (started) { deactivate(); started = false; }
        else if (settings.mode === 'bilingual' || settings.mode === 'replace') {
          activate(settings, settings.mode).then(() => { started = true; });
        }
      }
    });
  },
});
