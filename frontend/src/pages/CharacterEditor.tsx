import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characterAPI } from '../services/api';
import type { CharacterCard } from '../types';

const PANELS = [
  { key: 'guide', label: '引导', icon: '📋' },
  { key: 'identity', label: '身份', icon: '🆔' },
  { key: 'appearance', label: '外观', icon: '👁️' },
  { key: 'experience', label: '经历', icon: '📜' },
  { key: 'personality', label: '性格', icon: '🧠' },
  { key: 'philosophy', label: '理念', icon: '💭' },
  { key: 'attributes', label: '属性', icon: '📊' },
  { key: 'skills', label: '技能', icon: '⚡' },
  { key: 'equipment', label: '装备', icon: '🗡️' },
  { key: 'relationships', label: '关系', icon: '🔗' },
  { key: 'ipmeta', label: 'IP元数据', icon: '©️' },
  { key: 'preview', label: '预览', icon: '👀' },
];

const FIELD_LABELS: Record<string, string> = {
  name: '角色名', title: '称号', identity: '身份描述', gender: '性别', age: '年龄',
  appearance: '外貌特征', background: '背景经历', personality: '性格特征', beliefs: '核心理念',
  level: '等级', health: '生命值', max_health: '生命上限', mana: '法力值', max_mana: '法力上限',
  strength: '力量', agility: '敏捷', intelligence: '智力', charisma: '魅力',
  ip_type: 'IP类型', ip_source: '来源作品', ip_author: '原作者', ip_url: '参考链接',
  skills_text: '技能配置（JSON）', equipment_text: '装备配置（JSON）', relationships_text: '角色关系（文本）',
};

