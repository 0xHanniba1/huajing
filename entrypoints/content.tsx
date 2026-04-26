import { getSettings, patchSettings } from '../src/store/storage';
import { activate, deactivate, rerender } from '../src/content/coordinator';
import { Msg } from '../src/messaging/types';
import { Mode } from '../src/store/types';

const MODE_CYCLE: Mode[] = ['bilingual', 'replace', 'hover'];

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main() {
    let settings = await getSettings();
    let started = false;

    const tryActivate = async () => {
      if (!settings.enabled) return;
      if (settings.autoSites.includes(location.hostname)) {
        if (['bilingual','replace','hover'].includes(settings.mode) && !started) { await activate(settings, settings.mode); started = true; }
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
        else if (['bilingual','replace','hover'].includes(settings.mode)) {
          activate(settings, settings.mode).then(() => { started = true; });
        }
      } else if (msg.type === 'cmd-cycle-mode') {
        const next = MODE_CYCLE[(MODE_CYCLE.indexOf(settings.mode) + 1) % MODE_CYCLE.length];
        patchSettings({ mode: next });
      }
    });
  },
});
