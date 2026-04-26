import { onMessage, broadcastToTabs } from '../src/messaging/rpc';
import { Msg } from '../src/messaging/types';
import { handleTranslateBatch } from '../src/background/translate-router';
import { handleTestConnection, handleAddVocab, handleRemoveVocab, handleOpenOptions } from '../src/background/handlers';
import { handleLookupWord } from '../src/background/lookup-router';
import { onSettingsChanged } from '../src/store/storage';

export default defineBackground(() => {
  console.log('[huajing] background mounted');

  onMessage(async (msg: Msg) => {
    switch (msg.type) {
      case 'translate-batch':  return handleTranslateBatch(msg) as any;
      case 'lookup-word':      return handleLookupWord(msg) as any;
      case 'test-connection':  return handleTestConnection(msg) as any;
      case 'add-vocab':        return handleAddVocab(msg) as any;
      case 'remove-vocab':     return handleRemoveVocab(msg) as any;
      case 'open-options':     return handleOpenOptions() as any;
      default:                 return undefined;
    }
  });

  onSettingsChanged((settings) => {
    broadcastToTabs({ type: 'settings-changed', settings }).catch(() => {});
  });

  chrome.commands.onCommand.addListener(async (cmd) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    if (cmd === 'toggle-translate') chrome.tabs.sendMessage(tab.id, { type: 'cmd-toggle' }).catch(() => {});
    else if (cmd === 'cycle-mode')   chrome.tabs.sendMessage(tab.id, { type: 'cmd-cycle-mode' }).catch(() => {});
  });
});
