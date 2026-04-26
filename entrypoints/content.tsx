export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('[huajing] v0.1 mounted on', location.hostname);
  },
});
