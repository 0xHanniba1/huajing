import { onMessage, broadcastToTabs } from '../src/messaging/rpc';
import { Msg } from '../src/messaging/types';
import { handleTranslateBatch } from '../src/background/translate-router';
import { handleLookupWord } from '../src/background/word-router';
import { handleTestConnection, handleAddVocab, handleRemoveVocab, handleOpenOptions } from '../src/background/handlers';
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
});
