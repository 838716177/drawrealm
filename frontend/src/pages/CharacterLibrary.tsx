import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterAPI, aiAPI } from '../services/api';
import type { CharacterCard } from '../types';

type SortMode = 'newest' | 'popular' | 'name';

export default function CharacterLibrary() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortMode>('newest');
  const [selected, setSelected] = useState<CharacterCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const chars = await characterAPI.list({ limit: 50 });
      setCharacters(chars);
    } catch {
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = characters
    .filter(c => {
      if (search && !c.name.includes(search) && !c.identity.includes(search) && !c.background.includes(search)) return false;
      if (genderFilter !== 'all' && c.gender !== genderFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === 'popular') return b.usage_count - a.usage_count;
      return a.name.localeCompare(b.name, 'zh');
    });

  if (loading) {
    return (
      <div className="page-container centered">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, animation: 'float 2s infinite', marginBottom: 12 }}>🎭</div>
          <div style={{ color: 'var(--text-secondary)' }}>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(200,160,80,0.06) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-24" style={{ flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回</button>
        <h2 className="section-title" style={{ margin: 0 }}>🎭 公共角色库</h2>
        <button className="btn btn-sm btn-primary" onClick={() => navigate('/character-editor/new')}>+ 创建角色</button>
      </div>

      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
            <input 
              className="input" 
              style={{ width: 240, paddingLeft: 32 }} 
              placeholder="搜索角色名/身份/背景..."
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
            {[{ id: 'all', name: '全部' }, { id: '男', name: '♂ 男' }, { id: '女', name: '♀ 女' }].map(g => (
              <button 
                key={g.id} 
                className={`btn btn-sm ${genderFilter === g.id ? 'btn-primary' : ''}`}
                style={{ 
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 13,
                  border: genderFilter === g.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  background: genderFilter === g.id ? undefined : 'transparent',
                }}
                onClick={() => setGenderFilter(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 4 }}>
          {([['newest', '最新'], ['popular', '热门'], ['name', '名称']] as [SortMode, string][]).map(([id, label]) => (
            <button 
              key={id} 
              className={`btn btn-sm ${sortBy === id ? 'btn-primary' : ''}`}
              style={{ 
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 13,
                border: sortBy === id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                background: sortBy === id ? undefined : 'transparent',
              }}
              onClick={() => setSortBy(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: 12 }}>
        共 {filtered.length} 个角色
      </div>

      <div className="grid-3">
        {filtered.map((char, i) => (
          <div key={char.id} className="card" style={{
            cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: `fadeIn 0.5s ${i * 0.04}s both`,
          }} onClick={() => setSelected(char)}>
            <div style={{
              height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(200,160,80,0.15), rgba(139,92,246,0.1))',
              fontSize: 44,
            }}>
              {char.gender === '女' ? '👩' : char.gender === '男' ? '👨' : '🧑'}
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{char.name}</span>
                <span style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Lv{char.level}</span>
              </div>
              {char.title && <div style={{ fontSize: 11, color: 'var(--accent-purple-light)', marginBottom: 4 }}>{char.title}</div>}
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>{char.identity || char.ip_source || '原创角色'}</div>
              <div className="flex-between" style={{ paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {char.ip_type !== 'original' && <span className="badge badge-gold">{char.ip_source || 'IP'}</span>}
                  <span className="badge badge-purple">{char.gender}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, fontSize: 10, color: 'var(--text-secondary)' }}>
                  <span>力{char.strength}</span><span>智{char.intelligence}</span><span>魅{char.charisma}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🎭</p>
          <p>{characters.length === 0 ? '角色库还是空的' : '未找到匹配的角色'}</p>
          {characters.length === 0 && (
            <button className="btn btn-primary mt-16" onClick={() => navigate('/character-editor/new')}>🎭 创建第一个角色</button>
          )}
        </div>
      )}

      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setSelected(null)}>
          <div className="card" style={{
            maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto', padding: 28,
            animation: 'slideUp 0.3s',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>
                {selected.gender === '女' ? '👩' : selected.gender === '男' ? '👨' : '🧑'}
              </div>
              <h3 style={{ color: 'var(--accent-gold)', fontSize: 24, marginBottom: 2 }}>{selected.name}</h3>
              {selected.title && <p style={{ color: 'var(--accent-purple-light)', fontSize: 14 }}>{selected.title}</p>}
              {selected.ip_source && <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>📖 {selected.ip_source} · {selected.ip_author || '佚名'}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 16, fontSize: 13 }}>
              <div style={{ color: 'var(--text-secondary)' }}>身份：{selected.identity || '-'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>性别：{selected.gender} | 年龄：{selected.age || '-'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>等级：Lv{selected.level}</div>
              <div style={{ color: 'var(--text-secondary)' }}>IP：{selected.ip_type}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
              {[['❤️生命', selected.health, selected.max_health], ['💎法力', selected.mana, selected.max_mana],
                ['⚔️力量', selected.strength], ['🏃敏捷', selected.agility],
                ['🧠智力', selected.intelligence], ['💬魅力', selected.charisma],
              ].map(([label, val, max]) => (
                <div key={String(label)} style={{ textAlign: 'center', background: 'rgba(139,92,246,0.08)', borderRadius: 6, padding: '6px 4px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-purple-light)' }}>
                    {max ? `${val}/${max}` : val}
                  </div>
                </div>
              ))}
            </div>

            {selected.appearance && (
              <div style={{ marginBottom: 12 }}><strong style={{ fontSize: 12, color: 'var(--accent-gold)' }}>外观</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{selected.appearance.slice(0, 250)}</p></div>
            )}
            {selected.background && (
              <div style={{ marginBottom: 12 }}><strong style={{ fontSize: 12, color: 'var(--accent-gold)' }}>经历</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{selected.background.slice(0, 250)}</p></div>
            )}
            {selected.personality && (
              <div style={{ marginBottom: 12 }}><strong style={{ fontSize: 12, color: 'var(--accent-gold)' }}>性格</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{selected.personality.slice(0, 150)}</p></div>
            )}
            {selected.beliefs && (
              <div><strong style={{ fontSize: 12, color: 'var(--accent-gold)' }}>理念</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>{selected.beliefs.slice(0, 150)}</p></div>
            )}

            <div className="flex-center gap-12 mt-20">
              <button className="btn btn-primary" onClick={() => { setSelected(null); navigate(`/character-editor/${selected.id}`); }}>📝 编辑</button>
              <button className="btn btn-gold btn-sm" onClick={() => {
                const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `${selected.name}.json`;
                a.click(); URL.revokeObjectURL(url);
              }}>📥 导出</button>
              <button className="btn btn-sm" onClick={() => setSelected(null)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
