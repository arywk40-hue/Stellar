"use client";
import { useState, PropsWithChildren, ReactNode } from 'react';

type Tab = { id: string; title: string; content: ReactNode };

export default function Tabs({ tabs, initial = 'donate' }: { tabs: Tab[]; initial?: string }) {
  const [active, setActive] = useState(initial);
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div className="nav-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`nav-tab ${active===t.id ? 'active':''}`} onClick={() => setActive(t.id)}>{t.title}</button>
        ))}
      </div>
      <div className="tab-content">
        {tabs.map(t => (
          <div key={t.id} className={`tab-pane ${active===t.id ? 'active':''}`}>{t.content}</div>
        ))}
      </div>
    </div>
  );
}
