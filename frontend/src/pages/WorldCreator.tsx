import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWorldStore } from '../store/worldStore';
import { aiAPI, worldbookAPI } from '../services/api';
import { WORLD_TYPES, PROTAGONIST_TYPES, PLOT_TAGS } from '../constants/worldData';
import type { WorldBook } from '../types';

type CreatorMode = 'ai' | 'quick';

export default function WorldCreator() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { setCurrentWorldBook, appendGeneratedContent, setGeneratedContent, setIsGenerating, isGenerating, generatedContent } = useWorldStore();
  const [mode, setMode] = useState<CreatorMode>('ai');
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('史诗奇幻');
  const [worldType, setWorldType] = useState('wuxia');
  const [protagonist, setProtagonist] = useState('single-male');
  const [plotTags, setPlotTags] = useState<string[]>([]);
  const [createdWorldBook, setCreatedWorldBook] = useState<WorldBook | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [generatedContent]);

  const togglePlotTag = (tagId: string) => {
    setPlotTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]);
  };

  const buildQuickPrompt = () => {
    const wt = WORLD_TYPES.find(w => w.id === worldType)!;
    const pt = PROTAGONIST_TYPES.find(p => p.id === protagonist)!;
    const selectedTags = PLOT_TAGS.filter(t => plotTags.includes(t.id));
    const tagDesc = selectedTags.length > 0
      ? selectedTags.map(t => t.desc).join('，')
      : '展开一段传奇故事';

    return `创建一个${wt.bg}风格的世界。在这个世界中，${pt.desc}，${tagDesc}。主要势力包括：${wt.races.join('、')}。请生成完整的世界观设定。`;
  };

  const startAI = async (customInput?: string) => {
    const prompt = customInput || input;
    if (!prompt.trim()) return;
    setStep(1);
    setGeneratedContent('');
    setIsGenerating(true);

    try {
      const response = await aiAPI.generateWorldviewStream(prompt, style);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.slice(6);
            if (payload !== '[DONE]') {
              appendGeneratedContent(payload);
            }
          } else if (trimmed.length > 0 && !trimmed.startsWith(':')) {
            // 兼容非SSE格式的纯文本流
            appendGeneratedContent(trimmed);
          }
        }
      }
      if (buffer.trim().length > 0) {
        appendGeneratedContent(buffer.trim());
      }
    } catch (err) {
      console.error('AI流式生成失败:', err);
      // 降级到非流式接口
      try {
        appendGeneratedContent('\n> 流式生成失败，尝试普通生成...\n');
        const result = await aiAPI.generateWorldview(prompt, style);
        setGeneratedContent(result.content || '');
      } catch (err2) {
        console.error('AI普通生成也失败:', err2);
        appendGeneratedContent('\n\n> ⚠️ AI生成失败，请检查网络或稍后重试');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickGenerate = () => {
    const prompt = buildQuickPrompt();
    setInput(prompt);
    setGeneratedContent('');
    startAI(prompt);
  };

  const saveWorldBook = async () => {
    if (!generatedContent || !user) return;
    try {
      const wt = WORLD_TYPES.find(w => w.id === worldType);
      const wb = await worldbookAPI.create({
        title: wt ? wt.bg : input.slice(0, 50) || '未命名世界',
        description: input.slice(0, 200) || plotTags.join(', '),
        worldview: generatedContent,
        category: wt ? wt.id : 'fantasy',
      });
      setCreatedWorldBook(wb);
      setCurrentWorldBook(wb);
      setStep(2);
    } catch {
      console.error('保存失败');
    }
  };

  const confirmAndGenerateOpening = async () => {
    if (!createdWorldBook) return;
    setStep(3);
    setGeneratedContent('');
    setIsGenerating(true);

    try {
      const response = await aiAPI.generateOpeningStream(createdWorldBook.id);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      let full = '';
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const payload = trimmed.slice(6);
            if (payload !== '[DONE]') {
              full += payload;
              setGeneratedContent(full);
            }
          } else if (trimmed.length > 0 && !trimmed.startsWith(':')) {
            full += trimmed;
            setGeneratedContent(full);
          }
        }
      }
      if (buffer.trim().length > 0) {
        full += buffer.trim();
        setGeneratedContent(full);
      }
    } catch (err) {
      console.error('开场故事流式生成失败:', err);
      // 降级到非流式接口
      try {
        setGeneratedContent('> 流式生成失败，尝试普通生成...\n');
        const result = await aiAPI.generateOpening(createdWorldBook.id);
        setGeneratedContent(result.content || '');
      } catch (err2) {
        console.error('开场故事普通生成也失败:', err2);
        setGeneratedContent('⚠️ 开场故事生成失败，请检查网络或稍后重试');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const startPlaying = () => {
    if (createdWorldBook) navigate(`/play/${createdWorldBook.id}`);
  };

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-24">
        <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回</button>
        <div className="tab-bar" style={{ margin: 0, border: 'none' }}>
          <button className={`tab-item ${mode === 'ai' ? 'active' : ''}`} onClick={() => { setMode('ai'); setStep(0); }}>🤖 AI生成</button>
          <button className={`tab-item ${mode === 'quick' ? 'active' : ''}`} onClick={() => { setMode('quick'); setStep(0); }}>⚡ 便捷生成</button>
        </div>
        <div style={{ width: 60 }} />
      </div>

      {mode === 'ai' && step === 0 && (
        <div className="flex-col gap-24" style={{ animation: 'fadeIn 0.5s' }}>
          <h2 className="section-title">🧠 AI世界创建</h2>
          <p className="section-subtitle">用自然语言描述你的创意，AI将为你生成完整的世界观设定</p>
          <div>
            <label>描述你想创建的世界</label>
            <textarea className="input" style={{ minHeight: 140 }} value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：一个被魔法与科技撕裂的世界，天空漂浮着古老的符文岛屿，人类与龙族签订和平条约已有千年..." />
          </div>
          <div>
            <label>故事风格</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['史诗奇幻', '黑暗奇幻', '科幻未来', '仙侠修真', '克苏鲁', '都市传说'].map(s => (
                <button key={s} className={`btn btn-sm ${style === s ? 'btn-primary' : ''}`} onClick={() => setStyle(s)}>{s}</button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => startAI()} disabled={!input.trim() || isGenerating} style={{ alignSelf: 'flex-start' }}>
            🤖 AI生成世界观
          </button>
        </div>
      )}

      {mode === 'quick' && step === 0 && (
        <div className="flex-col gap-24" style={{ animation: 'fadeIn 0.5s' }}>
          <h2 className="section-title">⚡ 便捷生成</h2>
          <p className="section-subtitle">选择类型和情节标签，AI将结合你的选择生成专属世界观</p>

          <div>
            <label style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>选择世界类型</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {WORLD_TYPES.map(wt => (
                <button key={wt.id} className={`btn ${worldType === wt.id ? 'btn-primary' : ''}`}
                  style={{ flexDirection: 'column', padding: '16px 12px', gap: 6 }}
                  onClick={() => setWorldType(wt.id)}>
                  <span style={{ fontSize: 28 }}>{wt.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{wt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>主角设定</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
              {PROTAGONIST_TYPES.map(pt => (
                <button key={pt.id} className={`btn ${protagonist === pt.id ? 'btn-primary' : ''}`}
                  style={{ flexDirection: 'column', padding: '16px 12px', gap: 4 }}
                  onClick={() => setProtagonist(pt.id)}>
                  <span style={{ fontSize: 24 }}>{pt.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{pt.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{pt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>情节标签（可多选）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLOT_TAGS.map(tag => (
                <button key={tag.id}
                  className={`btn btn-sm ${plotTags.includes(tag.id) ? 'btn-primary' : ''}`}
                  style={{ fontSize: 12, padding: '8px 16px', borderRadius: 20 }}
                  onClick={() => togglePlotTag(tag.id)}>
                  {plotTags.includes(tag.id) ? '✓ ' : '# '}{tag.name}
                </button>
              ))}
            </div>
            {plotTags.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                已选：{plotTags.map(id => PLOT_TAGS.find(t => t.id === id)!.desc).join(' | ')}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={handleQuickGenerate} disabled={isGenerating} style={{ alignSelf: 'flex-start', padding: '14px 36px', fontSize: 17 }}>
            ⚡ {plotTags.length > 0 ? '结合标签AI生成' : '开始生成'}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.5s' }}>
          <h2 className="section-title">生成世界观</h2>
          <div ref={contentRef} className="card markdown-content"
            style={{ minHeight: 300, maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {generatedContent ? (
              generatedContent
            ) : isGenerating ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div>AI正在构建你的世界...</div>
                <div style={{ fontSize: 12, marginTop: 8, color: 'var(--text-muted)' }}>这可能需要几秒钟到一分钟</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🌌</div>
                <div>准备生成世界观...</div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isGenerating && generatedContent && (
              <>
                <button className="btn btn-primary" onClick={saveWorldBook}>✅ 确认并保存世界书</button>
                <button className="btn btn-gold" onClick={() => { if (mode === 'quick') { handleQuickGenerate(); } else { startAI(); } }}>
                  🔄 重新生成
                </button>
              </>
            )}
            {isGenerating && (
              <button className="btn" disabled>
                <span className="spinner" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 8 }} />
                生成中...
              </button>
            )}
            <button className="btn" onClick={() => { setStep(0); setGeneratedContent(''); }} disabled={isGenerating}>← 返回修改</button>
          </div>
        </div>
      )}

      {step === 2 && createdWorldBook && (
        <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.5s' }}>
          <h2 className="section-title">世界书已保存 ✓</h2>
          <div className="card">
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 8 }}>{createdWorldBook.title}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{createdWorldBook.description}</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={confirmAndGenerateOpening}>🎬 生成开场故事</button>
            <button className="btn btn-gold" onClick={() => navigate(`/editor/${createdWorldBook.id}`)}>📝 编辑世界书</button>
            <button className="btn" onClick={() => startPlaying()}>🎮 直接开始游戏</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.5s' }}>
          <h2 className="section-title">开场故事</h2>
          <div className="card markdown-content" style={{ minHeight: 200, maxHeight: '60vh', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {generatedContent || (isGenerating && '⏳ AI正在撰写开场故事...')}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isGenerating && (
              <>
                <button className="btn btn-primary" onClick={startPlaying}>🎮 开始冒险！</button>
                <button className="btn btn-gold" onClick={confirmAndGenerateOpening}>🔄 重新生成开场</button>
                {createdWorldBook && <button className="btn" onClick={() => navigate(`/editor/${createdWorldBook.id}`)}>📝 编辑世界书</button>}
              </>
            )}
          </div>
        </div>
      )}

      {step === 0 && (
        <div style={{ marginTop: 48, textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 32 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 12 }}>或浏览现有的世界书</p>
          <button className="btn btn-gold btn-sm" onClick={() => navigate('/store')}>📚 世界书广场</button>
        </div>
      )}
    </div>
  );
}
