export type DictEntry = {
  word: string;
  ipa: string;
  pos?: string;
  defs: { pos?: string; text: string }[];
  examples?: string;
  tags?: string[];
};
