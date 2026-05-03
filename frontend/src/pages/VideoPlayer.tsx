import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorldStore } from '../store/worldStore';
import { worldbookAPI, sceneAPI, characterAPI, aiAPI } from '../services/api';
import type { WorldBook, Scene, StoryBranch, CharacterCard } from '../types';

type Phase = 'selecting_character' | 'loading' | 'generating_opening' | 'playing' | 'choices' | 'transition' | 'error';

export default function VideoPlayer() {
  const { worldbookId } = useParams<{ worldbookId: string }>();
  const navigate = useNavigate();
  const { setCurrentWorldBook, setCurrentScene, setCurrentBranches, setSelectedCharacter, selectedCharacter } = useWorldStore();
  const [worldBook, setWorldBook] = useState<WorldBook | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [branches, setBranches] = useState<StoryBranch[]>([]);
  const [phase, setPhase] = useState<Phase>('selecting_character');
  const [sceneDesc, setSceneDesc] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [sceneHistory, setSceneHistory] = useState<string[]>([]);
  const [statusText, setStatusText] = useState('正在连接世界...');
  const [userCharacters, setUserCharacters] = useState<CharacterCard[]>([]);
  const [charLoading, setCharLoading] = useState(true);
  const [charExpanded, setCharExpanded] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    loadUserCharacters();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const loadUserCharacters = async () => {
    setCharLoading(true);
    try {
      const chars = await characterAPI.list({ my_only: true });
      if (mountedRef.current) setUserCharacters(chars);
    } catch {
      if (mountedRef.current) setUserCharacters([]);
    } finally {
      if (mountedRef.current) setCharLoading(false);
    }
  };

  const selectCharacter = (char: CharacterCard) => {
    setSelectedCharacter(char);
    setPhase('loading');
    loadWorldBook(char);
  };

  const skipCharacterSelection = () => {
    setSelectedCharacter(null);
    setPhase('loading');
    loadWorldBook(null);
  };

  const loadWorldBook = async (char: CharacterCard | null) => {
    if (!worldbookId) return;
    try {
      setStatusText('正在加载世界书...');
      const wb = await worldbookAPI.get(Number(worldbookId));
      if (!mountedRef.current) return;
      setWorldBook(wb);
      setCurrentWorldBook(wb);
      await loadOrGenerateOpening(wb, char);
    } catch {
      if (!mountedRef.current) return;
      setErrorMsg('无法加载世界书，请返回重试');
      setPhase('error');
    }
  };

  const loadOrGenerateOpening = async (wb: WorldBook, char: CharacterCard | null) => {
    try {
      setStatusText('正在查找已有场景...');
      const scenes = await sceneAPI.list(wb.id);
      if (!mountedRef.current) return;

      if (scenes.length > 0) {
        const openingScene = scenes[0];
        setScene(openingScene);
        setCurrentScene(openingScene);
        setSceneDesc(openingScene.description || '暂无场景描述');
        if (openingScene.image_url) setImageUrl(openingScene.image_url);

        const sceneBranches = await sceneAPI.branches(openingScene.id);
        if (!mountedRef.current) return;

        if (sceneBranches.length > 0) {
          setBranches(sceneBranches);
          setCurrentBranches(sceneBranches);
          setPhase('choices');
        } else {
          setPhase('playing');
          startProgress();
        }
      } else {
        await generateOpeningStory(wb, char);
      }
    } catch {
      if (!mountedRef.current) return;
      await generateOpeningStory(wb, char);
    }
  };

  const buildCharacterContext = (char: CharacterCard): string => {
    const parts: string[] = [];
    if (char.name) parts.push(`角色名：${char.name}`);
    if (char.title) parts.push(`称号：${char.title}`);
    if (char.identity) parts.push(`身份：${char.identity}`);
    if (char.gender && char.gender !== '未知') parts.push(`性别：${char.gender}`);
    if (char.age) parts.push(`年龄：${char.age}`);
    if (char.appearance) parts.push(`外貌：${char.appearance}`);
    if (char.personality) parts.push(`性格：${char.personality}`);
    if (char.background) parts.push(`背景：${char.background}`);
    if (char.beliefs) parts.push(`理念：${char.beliefs}`);
    parts.push(`属性：力量${char.strength} 敏捷${char.agility} 智力${char.intelligence} 魅力${char.charisma} 等级${char.level}`);
    return parts.join('；');
  };

  const generateOpeningStory = async (wb: WorldBook, char: CharacterCard | null) => {
    setPhase('generating_opening');
    setStatusText(char ? `AI正在以「${char.name}」为主角撰写开场...` : 'AI正在撰写开场故事...');

    try {
      const res = await aiAPI.generateOpening(wb.id, char?.id);
      if (!mountedRef.current) return;

      let storyContent = res.content;

      if (char) {
        const charCtx = buildCharacterContext(char);
        storyContent = `【主角设定】\n${charCtx}\n\n【故事开场】\n${storyContent}`;
      }

      setSceneDesc(storyContent);

      setStatusText('AI正在生成场景...');
      const sceneDescText = char
        ? `${char.name}的冒险开场：${storyContent.slice(0, 400)}`
        : storyContent.slice(0, 500);
      const sceneData = await aiAPI.generateScene(wb.id, '故事开场', sceneDescText, '');
      if (!mountedRef.current) return;

      setScene(sceneData);
      setCurrentScene(sceneData);
      setSceneHistory([storyContent]);

      setStatusText('AI正在生成选项...');
      const branchesData = await aiAPI.generateBranches(wb.id, sceneData.scene_id, 3);
      if (!mountedRef.current) return;

      setBranches(branchesData);
      setCurrentBranches(branchesData);
      setPhase('playing');
      startProgress();
    } catch {
      if (!mountedRef.current) return;
      setErrorMsg('AI生成失败，可能是网络问题，请返回重试');
      setPhase('error');
    }
  };

  const startProgress = useCallback(() => {
    setProgress(0);
    const duration = 5000;
    const step = 50 / duration * 100;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('choices');
          return 100;
        }
        return next;
      });
    }, 50);
  }, []);

  const skipToChoices = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    setPhase('choices');
  };

  const handleChoice = async (branch: StoryBranch) => {
    if (selectedChoice !== null) return;
    setSelectedChoice(branch.id);
    setPhase('transition');
    setStatusText('故事继续发展...');

    try {
      const res = await sceneAPI.selectBranch(scene!.id, branch.id);
      if (!mountedRef.current) return;

      if (res.next_scene) {
        setScene(res.next_scene);
        setCurrentScene(res.next_scene);
        setSceneDesc(res.next_scene.description || '');
        if (res.next_scene.image_url) setImageUrl(res.next_scene.image_url);

        const nextBranches = await sceneAPI.branches(res.next_scene.id);
        if (!mountedRef.current) return;

        setBranches(nextBranches.length > 0 ? nextBranches : []);
        setCurrentBranches(nextBranches.length > 0 ? nextBranches : []);
        setSceneHistory(prev => [...prev, res.next_scene.description || '']);
        setPhase('playing');
        startProgress();
      } else if (worldBook) {
        const charCtx = selectedCharacter ? `\n当前主角：${buildCharacterContext(selectedCharacter)}\n` : '';
        const previousContext = sceneHistory.slice(-5).join('\n');
        const fullCtx = previousContext + charCtx;
        const sceneData = await aiAPI.generateScene(worldBook.id, branch.choice_text, branch.description, fullCtx);
        if (!mountedRef.current) return;

        setScene(sceneData);
        setCurrentScene(sceneData);
        setSceneDesc(sceneData.description);
        setSceneHistory(prev => [...prev, sceneData.description]);

        const branchesData = await aiAPI.generateBranches(worldBook.id, sceneData.scene_id, 3);
        if (!mountedRef.current) return;

        setBranches(branchesData);
        setCurrentBranches(branchesData);
        setPhase('playing');
        startProgress();
      }
    } catch {
      if (!mountedRef.current) return;
      setErrorMsg('生成下一场景失败，请重试');
      setPhase('error');
    } finally {
      if (mountedRef.current) setSelectedChoice(null);
    }
  };

  if (phase === 'selecting_character') {
    return (
      <div className="page-container centered" style={{ background: '#0a0a14' }}>
        <div style={{ maxWidth: 680, width: '100%', padding: '20px' }}>
          <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 8 }}>
            <button className="btn btn-sm" onClick={() => navigate(-1)}>← 返回</button>
            <h2 className="section-title" style={{ margin: 0 }}>🎭 选择你的角色</h2>
            <div style={{ width: 60 }} />
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, textAlign: 'center', lineHeight: 1.7 }}>
            选择一个角色进入这个世界，角色的性格、背景和能力将影响AI生成的故事走向
          </p>

          {charLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, animation: 'float 2s infinite', marginBottom: 12 }}>🎭</div>
              <div style={{ color: 'var(--text-secondary)' }}>加载角色中...</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-gold)' }}>📋 我的角色</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{userCharacters.length}个</span>
                </div>
                <div className="flex-col gap-8">
                  {userCharacters.map(char => (
                    <div key={char.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', cursor: 'pointer' }}
                        onClick={() => setCharExpanded(charExpanded === char.id ? null : char.id)}
                      >
                        <div style={{ fontSize: 32, marginRight: 14 }}>
                          {char.gender === '女' ? '👩' : char.gender === '男' ? '👨' : '🧑'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 15, fontWeight: 600 }}>{char.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Lv{char.level}</span>
                            {char.title && <span style={{ fontSize: 11, color: 'var(--accent-gold)', opacity: 0.8 }}>{char.title}</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {char.identity || '原创角色'} · {char.gender}{char.age ? ` · ${char.age}` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <div style={{ display: 'flex', gap: 3, fontSize: 10, color: 'var(--text-secondary)', marginRight: 8 }}>
                            <span>力{char.strength}</span><span>智{char.intelligence}</span><span>魅{char.charisma}</span>
                          </div>
                          <button className="btn btn-sm btn-primary"
                            onClick={(e) => { e.stopPropagation(); selectCharacter(char); }}>
                            选择
                          </button>
                        </div>
                      </div>
                      {charExpanded === char.id && (
                        <div style={{
                          padding: '8px 16px 16px 60px', borderTop: '1px solid var(--border-color)',
                          animation: 'fadeIn 0.3s', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7,
                        }}>
                          {char.appearance && <p style={{ marginBottom: 4 }}><strong style={{ color: 'var(--accent-purple-light)' }}>外观：</strong>{char.appearance.slice(0, 120)}</p>}
                          {char.personality && <p style={{ marginBottom: 4 }}><strong style={{ color: 'var(--accent-purple-light)' }}>性格：</strong>{char.personality.slice(0, 120)}</p>}
                          {char.background && <p><strong style={{ color: 'var(--accent-purple-light)' }}>经历：</strong>{char.background.slice(0, 120)}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-center gap-12" style={{ flexWrap: 'wrap' }}>
                <button className="btn btn-sm btn-gold" onClick={() => navigate('/character-editor/new')}>
                  🎭 创建新角色
                </button>
                <button className="btn btn-sm" onClick={() => navigate('/characters')}>
                  📚 浏览角色库
                </button>
                <button className="btn btn-sm" onClick={skipCharacterSelection}
                  style={{ color: 'var(--text-secondary)' }}>
                  跳过选择 ▸
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'loading' || phase === 'generating_opening') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s infinite' }}>
            {phase === 'generating_opening' ? '🤖' : '🎬'}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 8 }}>{statusText}</div>
          {selectedCharacter && (
            <div style={{ color: 'var(--accent-gold)', fontSize: 13, marginBottom: 12 }}>
              🎭 扮演角色：{selectedCharacter.name}
            </div>
          )}
          <div style={{ width: 200, height: 3, margin: '12px auto', background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))', animation: 'shimmer 1.5s linear infinite', backgroundSize: '200% auto' }} />
          </div>
          <button className="btn btn-sm" style={{ marginTop: 32 }} onClick={() => navigate('/')}>← 返回首页</button>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 420, animation: 'fadeIn 0.5s' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ color: '#f87171', marginBottom: 12 }}>出错了</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>{errorMsg}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setPhase('loading'); setErrorMsg(''); loadWorldBook(selectedCharacter); }}>🔄 重试</button>
            <button className="btn" onClick={() => navigate('/')}>← 返回</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', position: 'relative' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', display: 'flex' }}>
        <div style={{
          flex: 1, minWidth: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: imageUrl
            ? `url(${imageUrl}) center/cover`
            : 'linear-gradient(135deg, #1a0a2e 0%, #0a1a2e 50%, #1a0a2e 100%)',
        }}>
          {imageUrl && <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,20,0.4)' }} />}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              fontSize: 'clamp(24px, 5vw, 48px)', fontWeight: 900, marginBottom: 8,
              color: 'var(--accent-gold)', textShadow: '0 0 30px rgba(212,168,83,0.4)',
            }}>
              {scene?.name || worldBook?.title || '...'}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, opacity: 0.7 }}>
              {phase === 'playing' && '场景展开中...'}
              {phase === 'transition' && '正在生成下一场景...'}
              {phase === 'choices' && '请做出选择'}
            </div>
          </div>
          {(phase === 'playing' || phase === 'choices') && (
            <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 2 }}>
              {phase === 'playing' && (
                <button className="btn btn-sm btn-gold" onClick={skipToChoices} style={{ fontSize: 13 }}>
                  ⏭ 跳过动画
                </button>
              )}
            </div>
          )}
          {phase === 'playing' && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))',
                transition: 'width 0.05s linear',
                boxShadow: '0 0 8px var(--accent-purple)',
              }} />
            </div>
          )}
        </div>

        <div style={{
          width: 'clamp(280px, 30vw, 380px)', background: 'rgba(10,10,20,0.97)',
          borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
          backdropFilter: 'blur(16px)',
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--accent-gold)', marginBottom: 4 }}>
              {worldBook?.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent-purple-light)', display: 'flex', gap: 12 }}>
              <span>{scene?.name || '开场'}</span>
              {scene?.scene_type && scene.scene_type !== 'normal' && (
                <span className="badge badge-purple">{scene.scene_type}</span>
              )}
            </div>
          </div>

          {selectedCharacter && (
            <div style={{
              padding: '10px 20px', borderBottom: '1px solid var(--border-color)',
              background: 'rgba(200,160,80,0.06)', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>
                {selectedCharacter.gender === '女' ? '👩' : selectedCharacter.gender === '男' ? '👨' : '🧑'}
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-gold)' }}>{selectedCharacter.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                  Lv{selectedCharacter.level} · {selectedCharacter.identity || selectedCharacter.title || '冒险者'}
                </div>
              </div>
              <button className="btn btn-sm" style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 8px' }}
                onClick={() => { setSelectedCharacter(null); }}>
                ✕
              </button>
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
            {phase === 'transition' && (
              <div style={{ textAlign: 'center', padding: '40px 0', animation: 'fadeIn 0.5s' }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: 'float 1.5s infinite' }}>⏳</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>故事继续发展...</div>
              </div>
            )}
            <div className="markdown-content" style={{ fontSize: 14, lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
              {sceneDesc || '加载中...'}
            </div>
          </div>

          {phase === 'choices' && (
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', animation: 'slideUp 0.4s' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                ▸ 做出你的选择
              </div>
              <div className="flex-col gap-8">
                {branches.length > 0 ? branches.map((branch) => (
                  <button
                    key={branch.id}
                    className={`btn ${branch.is_hot ? 'btn-gold' : ''}`}
                    style={{
                      justifyContent: 'flex-start', textAlign: 'left', width: '100%',
                      fontSize: 13, padding: '12px 16px', opacity: selectedChoice ? 0.5 : 1,
                    }}
                    onClick={() => handleChoice(branch)}
                    disabled={selectedChoice !== null}
                  >
                    <span style={{ flex: 1 }}>
                      {branch.choice_text}
                      {branch.is_hot && <span className="badge badge-hot" style={{ marginLeft: 8, fontSize: 10 }}>HOT</span>}
                    </span>
                    {branch.choice_count > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 8 }}>
                        {Math.round(branch.choice_count / Math.max(branches.reduce((a, b) => a + b.choice_count, 0), 1) * 100)}%
                      </span>
                    )}
                  </button>
                )) : (
                  <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                    暂无可用选项
                    <div className="mt-16">
                      <button className="btn btn-sm" onClick={() => navigate('/')}>返回首页</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <button className="btn btn-sm" style={{
        position: 'fixed', top: 16, left: 16, zIndex: 10,
        background: 'rgba(10,10,20,0.8)', backdropFilter: 'blur(8px)',
      }} onClick={() => navigate('/')}>← 退出</button>

      {sceneHistory.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 10,
          fontSize: 11, color: 'var(--text-secondary)', opacity: 0.5,
        }}>
          场景 {sceneHistory.length}
        </div>
      )}
    </div>
  );
}
