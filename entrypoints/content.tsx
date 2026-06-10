import { getSettings } from '../src/store/storage';
import { activate, deactivate, rerender } from '../src/content/coordinator';
import { Msg } from '../src/messaging/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  async main(ctx) {
    let settings = await getSettings();
    let active = false;

    const stop = () => {
      if (!active) return;
      deactivate();
      active = false;
    };

    const start = async () => {
      if (!settings.enabled) return;
      if (active) deactivate();
      await activate(settings, 'hover');
      active = true;
    };

    const reconcile = async () => {
      if (!settings.enabled) {
        stop();
        return;
      }
      if (!active) {
        await start();
        return;
      }
      rerender(settings);
    };

    await reconcile();

    const onMessage = (msg: Msg) => {
      if (msg.type === 'settings-changed') {
        settings = msg.settings;
        reconcile().catch(() => {});
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);
    ctx.onInvalidated(() => {
      stop();
      chrome.runtime.onMessage.removeListener(onMessage);
    });
  },
});
