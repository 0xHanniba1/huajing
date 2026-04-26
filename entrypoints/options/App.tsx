import React, { useEffect, useState } from 'react';
import { getVocab, removeVocab, addVocab } from '../../src/store/storage';
import { VocabEntry } from '../../src/store/types';
import './options.css';

export function App() {
  const [list, setList] = useState<VocabEntry[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'learning' | 'mastered'>('all');

  const reload = () => getVocab().then((v) => setList(v.sort((a, b) => b.addedAt - a.addedAt)));
  useEffect(() => { reload(); }, []);

  const filtered = list.filter((e) =>
    (statusFilter === 'all' || e.status === statusFilter) &&
    (q === '' || e.word.includes(q.toLowerCase()))
  );

  const setStatus = async (e: VocabEntry, status: VocabEntry['status']) => {
    await addVocab({ ...e, status });
    reload();
  };

  return (
    <div className="hj-options">
      <header><h1>化境 · 生词本</h1></header>
      <div className="toolbar">
        <input placeholder="搜索单词…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">全部</option>
          <option value="new">新词</option>
          <option value="learning">学习中</option>
          <option value="mastered">已掌握</option>
        </select>
        <span className="count">{filtered.length} / {list.length}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="empty">{list.length === 0 ? '生词本是空的——划词或悬停时点"加入生词本"。' : '没有匹配项。'}</div>
      ) : (
        <ul className="list">
          {filtered.map((e) => (
            <li key={e.word}>
              <div className="word">{e.word}</div>
              <div className="ctx">{e.context || ''}</div>
              <div className="meta">
                <span>{new Date(e.addedAt).toLocaleDateString()}</span>
                {e.sourceURL && <a href={e.sourceURL} target="_blank" rel="noreferrer">来源</a>}
              </div>
              <select value={e.status} onChange={(ev) => setStatus(e, ev.target.value as any)}>
                <option value="new">新词</option>
                <option value="learning">学习中</option>
                <option value="mastered">已掌握</option>
              </select>
              <button onClick={async () => { await removeVocab(e.word); reload(); }}>删除</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
