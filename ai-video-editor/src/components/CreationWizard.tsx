import { useState, useCallback, useRef } from 'react'
import { Sparkles, ArrowRight, ArrowLeft, Check, RefreshCw, Wand2, Film, BookOpen, Users, GitBranch, Image, Loader2, Play, Settings, Type, Camera, Move, Volume2, Download, RotateCcw, X } from 'lucide-react'

// ── Types ──────────────────────────────────────────────
type Step = 'landing' | 'worldbook' | 'characters' | 'outline' | 'images' | 'video-table'

interface Shot {
  id: string
  order: number
  imageUrl: string
  shotType: string
  composition: string
  cameraParams: string
  content: string
  cameraMove: string
  duration: number
  status: 'pending' | 'generating' | 'done'
  audio?: string
}

// ── Mock data ──────────────────────────────────────────
const generateWorldBookContent = (desc: string) => {
  const era = desc.includes('赛博') ? '近未来2150年，巨型企业统治世界' : desc.includes('魔法') ? '中古魔法纪元，元素之力重塑天地' : desc.includes('末日') ? '核战后三百年，文明在废墟中重建' : '一个游离于已知历史之外的独特时空'
  const geo = desc.includes('都市') || desc.includes('城市')
    ? '高耸入云的摩天大楼之间由空中走廊连接，永不停歇的雨幕为城市蒙上了一层神秘的蓝色光晕。霓虹灯在雨水中折射出迷幻的色彩，巨大的全息广告牌在头顶闪烁。'
    : '广袤的大地上散布着古老的遗迹，神秘的森林中栖息着未知生物，高耸的山脉间隐藏着远古的秘密。'
  return [
    { heading: '时代背景', body: era },
    { heading: '地理环境', body: geo },
    { heading: '社会结构', body: '上层统治阶层掌控核心资源与权力；中层普通居民在秩序与混乱间求生存；下层边缘人群在阴影中寻找自己的道路。' },
    { heading: '核心冲突', body: '秩序与自由的永恒对抗，个体命运与庞大体系的碰撞。' },
  ]
}

const generateCharacters = (worldDesc: string) => [
  { name: worldDesc.includes('赛博') ? '夜行者' : worldDesc.includes('魔法') ? '艾琳·星语' : '流浪者', gender: worldDesc.includes('赛博') ? '男' : '女', age: '28', desc: '冷静果断的独行者，在黑暗中寻找真相', traits: ['冷静', '果决', '孤独'], stats: { str: 14, agi: 18, int: 16, cha: 8 } },
  { name: worldDesc.includes('赛博') ? '红狐' : worldDesc.includes('魔法') ? '雷恩·铁腕' : '追寻者', gender: worldDesc.includes('赛博') ? '女' : '男', age: '24', desc: '机智神秘的反叛者，游走于规则的边缘', traits: ['机智', '神秘', '叛逆'], stats: { str: 8, agi: 16, int: 20, cha: 14 } },
  { name: '白医生', gender: '男', age: '45', desc: '温和仁慈的医者，在黑暗中守护光明', traits: ['仁慈', '坚韧', '智慧'], stats: { str: 6, agi: 10, int: 18, cha: 16 } },
]

const generateOutline = (worldDesc: string) => [
  { id: 's1', title: '序幕：命运的起点', desc: worldDesc.includes('赛博') ? '雨夜街头，霓虹灯在雨中闪烁。主角站在街角，看着全息屏幕上滚动的最新新闻。一封匿名信息打破了夜的寂静。' : '清晨的薄雾笼罩着大地，主角站在旅店窗前，望着远方若隐若现的塔楼。', branches: ['接受委托', '无视信息'] },
  { id: 's2a', title: '追踪线索', desc: '顺着匿名信息提供的坐标，主角来到了一处废弃的仓库。黑暗中有什么东西在移动……', branches: ['潜入调查', '正面突袭'] },
  { id: 's2b', title: '日常延续', desc: '主角选择了无视那条信息，回到了日常的生活。但命运的齿轮已经开始转动。', branches: ['被迫卷入', '主动出击'] },
  { id: 's3', title: '真相浮现', desc: '经过一系列的调查和战斗，一个庞大的阴谋逐渐浮出水面。主角发现自己已经无法后退。', branches: ['揭开真相', '选择沉默'] },
  { id: 's4a', title: '结局：黎明之前', desc: '主角揭开了幕后黑手的真面目，付出巨大代价后，为世界带来了新的希望。', branches: [] },
  { id: 's4b', title: '结局：深渊凝视', desc: '有些真相太过沉重。主角选择将秘密永远埋藏，但内心永远无法平静。', branches: [] },
]

