import React, { useEffect, useState } from 'react';
import { getVocab, removeVocab, addVocab } from '../../src/store/storage';
import { VocabEntry } from '../../src/store/types';
import './options.css';

export function App() {
  const [list, setList] = useState<VocabEntry[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'learning' | 'mastered'>('all');

  const reload = () => getVocab().then((v) => setList(v.sort((a, b) => b.addedAt - a.addedAt)));
  useEffect(() => { reload(); }, []);

  const learningCount = list.filter((e) => e.status !== 'mastered').length;
  const masteredCount = list.filter((e) => e.status === 'mastered').length;
  const query = q.trim().toLowerCase();
  const filtered = list.filter((e) => {
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'learning' ? e.status !== 'mastered' : e.status === 'mastered');
    const searchable = [e.word, e.ipa, definitionText(e), e.context, e.sourceURL].filter(Boolean).join(' ').toLowerCase();
    return matchesStatus && (query === '' || searchable.includes(query));
  });

  const setStatus = async (e: VocabEntry, status: VocabEntry['status']) => {
    await addVocab({ ...e, status });
    reload();
  };

  return (
    <div className="hj-wb">
      <header className="hj-wb-head">
        <div>
          <div className="hj-wb-title">生词本</div>
          <div className="hj-wb-sub">{list.length} 个词 · 已掌握 {masteredCount}</div>
        </div>
        <div className="hj-wb-actions">
          <button className="hj-btn-ghost-sm" type="button">导入</button>
          <button className="hj-btn-ghost-sm" type="button">导出 CSV</button>
          <button className="hj-btn-primary-sm" type="button">+ 手动添加</button>
        </div>
      </header>

      <div className="hj-wb-toolbar">
        <label className="hj-wb-search">
          <span>⌕</span>
          <input placeholder="搜索单词…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="hj-wb-tabs">
          <button className={'hj-wb-tab' + (statusFilter === 'all' ? ' on' : '')} onClick={() => setStatusFilter('all')}>
            全部 <span className="n">{list.length}</span>
          </button>
          <button className={'hj-wb-tab' + (statusFilter === 'learning' ? ' on' : '')} onClick={() => setStatusFilter('learning')}>
            学习中 <span className="n">{learningCount}</span>
          </button>
          <button className={'hj-wb-tab' + (statusFilter === 'mastered' ? ' on' : '')} onClick={() => setStatusFilter('mastered')}>
            已掌握 <span className="n">{masteredCount}</span>
          </button>
        </div>
      </div>

      <div className="hj-wb-list">
        <div className="hj-wb-row hj-wb-rowhead">
          <span>单词</span>
          <span>释义</span>
          <span>来源 / 添加时间</span>
          <span />
        </div>
        {filtered.length === 0 ? (
          <div className="empty">{list.length === 0 ? '生词本是空的。划词查词后可以加入生词本。' : '没有匹配项。'}</div>
        ) : (
          filtered.map((e) => (
            <div className={'hj-wb-row' + (e.status === 'mastered' ? ' is-mastered' : '')} key={e.word}>
              <div className="c-word">
                <span className="w">{e.word}</span>
                {e.ipa && <span className="ipa">{e.ipa}</span>}
              </div>
              <div className="c-def">
                <span>{definitionText(e)}</span>
                <span className="tags">
                  {definitionTags(e).map((tag) => <span className="tg" key={tag}>{tag}</span>)}
                </span>
              </div>
              <div className="c-meta">
                {e.sourceURL && <a className="src" href={e.sourceURL} target="_blank" rel="noreferrer">{hostOf(e.sourceURL)}</a>}
                <span>{formatDate(e.addedAt)}</span>
              </div>
              <div className="c-act">
                <button title="朗读" onClick={() => speechSynthesis.speak(new SpeechSynthesisUtterance(e.word))}>🔊</button>
                <button
                  title={e.status === 'mastered' ? '设为学习中' : '标为已掌握'}
                  onClick={() => setStatus(e, e.status === 'mastered' ? 'learning' : 'mastered')}
                >
                  ✓
                </button>
                <button title="删除" onClick={async () => { await removeVocab(e.word); reload(); }}>×</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function statusText(status: VocabEntry['status']): string {
  return status === 'mastered' ? '已掌握' : status === 'learning' ? '学习中' : '新词';
}

function definitionText(entry: VocabEntry): string {
  const defs = entry.defs?.map((def) => def.text.trim()).filter(Boolean) ?? [];
  if (defs.length > 0) return defs.join('；');
  return entry.context || '暂无释义';
}

function definitionTags(entry: VocabEntry): string[] {
  const parts = entry.defs?.map((def) => def.pos?.trim()).filter((pos): pos is string => !!pos) ?? [];
  const unique = [...new Set(parts)];
  return unique.length > 0 ? unique : [statusText(entry.status)];
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString();
}
