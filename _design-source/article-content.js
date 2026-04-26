// article-content.jsx — Shared article data (English original + Chinese translation per paragraph)

const ARTICLE = {
  kicker: "TECHNOLOGY · LONG READ",
  title: "Inside the Quiet Renaissance of Browser Extensions",
  byline: { author: "Hana Müller", outlet: "The Daily Wire", date: "Apr 24, 2026", read: "8 min read" },
  hero: "[ image — newsroom shot, b/w, 1600×900 ]",
  paragraphs: [
    {
      en: "For the last decade, browser extensions felt like a backwater of the web. Most users installed two or three, forgot they existed, and only noticed them when something broke. But over the last eighteen months, a quiet renaissance has been unfolding in the toolbar.",
      zh: "在过去的十年里，浏览器扩展像是 Web 世界里一片被遗忘的水域。大多数用户装了两三个，便再也不会想起，直到某天它们出了问题。但在过去的十八个月里，一场安静的复兴正在浏览器工具栏中悄然展开。"
    },
    {
      en: "The shift is being driven by small teams shipping focused, AI-augmented tools — translators, readers, writing assistants — that live where the user actually works: inside the page they are reading. The new wave doesn't try to replace the browser; it gently augments it.",
      zh: "这场变化由一批小团队推动，他们交付的是聚焦、AI 增强的工具——翻译器、阅读器、写作助手——并让它们存在于用户真正工作的地方：他们正在阅读的页面里。这股新浪潮不试图取代浏览器；它在轻轻地增强浏览器。",
      // word the hover demo will key off (matches index of substring "augments")
      hoverWord: "augments"
    },
    {
      en: "A translation extension built around a component-based architecture and a virtual DOM, for instance, can swap or interleave text without breaking the host site's layout — a trick that was clumsy and slow only a few years ago.",
      zh: "举例来说，一个围绕基于组件的架构和虚拟 DOM 构建的翻译扩展，可以在不破坏宿主站点布局的前提下替换或穿插文本——这在几年前还是个笨拙又缓慢的把戏。",
      hoverWord: "architecture"
    },
    {
      en: "What's more interesting than the technology is the user behavior. People are leaving these tools on by default. They are not novelties anymore; they are part of how reading on the web works.",
      zh: "比技术更有意思的是用户行为。人们开始默认让这些工具一直开着。它们不再是新奇玩意儿；它们已成为网页阅读方式的一部分。"
    }
  ]
};

const HOVER_DEFS = {
  augments: {
    word: "augments",
    ipa: "/ˈɔːɡments/",
    pos: "v.",
    defs: [
      { pos: "v.", text: "增强；增加；扩充（尤指尺寸、数量或价值）" },
      { pos: "v.", text: "（计算机）扩展现有功能而不替换它" }
    ],
    examples: "AI augments human writing.",
    tags: ["四级", "考研", "技术词"]
  },
  architecture: {
    word: "architecture",
    ipa: "/ˈɑːrkɪtektʃər/",
    pos: "n.",
    defs: [
      { pos: "n.", text: "架构；体系结构" },
      { pos: "n.", text: "建筑学；建筑风格" }
    ],
    examples: "A component-based architecture.",
    tags: ["六级", "已掌握", "加入生词本"]
  }
};

window.ARTICLE = ARTICLE;
window.HOVER_DEFS = HOVER_DEFS;