const IMAGES = [
  'https://images.unsplash.com/photo-1515630278258-407f66498911?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=450&fit=crop',
]

const generateSceneImage = () => IMAGES[Math.floor(Math.random() * IMAGES.length)]

const generateShots = (outline: ReturnType<typeof generateOutline>): Shot[] => {
  const shotTypes = ['全景(WS)', '中近景(MCU)', '特写(CU)', '远景(LS)', '中景(MS)']
  const compositions = ['居中构图', '经典对称', '三分法', '对角线', '框架式']
  const cameraMoves = ['固定机位', '缓慢推镜', '环绕运镜', '手持跟拍', '航拍俯冲']
  const contents = [
    '女主闭目倚在桶沿，神情放松。水勺划入水面，她睁眼，目光微聚，未显惊讶。',
    '男主慵懒坐于台阶上，手持长勺搅水，居高临下望向她。女主抬头，神色淡然，语气平静却带防备。',
    '镜头从雨幕中缓缓升起，霓虹灯光在湿润的街道上折射出迷幻色彩。远处飞行汽车掠过天际线。',
    '特写：电子义眼在黑暗中发出微弱蓝光，数据流在瞳孔中闪烁。',
    '全景：废弃仓库内部，锈迹斑斑的机械残骸散落一地。月光从破碎的天窗倾泻而下。',
    '中景：两人对峙，空气中弥漫着紧张的气息。背景中全息屏幕闪烁着红色警报。',
  ]
  const cameraParams = [
    '焦距: 85mm\n光圈: f/2.2\n快门: 1/50s\nISO: 800\n白平衡: 3200K',
    '焦距: 35mm\n光圈: f/4.5\n快门: 1/50s\nISO: 640\n白平衡: 3000K',
    '焦距: 24mm\n光圈: f/1.8\n快门: 1/60s\nISO: 1200\n白平衡: 5500K',
    '焦距: 135mm\n光圈: f/2.8\n快门: 1/100s\nISO: 400\n白平衡: 4000K',
  ]

  return outline.map((node, idx) => ({
    id: node.id,
    order: idx + 1,
    imageUrl: generateSceneImage(),
    shotType: shotTypes[idx % shotTypes.length],
    composition: compositions[idx % compositions.length],
    cameraParams: cameraParams[idx % cameraParams.length],
    content: contents[idx % contents.length] + '\n\n' + node.desc,
    cameraMove: cameraMoves[idx % cameraMoves.length],
    duration: [5, 3, 10, 5, 3, 5][idx % 6],
    status: 'done' as const,
    audio: idx === 0 ? '男主画外音（低沉）："这么多年，还是这般洁净的脾性。"' : idx === 1 ? '女主："脏了，就洗一洗。"' : '',
  }))
}

// ── Background ─────────────────────────────────────────
function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(168,85,247,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(99,102,241,0.05)_0%,transparent_50%)]" />
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="absolute w-1 h-1 rounded-full" style={{
          left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%`,
          background: 'radial-gradient(circle, rgba(168,85,247,.5), transparent)',
          animation: `float ${6 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }} />
      ))}
    </div>
  )
}

// ── Step Nav ───────────────────────────────────────────
const STEP_LIST: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'landing', label: '描述世界', icon: Sparkles },
  { key: 'worldbook', label: '世界书', icon: BookOpen },
  { key: 'characters', label: '角色卡', icon: Users },
  { key: 'outline', label: '剧情分支', icon: GitBranch },
  { key: 'images', label: '场景图片', icon: Image },
  { key: 'video-table', label: '视频编排', icon: Film },
]

