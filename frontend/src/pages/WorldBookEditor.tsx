import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { worldbookAPI } from '../services/api';
import type { WorldBook } from '../types';

const EDIT_PANELS = [
  { key: 'title', label: '基本设定', fields: ['title', 'subtitle', 'description', 'category', 'tags'] },
  { key: 'worldview', label: '世界观', fields: ['worldview'] },
  { key: 'timeline', label: '时代背景', fields: ['timeline'] },
  { key: 'world_rules', label: '世界法则', fields: ['world_rules'] },
  { key: 'geography', label: '地理环境', fields: ['geography'] },
  { key: 'races', label: '种族设定', fields: ['races'] },
  { key: 'factions', label: '势力格局', fields: ['factions'] },
  { key: 'history', label: '历史脉络', fields: ['history'] },
  { key: 'culture', label: '文化特色', fields: ['culture'] },
  { key: 'gods', label: '神祇体系', fields: ['gods'] },
  { key: 'artifacts', label: '神器传说', fields: ['artifacts'] },
];

const FIELD_LABELS: Record<string, string> = {
  title: '世界名称', subtitle: '副标题', description: '简介',
  category: '分类', tags: '标签（逗号分隔）',
  worldview: '世界观概述', timeline: '时代背景', world_rules: '世界法则',
  geography: '地理环境', races: '种族设定', factions: '势力格局',
  history: '历史脉络', culture: '文化特色', gods: '神祇体系', artifacts: '神器传说',
};

export default function WorldBookEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [worldBook, setWorldBook] = useState<WorldBook | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    if (id) {
      worldbookAPI.get(Number(id)).then(setWorldBook).catch(() => navigate('/'));
    }
  }, [id, navigate]);

  useEffect(() => {
    if (worldBook) {
      const d: Record<string, string> = {};
      EDIT_PANELS.forEach((panel) => {
        panel.fields.forEach((f) => {
          d[f] = (worldBook as any)[f] || '';
        });
      });
      setFormData(d);
    }
  }, [worldBook]);

  const savePanel = async () => {
    if (!worldBook) return;
    setSaving(true);
    setSavedMsg('');
    try {
      const panel = EDIT_PANELS[activePanel];
      const updateData: Record<string, string> = {};
      panel.fields.forEach((f) => { updateData[f] = formData[f] || ''; });
      const updated = await worldbookAPI.update(worldBook.id, updateData);
      setWorldBook(updated);
      setSavedMsg('✅ 已保存');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (err) {
      setSavedMsg('❌ 保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (!worldBook) {
    return <div className="page-container centered"><div style={{ color: 'var(--text-secondary)' }}>加载中...</div></div>;
  }

  const panel = EDIT_PANELS[activePanel];

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-16">
        <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-gold)' }}>{worldBook.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>世界书编辑器</div>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {EDIT_PANELS.map((p, i) => (
          <button
            key={p.key}
            className={`btn btn-sm ${i === activePanel ? 'btn-primary' : ''}`}
            onClick={() => setActivePanel(i)}
            style={{ fontSize: 12 }}
          >{p.label}</button>
        ))}
      </div>

      <div className="card" style={{ animation: 'fadeIn 0.3s' }}>
        <div className="flex-between mb-16">
          <h3 style={{ color: 'var(--accent-purple-light)', fontSize: 18 }}>{panel.label}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {savedMsg && <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{savedMsg}</span>}
            <button className="btn btn-primary btn-sm" onClick={savePanel} disabled={saving}>
              {saving ? '保存中...' : '💾 保存'}
            </button>
          </div>
        </div>

        <div className="flex-col gap-16">
          {panel.fields.map((field) => (
            <div key={field}>
              <label>{FIELD_LABELS[field] || field}</label>
              {field === 'description' || field === 'tags' ? (
                <input
                  className="input"
                  value={formData[field] || ''}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  placeholder={`输入${FIELD_LABELS[field] || field}`}
                />
              ) : (
                <textarea
                  className="input"
                  style={{ minHeight: field === 'title' ? 50 : 200 }}
                  value={formData[field] || ''}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  placeholder={`输入${FIELD_LABELS[field] || field}...`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