export default function CharacterEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<CharacterCard | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [skillsStr, setSkillsStr] = useState('[]');
  const [equipmentStr, setEquipmentStr] = useState('[]');
  const [relationshipsStr, setRelationshipsStr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      setIsNew(false);
      characterAPI.get(Number(id)).then(c => {
        setCharacter(c);
        setFormData({ ...c });
      }).catch(() => navigate('/characters'));
    } else {
      setIsNew(true);
      setFormData({
        name: '', title: '', identity: '', gender: '未知', age: '',
        appearance: '', background: '', personality: '', beliefs: '',
        level: 1, health: 100, max_health: 100, mana: 50, max_mana: 50,
        strength: 10, agility: 10, intelligence: 10, charisma: 10,
        ip_type: 'original', ip_source: '', ip_author: '', ip_url: '',
      });
    }
  }, [id, navigate]);

  const saveCharacter = async () => {
    setSaving(true);
    setSavedMsg('');
    try {
      const data: any = { ...formData };
      if (isNew) {
        const created = await characterAPI.create(data);
        setCharacter(created);
        setIsNew(false);
        navigate(`/character-editor/${created.id}`, { replace: true });
      } else if (character) {
        const updated = await characterAPI.update(character.id, data);
        setCharacter(updated);
      }
      setSavedMsg('✅ 已保存');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch {
      setSavedMsg('❌ 保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const data = { ...formData, skills: skillsStr, equipment: equipmentStr, relationships: relationshipsStr };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${formData.name || 'character'}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setFormData(prev => ({ ...prev, ...data }));
        if (data.skills) setSkillsStr(typeof data.skills === 'string' ? data.skills : JSON.stringify(data.skills));
        if (data.equipment) setEquipmentStr(typeof data.equipment === 'string' ? data.equipment : JSON.stringify(data.equipment));
        if (data.relationships) setRelationshipsStr(data.relationships);
      } catch { alert('导入失败：无效的JSON文件'); }
    };
    reader.readAsText(file);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderPanel = () => {
    const panel = PANELS[activePanel];
    switch (panel.key) {
      case 'guide':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ color: 'var(--accent-purple-light)', marginBottom: 8 }}>角色卡创建引导</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8 }}>
              角色卡是你在绘境世界中的身份标识。一个完整的角色卡包含姓名、身份、性格、
              经历、属性等多个维度。按照左侧的面板顺序，逐项填写你的角色设定。
            </p>
            <div style={{ background: 'rgba(139,92,246,0.1)', borderRadius: 8, padding: 16, border: '1px solid rgba(139,92,246,0.2)' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--accent-gold)' }}>💡 提示：</strong>
                角色卡支持导入/导出JSON格式，方便在不同世界之间复用角色。
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-gold" onClick={handleExport}>📥 导出角色</button>
              <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>📤 导入角色</button>
            </div>
          </div>
        );
      case 'identity':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            {['name', 'title', 'identity', 'gender', 'age'].map(f => (
              <div key={f}>
                <label>{FIELD_LABELS[f]}</label>
                {f === 'gender' ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['男', '女', '未知'].map(g => (
                      <button key={g} className={`btn btn-sm ${formData.gender === g ? 'btn-primary' : ''}`}
                        onClick={() => updateField('gender', g)}>{g}</button>
                    ))}
                  </div>
                ) : (
                  <input className="input" value={formData[f] || ''}
                    onChange={(e) => updateField(f, e.target.value)}
                    placeholder={`输入${FIELD_LABELS[f]}`} />
                )}
              </div>
            ))}
          </div>
        );
      case 'appearance':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <div><label>{FIELD_LABELS.appearance}</label>
              <textarea className="input" style={{ minHeight: 200 }}
                value={formData.appearance || ''} onChange={(e) => updateField('appearance', e.target.value)}
                placeholder="描述角色的外貌特征：身高、体型、发色、瞳色、面容、标志性特征..." /></div>
          </div>
        );
      case 'experience':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <div><label>{FIELD_LABELS.background}</label>
              <textarea className="input" style={{ minHeight: 200 }}
                value={formData.background || ''} onChange={(e) => updateField('background', e.target.value)}
                placeholder="描述角色的背景经历：出身、成长过程、重大事件、转折点..." /></div>
          </div>
        );
      case 'personality':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <div><label>{FIELD_LABELS.personality}</label>
              <textarea className="input" style={{ minHeight: 150 }}
                value={formData.personality || ''} onChange={(e) => updateField('personality', e.target.value)}
                placeholder="描述角色的性格特征：外向/内向、乐观/悲观、冷静/冲动..." /></div>
          </div>
        );
      case 'philosophy':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <div><label>{FIELD_LABELS.beliefs}</label>
              <textarea className="input" style={{ minHeight: 150 }}
                value={formData.beliefs || ''} onChange={(e) => updateField('beliefs', e.target.value)}
                placeholder="描述角色的核心理念：人生信条、价值观、目标..." /></div>
          </div>
        );
      case 'attributes':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {['health', 'max_health', 'mana', 'max_mana', 'level', 'strength', 'agility', 'intelligence', 'charisma'].map(f => (
                <div key={f}>
                  <label>{FIELD_LABELS[f]}</label>
                  <input className="input" type="number" value={formData[f] || 0}
                    onChange={(e) => updateField(f, parseInt(e.target.value) || 0)} />
                </div>
              ))}
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              使用JSON格式定义技能列表，每个技能包含 name、description、level：
            </p>
            <textarea className="input" style={{ minHeight: 150, fontFamily: 'monospace', fontSize: 12 }}
              value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)}
              placeholder={`[{"name":"技能名","description":"描述","level":1}]`} />
          </div>
        );
      case 'equipment':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              使用JSON格式定义装备列表，每个装备包含 name、slot、quality：
            </p>
            <textarea className="input" style={{ minHeight: 150, fontFamily: 'monospace', fontSize: 12 }}
              value={equipmentStr} onChange={(e) => setEquipmentStr(e.target.value)}
              placeholder={`[{"name":"装备名","slot":"weapon","quality":"rare"}]`} />
          </div>
        );
      case 'relationships':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
              描述角色与其他角色的关系网络：
            </p>
            <textarea className="input" style={{ minHeight: 150 }}
              value={relationshipsStr} onChange={(e) => setRelationshipsStr(e.target.value)}
              placeholder="列出角色的重要关系：家人、朋友、敌人、导师..." />
          </div>
        );
      case 'ipmeta':
        return (
          <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.3s' }}>
            {['ip_type', 'ip_source', 'ip_author', 'ip_url'].map(f => (
              <div key={f}>
                <label>{FIELD_LABELS[f]}</label>
                {f === 'ip_type' ? (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {[
                      ['original', '原创'],
                      ['jpm', '金瓶梅'],
                      ['movie', '影视'],
                      ['anime', '动漫'],
                      ['game', '游戏'],
                    ].map(([id, label]) => (
                      <button key={id} className={`btn btn-sm ${formData.ip_type === id ? 'btn-primary' : ''}`}
                        onClick={() => updateField('ip_type', id)}>{label}</button>
                    ))}
                  </div>
                ) : (
                  <input className="input" value={formData[f] || ''}
                    onChange={(e) => updateField(f, e.target.value)}
                    placeholder={`输入${FIELD_LABELS[f]}`} />
                )}
              </div>
            ))}
          </div>
        );
      case 'preview':
        return (
          <div className="flex-col gap-12" style={{ animation: 'fadeIn 0.3s' }}>
            <div style={{ textAlign: 'center', padding: 16, background: 'rgba(139,92,246,0.1)', borderRadius: 8 }}>
              <div style={{ fontSize: 48 }}>{formData.gender === '女' ? '👩' : formData.gender === '男' ? '👨' : '🧑'}</div>
              <h3 style={{ color: 'var(--accent-gold)', fontSize: 20, marginTop: 4 }}>{formData.name || '未命名'}</h3>
              <p style={{ color: 'var(--accent-purple-light)', fontSize: 13 }}>{formData.title || '无称号'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-secondary)' }}>身份：{formData.identity || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>性别：{formData.gender}</span>
              <span style={{ color: 'var(--text-secondary)' }}>年龄：{formData.age || '-'}</span>
              <span style={{ color: 'var(--text-secondary)' }}>等级：Lv{formData.level}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>❤️ {formData.health}/{formData.max_health}</span>
              <span>💎 {formData.mana}/{formData.max_mana}</span>
              <span>⚔️ 力量 {formData.strength}</span>
              <span>🏃 敏捷 {formData.agility}</span>
              <span>🧠 智力 {formData.intelligence}</span>
              <span>💬 魅力 {formData.charisma}</span>
            </div>
            {formData.appearance && (
              <div><strong style={{ fontSize: 12, color: 'var(--accent-purple-light)' }}>外观：</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                  {formData.appearance.slice(0, 200)}{formData.appearance.length > 200 ? '...' : ''}</p></div>
            )}
            {formData.background && (
              <div><strong style={{ fontSize: 12, color: 'var(--accent-purple-light)' }}>经历：</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                  {formData.background.slice(0, 200)}{formData.background.length > 200 ? '...' : ''}</p></div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-sm" onClick={() => navigate('/characters')}>← 角色库</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {isNew ? '🎭 创建角色卡' : character?.name || '🎭 角色编辑'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {savedMsg && <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{savedMsg}</span>}
          <button className="btn btn-primary btn-sm" onClick={saveCharacter} disabled={saving}>
            {saving ? '...' : '💾 保存'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {PANELS.map((p, i) => (
          <button key={p.key}
            className={`btn btn-sm ${i === activePanel ? 'btn-primary' : ''}`}
            style={{ fontSize: 11, padding: '6px 10px' }}
            onClick={() => setActivePanel(i)}>
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ minHeight: 300 }}>
        {renderPanel()}
      </div>
    </div>
  );
}