function StepNav({ step, maxReached, onChange }: { step: Step; maxReached: number; onChange: (s: Step) => void }) {
  const currentIdx = STEP_LIST.findIndex(s => s.key === step)
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-4 pb-2">
      <div className="surface-strong flex items-center gap-0.5 px-1.5 py-1.5">
        {STEP_LIST.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.key
          const isPast = i < currentIdx
          const clickable = i <= maxReached
          return (
            <button
              key={s.key}
              onClick={() => clickable && onChange(s.key)}
              disabled={!clickable}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-purple-500/15 text-purple-300'
                  : isPast
                  ? 'text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/8'
                  : clickable
                  ? 'text-white/30 hover:text-white/60 hover:bg-white/4'
                  : 'text-white/10 cursor-not-allowed'
              }`}
            >
              {isPast ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Page Header ────────────────────────────────────────
function PageHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <h2 className="t-headline gradient-text">{title}</h2>
      <p className="t-caption mt-1.5">{subtitle}</p>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────
export default function CreationWizard() {
  const [step, setStep] = useState<Step>('landing')
  const [worldDesc, setWorldDesc] = useState('')
  const [worldBook, setWorldBook] = useState<ReturnType<typeof generateWorldBookContent>>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [characters, setCharacters] = useState<ReturnType<typeof generateCharacters>>([])
  const [selectedChars, setSelectedChars] = useState<string[]>([])
  const [outline, setOutline] = useState<ReturnType<typeof generateOutline>>([])
  const [shots, setShots] = useState<Shot[]>([])
  const [expandedShot, setExpandedShot] = useState<string | null>(null)
  const [editingShot, setEditingShot] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<Shot>>({})
  const contentRef = useRef<HTMLDivElement>(null)

  const currentIdx = STEP_LIST.findIndex(s => s.key === step)
  const maxReached = currentIdx

  const simulateProgress = useCallback((duration: number, onDone: () => void) => {
    setIsGenerating(true); setGenProgress(0)
    const start = Date.now()
    const tick = () => {
      const p = Math.min(100, ((Date.now() - start) / duration) * 100)
      setGenProgress(p)
      p < 100 ? requestAnimationFrame(tick) : (setIsGenerating(false), onDone())
    }
    requestAnimationFrame(tick)
  }, [])

  const goToStep = (s: Step) => { setStep(s); contentRef.current && (contentRef.current.scrollTop = 0) }

  const handleCreateWorld = () => {
    if (!worldDesc.trim()) return
    setIsGenerating(true)
    setTimeout(() => { setWorldBook(generateWorldBookContent(worldDesc)); setIsGenerating(false); goToStep('worldbook') }, 1800)
  }

  const handleConfirmWorldBook = () => {
    simulateProgress(1200, () => { setCharacters(generateCharacters(worldDesc)); goToStep('characters') })
  }

  const handleConfirmCharacters = () => {
    simulateProgress(1000, () => { setOutline(generateOutline(worldDesc)); goToStep('outline') })
  }

  const handleGenerateImages = () => {
    simulateProgress(3000, () => { setShots(generateShots(outline)); goToStep('images') })
  }

  const handleConfirmImages = () => {
    simulateProgress(800, () => goToStep('video-table'))
  }

  const startEdit = (shot: Shot) => { setEditingShot(shot.id); setEditDraft({ ...shot }) }
  const saveEdit = () => {
    if (!editingShot) return
    setShots(prev => prev.map(s => s.id === editingShot ? { ...s, ...editDraft } as Shot : s))
    setEditingShot(null); setEditDraft({})
  }
  const regenImage = (shotId: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, status: 'generating' as const } : s))
    setTimeout(() => setShots(prev => prev.map(s => s.id === shotId ? { ...s, imageUrl: generateSceneImage(), status: 'done' as const } : s)), 2000)
  }

  return (
    <div className="relative w-screen h-screen bg-[#07070f] overflow-hidden">
      <Background />
      <StepNav step={step} maxReached={maxReached} onChange={goToStep} />

      <div ref={contentRef} className={`relative z-10 w-full h-full flex flex-col overflow-y-auto pt-[72px] pb-8 ${step === 'video-table' ? '' : 'items-center justify-center px-6'}`}>

        {/* ===== LANDING ===== */}
        {step === 'landing' && (
          <div className="max-w-xl w-full animate-fadeInUp">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/8 border border-purple-500/15 text-purple-400/80 text-[11px] tracking-widest uppercase mb-5">
                <Sparkles className="w-3 h-3" /> AI 视频创作
              </div>
              <h1 className="t-display gradient-text mb-3">绘境</h1>
              <p className="t-body text-white/50 mb-1">用你的想象力，创造一个独一无二的世界</p>
              <p className="t-caption">AI 将自动生成世界书、角色卡、剧情分支和视频内容</p>
            </div>

            <div className="surface-strong p-5">
              <label className="t-label mb-2 block">世界描述</label>
              <textarea
                value={worldDesc}
                onChange={e => setWorldDesc(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateWorld() } }}
                placeholder="例如：一个魔法与科技并存的赛博朋克都市，霓虹灯永不熄灭&#10;例如：远古森林中隐藏着巨龙守护的秘境"
                rows={4}
                className="input mb-3"
              />
              <div className="flex items-center justify-between">
                <span className="t-caption">{worldDesc.length}/500</span>
                <button onClick={handleCreateWorld} disabled={!worldDesc.trim() || isGenerating} className="btn-primary">
                  {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><Sparkles className="w-4 h-4" /> 创建世界</>}
                </button>
              </div>
              {isGenerating && (
                <div className="mt-4">
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${genProgress}%` }} /></div>
                  <p className="t-caption text-center mt-2">正在解析你的世界描述...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== WORLDBOOK ===== */}
        {step === 'worldbook' && (
          <div className="max-w-2xl w-full animate-fadeInUp">
            <PageHeader icon={BookOpen} title="世界书" subtitle="AI 根据你的描述构建的世界观设定" />

            <div className="surface-strong p-6 space-y-5">
              {worldBook.map((section, i) => (
                <div key={i} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
                  <h3 className="t-label text-purple-400/60 mb-2">{section.heading}</h3>
                  <p className="t-body">{section.body}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => { setWorldBook([]); goToStep('landing') }} className="btn-secondary">
                <RefreshCw className="w-4 h-4" /> 重新描述
              </button>
              <button onClick={handleConfirmWorldBook} disabled={isGenerating} className="btn-primary">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><ArrowRight className="w-4 h-4" /> 生成角色卡</>}
              </button>
            </div>
            {isGenerating && <div className="mt-4 max-w-sm mx-auto"><div className="progress-track"><div className="progress-fill" style={{ width: `${genProgress}%` }} /></div></div>}
          </div>
        )}

        {/* ===== CHARACTERS ===== */}
        {step === 'characters' && (
          <div className="max-w-4xl w-full animate-fadeInUp">
            <PageHeader icon={Users} title="角色卡" subtitle="选择你故事中的角色" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {characters.map((char, idx) => {
                const selected = selectedChars.includes(char.name)
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedChars(prev => selected ? prev.filter(c => c !== char.name) : [...prev, char.name])}
                    className={`text-left p-5 rounded-xl border transition-all duration-200 ${
                      selected
                        ? 'border-purple-500/40 bg-purple-500/6'
                        : 'border-white/6 bg-white/[.015] hover:border-purple-500/20 hover:bg-purple-500/4'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-lg">
                        {char.gender === '男' ? '♂' : '♀'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="t-title">{char.name}</span>
                          {selected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <span className="t-caption">{char.gender} · {char.age}岁</span>
                      </div>
                    </div>
                    <p className="t-body text-sm mb-3">{char.desc}</p>
                    <div className="flex gap-1.5 mb-3">
                      {char.traits.map(t => <span key={t} className="badge badge-slate">{t}</span>)}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.entries(char.stats).map(([k, v]) => (
                        <div key={k} className="text-center p-2 rounded-lg bg-white/[.02]">
                          <div className="text-sm font-semibold text-purple-400">{v}</div>
                          <div className="text-[10px] text-white/20 uppercase">{k}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button onClick={() => goToStep('worldbook')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> 返回</button>
              <button onClick={handleConfirmCharacters} disabled={isGenerating || selectedChars.length === 0} className="btn-primary">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中...</> : <><ArrowRight className="w-4 h-4" /> 确认（{selectedChars.length}）生成剧情</>}
              </button>
            </div>
            {isGenerating && <div className="mt-4 max-w-sm mx-auto"><div className="progress-track"><div className="progress-fill" style={{ width: `${genProgress}%` }} /></div></div>}
          </div>
        )}

        {/* ===== OUTLINE ===== */}
        {step === 'outline' && (
          <div className="max-w-2xl w-full animate-fadeInUp">
            <PageHeader icon={GitBranch} title="剧情分支" subtitle="AI 生成的完整剧情树" />

            <div className="space-y-0">
              {outline.map((node, idx) => {
                const isEnd = node.branches.length === 0
                const indent = node.id.length > 2 ? 48 : node.id.includes('a') || node.id.includes('b') ? 24 : 0
                return (
                  <div key={node.id} className="relative">
                    {idx > 0 && <div className="absolute left-5 top-0 w-px h-4 bg-purple-500/20 -translate-y-full" />}
                    <div className={`flex gap-3 p-4 rounded-xl border transition-all mb-3 ${
                      isEnd ? 'border-emerald-500/15 bg-emerald-500/[.03]' : 'border-white/6 bg-white/[.015] hover:border-purple-500/20'
                    }`} style={{ marginLeft: indent }}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isEnd ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'}`}>
                        {isEnd ? <Film className="w-4 h-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="t-title text-sm">{node.title}</span>
                          {isEnd && <span className="badge badge-green text-[10px]">结局</span>}
                        </div>
                        <p className="t-body text-sm">{node.desc}</p>
                        {node.branches.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {node.branches.map(b => <span key={b} className="badge badge-slate">{b}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button onClick={() => goToStep('characters')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> 返回</button>
              <button onClick={handleGenerateImages} disabled={isGenerating} className="btn-primary">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 生成中 {Math.round(genProgress)}%...</> : <><Image className="w-4 h-4" /> 生成场景图片</>}
              </button>
            </div>
            {isGenerating && <div className="mt-4 max-w-sm mx-auto"><div className="progress-track"><div className="progress-fill" style={{ width: `${genProgress}%` }} /></div></div>}
          </div>
        )}

        {/* ===== IMAGES ===== */}
        {step === 'images' && (
          <div className="max-w-5xl w-full animate-fadeInUp">
            <PageHeader icon={Image} title="场景图片" subtitle="点击场景查看详情" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {shots.map(shot => (
                <div
                  key={shot.id}
                  onClick={() => setExpandedShot(expandedShot === shot.id ? null : shot.id)}
                  className="group cursor-pointer"
                >
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/6 bg-[#0a0a1a] relative">
                    {shot.status === 'generating' ? (
                      <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-white/15 animate-spin" /></div>
                    ) : (
                      <img src={shot.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    )}
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/50 text-white/60 backdrop-blur-sm">#{shot.order}</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent">
                      <span className="text-xs font-medium text-white/80">{shot.shotType}</span>
                    </div>
                  </div>
                  {expandedShot === shot.id && (
                    <div className="mt-2 p-3 rounded-lg bg-white/[.02] border border-white/5 animate-fadeIn">
                      <p className="t-body text-xs mb-2">{shot.content}</p>
                      <div className="flex gap-1.5">
                        <span className="badge badge-slate text-[10px]">{shot.cameraMove}</span>
                        <span className="badge badge-slate text-[10px]">{shot.duration}秒</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button onClick={() => goToStep('outline')} className="btn-secondary"><ArrowLeft className="w-4 h-4" /> 返回</button>
              <button onClick={handleConfirmImages} disabled={isGenerating} className="btn-primary">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin" /> 准备中...</> : <><Film className="w-4 h-4" /> 进入视频编排</>}
              </button>
            </div>
            {isGenerating && <div className="mt-4 max-w-sm mx-auto"><div className="progress-track"><div className="progress-fill" style={{ width: `${genProgress}%` }} /></div></div>}
          </div>
        )}

        {/* ===== VIDEO TABLE ===== */}
        {step === 'video-table' && (
          <div className="w-full h-full flex flex-col animate-fadeIn px-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div>
                <h2 className="t-headline gradient-text">视频流分镜编辑</h2>
                <p className="t-caption mt-0.5">点击行展开详情，编辑拍摄参数与台词</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs py-2 px-3"><Wand2 className="w-3.5 h-3.5" /> 批量生成</button>
                <button className="btn-primary text-xs py-2 px-3"><Download className="w-3.5 h-3.5" /> 导出</button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="table-shots">
                <thead>
                  <tr>
                    <th className="w-10 text-center">#</th>
                    <th className="w-28">画面</th>
                    <th className="w-20">景别</th>
                    <th className="w-24">构图</th>
                    <th className="w-36">拍摄参数</th>
                    <th className="min-w-[180px]">内容 / 台词</th>
                    <th className="w-24">运镜</th>
                    <th className="w-12 text-center">时长</th>
                    <th className="w-16 text-center">状态</th>
                    <th className="w-24 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {shots.map(shot => {
                    const expanded = expandedShot === shot.id
                    const editing = editingShot === shot.id
                    return (
                      <>
                        <tr key={shot.id} onClick={() => !editing && setExpandedShot(expanded ? null : shot.id)} className={editing ? '' : 'cursor-pointer'}>
                          <td className="text-center"><span className="text-xl font-black text-white/10">{shot.order}</span></td>
                          <td>
                            <div className="w-24 h-14 rounded-lg overflow-hidden bg-[#0a0a1a] border border-white/5">
                              <img src={shot.imageUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td>
                            {editing ? (
                              <select className="input text-xs py-1.5 px-2" value={editDraft.shotType || shot.shotType} onChange={e => setEditDraft({ ...editDraft, shotType: e.target.value })} onClick={e => e.stopPropagation()}>
                                <option>全景(WS)</option><option>中近景(MCU)</option><option>特写(CU)</option><option>远景(LS)</option><option>中景(MS)</option>
                              </select>
                            ) : <span className="text-sm text-purple-300/80 font-medium">{shot.shotType}</span>}
                          </td>
                          <td>
                            {editing ? (
                              <select className="input text-xs py-1.5 px-2" value={editDraft.composition || shot.composition} onChange={e => setEditDraft({ ...editDraft, composition: e.target.value })} onClick={e => e.stopPropagation()}>
                                <option>居中构图</option><option>经典对称</option><option>三分法</option><option>对角线</option><option>框架式</option>
                              </select>
                            ) : <span className="t-body text-sm">{shot.composition}</span>}
                          </td>
                          <td>
                            {editing ? (
                              <textarea className="input text-xs py-1.5 px-2 resize-none" rows={3} value={editDraft.cameraParams || shot.cameraParams} onChange={e => setEditDraft({ ...editDraft, cameraParams: e.target.value })} onClick={e => e.stopPropagation()} />
                            ) : <div className="t-caption whitespace-pre-line">{shot.cameraParams}</div>}
                          </td>
                          <td>
                            {editing ? (
                              <textarea className="input text-xs py-1.5 px-2 resize-none" rows={3} value={editDraft.content || shot.content} onChange={e => setEditDraft({ ...editDraft, content: e.target.value })} onClick={e => e.stopPropagation()} />
                            ) : <div className="t-body text-sm line-clamp-3">{shot.content}</div>}
                          </td>
                          <td>
                            {editing ? (
                              <select className="input text-xs py-1.5 px-2" value={editDraft.cameraMove || shot.cameraMove} onChange={e => setEditDraft({ ...editDraft, cameraMove: e.target.value })} onClick={e => e.stopPropagation()}>
                                <option>固定机位</option><option>缓慢推镜</option><option>环绕运镜</option><option>手持跟拍</option><option>航拍俯冲</option>
                              </select>
                            ) : <span className="t-body text-sm">{shot.cameraMove}</span>}
                          </td>
                          <td className="text-center">
                            {editing ? (
                              <select className="input text-xs py-1.5 px-2 text-center" value={editDraft.duration || shot.duration} onChange={e => setEditDraft({ ...editDraft, duration: Number(e.target.value) })} onClick={e => e.stopPropagation()}>
                                <option value={3}>3s</option><option value={5}>5s</option><option value={10}>10s</option><option value={15}>15s</option>
                              </select>
                            ) : <span className="text-sm font-mono text-white/40">{shot.duration}s</span>}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${shot.status === 'done' ? 'badge-green' : shot.status === 'generating' ? 'badge-amber' : 'badge-slate'}`}>
                              {shot.status === 'done' ? '就绪' : shot.status === 'generating' ? '生成中' : '待处理'}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-1">
                              {editing ? (
                                <>
                                  <button onClick={e => { e.stopPropagation(); saveEdit() }} className="btn-icon" title="保存"><Check className="w-3.5 h-3.5 text-emerald-400" /></button>
                                  <button onClick={e => { e.stopPropagation(); setEditingShot(null); setEditDraft({}) }} className="btn-icon" title="取消"><X className="w-3.5 h-3.5" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={e => { e.stopPropagation(); startEdit(shot) }} className="btn-icon" title="编辑"><Settings className="w-3.5 h-3.5" /></button>
                                  <button onClick={e => { e.stopPropagation(); regenImage(shot.id) }} className="btn-icon" title="重绘" disabled={shot.status === 'generating'}>
                                    {shot.status === 'generating' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setShots(prev => prev.map(s => s.id === shot.id ? { ...s, status: 'generating' as const } : s)); setTimeout(() => setShots(prev => prev.map(s => s.id === shot.id ? { ...s, status: 'done' as const } : s)), 2000) }} className="btn-icon" title="生成视频"><Play className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expanded && !editing && (
                          <tr>
                            <td colSpan={10}>
                              <div className="p-5 rounded-xl bg-white/[.015] border border-white/5 animate-fadeIn">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                  <div>
                                    <div className="aspect-video rounded-xl overflow-hidden border border-white/8 mb-3">
                                      <img src={shot.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    {shot.audio && (
                                      <div className="p-3 rounded-lg bg-purple-500/4 border border-purple-500/8">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <Volume2 className="w-3.5 h-3.5 text-purple-400/60" />
                                          <span className="t-label text-purple-400/60">配音</span>
                                        </div>
                                        <p className="t-body text-sm italic">{shot.audio}</p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="t-label mb-2 flex items-center gap-2"><Camera className="w-3 h-3" /> 拍摄参数</h4>
                                      <div className="p-3 rounded-lg bg-white/[.02] border border-white/5 t-caption whitespace-pre-line">{shot.cameraParams}</div>
                                    </div>
                                    <div>
                                      <h4 className="t-label mb-2 flex items-center gap-2"><Type className="w-3 h-3" /> 内容 / 台词</h4>
                                      <div className="p-3 rounded-lg bg-white/[.02] border border-white/5 t-body text-sm">{shot.content}</div>
                                    </div>
                                    <div>
                                      <h4 className="t-label mb-2 flex items-center gap-2"><Move className="w-3 h-3" /> 运镜</h4>
                                      <div className="p-3 rounded-lg bg-white/[.02] border border-white/5 t-body text-sm">{shot.cameraMove}</div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => startEdit(shot)} className="btn-secondary text-xs flex-1 justify-center py-2"><Settings className="w-3.5 h-3.5" /> 编辑</button>
                                      <button onClick={() => regenImage(shot.id)} className="btn-secondary text-xs flex-1 justify-center py-2" disabled={shot.status === 'generating'}><RotateCcw className="w-3.5 h-3.5" /> 重绘</button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
