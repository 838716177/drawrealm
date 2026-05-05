import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorldStore } from '../store/worldStore';
import { aiAPI, worldbookAPI } from '../services/api';
import type { WorldBook } from '../types';

const WIZARD_STEPS = [
  { key: 'worldview', label: '世界观概述', hint: '用一段话描述世界的基本设定' },
  { key: 'timeline', label: '时代背景', hint: '当前故事发生的时代和世界状态' },
  { key: 'world_rules', label: '世界法则', hint: '这个世界的物理/魔法规则' },
  { key: 'geography', label: '地理环境', hint: '主要地理特征和关键地点' },
  { key: 'races', label: '主要种族', hint: '世界中的智慧种族' },
  { key: 'factions', label: '势力格局', hint: '国家、组织、势力关系' },
  { key: 'history', label: '历史脉络', hint: '重大历史事件' },
  { key: 'culture', label: '文化特色', hint: '习俗、信仰、价值观' },
  { key: 'gods', label: '神祇体系', hint: '神明、信仰、宗教' },
  { key: 'artifacts', label: '神器传说', hint: '传说中的宝物' },
];

export default function AIWizard() {
  const navigate = useNavigate();
  const { appendGeneratedContent, setGeneratedContent, setIsGenerating, isGenerating, generatedContent } = useWorldStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [input, setInput] = useState('');
  const [style, setStyle] = useState('史诗奇幻');
  const [worldBook, setWorldBook] = useState<WorldBook | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [generatedContent]);

  const generateCurrentStep = async () => {
    setGeneratedContent('');
    setIsGenerating(true);

    const stepDef = WIZARD_STEPS[currentStep];
    const prompt = `请为我的${style}风格世界生成${stepDef.label}。
我的初步想法：${input}
请输出详细的${stepDef.label}设定，包含丰富的细节。`;

    try {
      const response = await aiAPI.generateWorldviewStream(prompt, style);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
            appendGeneratedContent(line.slice(6));
          }
        }
      }
    } catch (err) {
      setGeneratedContent('⚠️ 生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmStep = async () => {
    const stepDef = WIZARD_STEPS[currentStep];
    const content = editingContent || generatedContent;

    if (worldBook) {
      const updateData: any = {};
      updateData[stepDef.key] = content;
      const updated = await worldbookAPI.update(worldBook.id, updateData);
      setWorldBook(updated);
    } else if (currentStep === 0) {
      const wb = await worldbookAPI.create({
        title: input.slice(0, 50) || '未命名世界',
        description: input,
        worldview: content,
        category: style,
      });
      setWorldBook(wb);
    } else {
      const wb = await worldbookAPI.create({
        title: input.slice(0, 50) || '未命名世界',
        description: input,
        [stepDef.key]: content,
        category: style,
      });
      setWorldBook(wb);
    }

    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setGeneratedContent('');
      setEditingContent('');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.08) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-24">
        <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回</button>
        <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          步骤 {currentStep + 1}/{WIZARD_STEPS.length}
        </div>
        <div style={{ width: 60 }} />
      </div>

      <h2 className="section-title">AI 分步生成向导</h2>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap' }}>
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.key} style={{
            padding: '6px 12px', borderRadius: 20, fontSize: 11,
            background: i === currentStep ? 'rgba(139,92,246,0.3)' : i < currentStep ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.03)',
            color: i === currentStep ? 'white' : i < currentStep ? 'var(--accent-cyan)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.3s',
          }} onClick={() => { if (i <= currentStep) { setCurrentStep(i); setGeneratedContent(''); } }}>
            {i < currentStep ? '✓ ' : ''}{s.label}
          </div>
        ))}
      </div>

      {currentStep === 0 && !generatedContent && (
        <div className="flex-col gap-16" style={{ animation: 'fadeIn 0.5s' }}>
          <div>
            <label>描述你想创建的世界</label>
            <textarea
              className="input" style={{ minHeight: 100 }}
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="用一句话描述你的世界..."
            />
          </div>
          <div>
            <label>风格</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['史诗奇幻', '科幻未来', '仙侠修真', '克苏鲁', '都市传说'].map((s) => (
                <button key={s} className={`btn btn-sm ${style === s ? 'btn-primary' : ''}`}
                  onClick={() => setStyle(s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card mb-16">
        <h3 style={{ color: 'var(--accent-purple-light)', marginBottom: 8, fontSize: 16 }}>
          {WIZARD_STEPS[currentStep].label}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>
          {WIZARD_STEPS[currentStep].hint}
        </p>
        <button className="btn btn-primary btn-sm" onClick={generateCurrentStep} disabled={isGenerating}>
          🤖 AI生成此部分
        </button>
      </div>

      {(generatedContent || editingContent) && (
        <div className="flex-col gap-16">
          <div ref={contentRef} className="card" style={{ minHeight: 150, maxHeight: '40vh', overflow: 'auto' }}>
            <textarea
              className="input"
              style={{ minHeight: 150, background: 'transparent', border: 'none', resize: 'vertical' }}
              value={editingContent || generatedContent}
              onChange={(e) => setEditingContent(e.target.value)}
            />
          </div>
          {isGenerating && <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>⏳ 生成中...</p>}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!isGenerating && (
              <>
                <button className="btn btn-primary" onClick={confirmStep}>
                  {currentStep < WIZARD_STEPS.length - 1 ? '✅ 确认 → 下一步' : '✅ 完成'}
                </button>
                <button className="btn btn-gold" onClick={generateCurrentStep}>🔄 重新生成</button>
              </>
            )}
            {currentStep > 0 && (
              <button className="btn" onClick={() => { setCurrentStep(currentStep - 1); setGeneratedContent(''); }}>← 上一步</button>
            )}
          </div>
        </div>
      )}

      {currentStep === WIZARD_STEPS.length - 1 && !isGenerating && worldBook && (
        <div className="mt-24" style={{ animation: 'fadeIn 0.5s' }}>
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: 12 }}>🎉 世界构建完成！</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              {worldBook.title} 的世界已经创建完成
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate(`/play/${worldBook.id}`)}>🎮 开始冒险</button>
              <button className="btn btn-gold" onClick={() => navigate(`/editor/${worldBook.id}`)}>📝 编辑世界书</button>
              <button className="btn" onClick={() => navigate('/create')}>🏰 创建新世界</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
