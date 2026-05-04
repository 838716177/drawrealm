import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characterAPI, aiAPI } from '../services/api';
import { AICharacterGenerator } from '../components/AICharacterGenerator';
import type { CharacterCard } from '../types';

const PANELS = [
  { key: 'guide', label: '引导', icon: '📋' },
  { key: 'identity', label: '身份', icon: '🆔' },
  { key: 'appearance', label: '外观', icon: '👁️' },
  { key: 'experience', label: '经历', icon: '📜' },
  { key: 'personality', label: '性格', icon: '🧠' },
  { key: 'philosophy', label: '理念', icon: '💭' },
  { key: 'preview', label: '预览', icon: '👀' },
];

const FIELD_LABELS: Record<string, string> = {
  name: '角色名', title: '称号', identity: '身份描述', gender: '性别', age: '年龄',
  appearance: '外貌特征', background: '背景经历', personality: '性格特征', beliefs: '核心理念',
  ip_type: 'IP类型', ip_source: '来源作品', ip_author: '原作者', ip_url: '参考链接',
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
  const [relationshipsStr, setRelationshipsStr] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI生成状态
  const [aiOverview, setAiOverview] = useState('');
  const [useImage, setUseImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    const data = { ...formData, relationships: relationshipsStr };
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
        if (data.relationships) setRelationshipsStr(data.relationships);
      } catch { alert('导入失败：无效的JSON文件'); }
    };
    reader.readAsText(file);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // AI生成功能
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const startAIGeneration = async () => {
    if (!aiOverview.trim() && !uploadedImage) {
      alert('请输入角色概述或上传角色图片');
      return;
    }
    
    setAiGenerating(true);
    try {
      // 调用AI API生成角色
      const result = await aiAPI.generateCharacter({
        overview: aiOverview,
        image: uploadedImage,
      });
      
      // 填充生成的数据
      setFormData(prev => ({
        ...prev,
        name: result.name || prev.name,
        title: result.title || prev.title,
        identity: result.identity || prev.identity,
        gender: result.gender || prev.gender,
        age: result.age || prev.age,
        appearance: result.appearance || prev.appearance,
        background: result.background || prev.background,
        personality: result.personality || prev.personality,
        beliefs: result.beliefs || prev.beliefs,
      }));
      
      // 跳转到身份面板
      setActivePanel(1);
      setSavedMsg('✨ AI生成完成');
      setTimeout(() => setSavedMsg(''), 2000);
    } catch (err) {
      console.error('AI生成失败:', err);
      alert('AI生成失败，请重试或手动创建');
    } finally {
      setAiGenerating(false);
    }
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
              经历等多个维度。你可以使用AI智能生成，或手动逐项填写。
            </p>

            {/* AI生成区域 */}
            <div style={{
              background: 'rgba(139,92,246,0.08)',
              borderRadius: 12,
              padding: 20,
              border: '1px solid rgba(139,92,246,0.2)',
              marginBottom: 16
            }}>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: 12, fontSize: 16 }}>🤖 AI 智能生成</h4>
              <AICharacterGenerator onGenerated={(data) => {
                setFormData(prev => ({
                  ...prev,
                  name: data.name || prev.name,
                  title: data.title || prev.title,
                  identity: data.identity || prev.identity,
                  gender: data.gender === 'female' ? '女' : data.gender === 'male' ? '男' : prev.gender,
                  age: data.age || prev.age,
                  appearance: data.appearance || prev.appearance,
                  background: data.background || prev.background,
                  personality: data.personality || prev.personality,
                  beliefs: data.beliefs || prev.beliefs,
                }));
                setSavedMsg('✨ AI生成完成，已填充到表单');
                setTimeout(() => setSavedMsg(''), 2000);
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>高级选项</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                输入角色概述，AI将为你生成完整的角色设定
              </p>
              <textarea
                className="input"
                style={{ minHeight: 100, marginBottom: 12 }}
                value={aiOverview}
                onChange={(e) => setAiOverview(e.target.value)}
                placeholder="描述你想要的角色...\n例如：一个来自东方古国的剑客，性格冷峻，背负着灭门之仇，手持一柄传世名剑..."
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <input
                  type="checkbox"
                  id="useImage"
                  checked={useImage}
                  onChange={(e) => setUseImage(e.target.checked)}
                  style={{ accentColor: 'var(--accent-purple)' }}
                />
                <label htmlFor="useImage" style={{ color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                  📷 以图生成
                </label>
              </div>

              {useImage && (
                <div style={{ marginBottom: 12 }}>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {!uploadedImage ? (
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      style={{
                        border: '2px dashed rgba(139,92,246,0.3)',
                        borderRadius: 8,
                        padding: 24,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    >
                      <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>📷</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>点击上传角色图片</span>
                      <span style={{ color: 'var(--text-dim)', fontSize: 12, display: 'block', marginTop: 4 }}>
                        AI将识别图片中的人物形象并生成对应内容
                      </span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img
                        src={uploadedImage}
                        alt="预览"
                        style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8, border: '1px solid var(--border-color)' }}
                      />
                      <button
                        onClick={removeImage}
                        style={{
                          position: 'absolute', top: -8, right: -8,
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'rgba(255,0,0,0.7)', color: '#fff',
                          border: 'none', cursor: 'pointer', fontSize: 12,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={startAIGeneration}
                disabled={aiGenerating}
                style={{ width: '100%' }}
              >
                {aiGenerating ? '⏳ 生成中...' : '✨ AI智能生成角色'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>或</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm btn-gold" onClick={handleExport}>📥 导出角色</button>
              <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>📤 导入角色</button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
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
