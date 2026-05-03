import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { worldbookAPI, characterAPI } from '../services/api';
import type { WorldBook, CharacterCard } from '../types';

type TabKey = 'worlds' | 'characters';

export default function Backpack() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<WorldBook[]>([]);
  const [characters, setCharacters] = useState<CharacterCard[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('worlds');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'world' | 'character'; id: number; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [b, c] = await Promise.all([
        worldbookAPI.list({ my_only: true }),
        characterAPI.list({ my_only: true }),
      ]);
      setBooks(b);
      setCharacters(c);
    } catch {
      setBooks([]);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'world') {
        await worldbookAPI.delete(deleteTarget.id);
        setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
      } else {
        await characterAPI.delete(deleteTarget.id);
        setCharacters(prev => prev.filter(c => c.id !== deleteTarget.id));
      }
    } catch {
      alert('删除失败');
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="page-container centered">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, animation: 'float 2s infinite', marginBottom: 12 }}>🎒</div>
          <div style={{ color: 'var(--text-secondary)' }}>整理背包中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.06) 0%, #0a0a14 70%)' }} />

      <div className="flex-between mb-16" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="btn btn-sm" onClick={() => navigate('/')}>← 返回</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>📚 {books.length}世界</span>
          </div>
          <div style={{ width: 1, height: 16, background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>🎭 {characters.length}角色</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm btn-primary" onClick={() => navigate('/create')}>+ 创建世界</button>
          <button className="btn btn-sm btn-gold" onClick={() => navigate('/character-editor/new')}>+ 创建角色</button>
        </div>
      </div>

      <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>🎒 我的背包</h2>
        <div className="tab-bar" style={{ margin: 0 }}>
          <button className={`tab-item ${activeTab === 'worlds' ? 'active' : ''}`}
            onClick={() => setActiveTab('worlds')}>
            📚 世界书 {books.length > 0 && `(${books.length})`}
          </button>
          <button className={`tab-item ${activeTab === 'characters' ? 'active' : ''}`}
            onClick={() => setActiveTab('characters')}>
            🎭 角色卡 {characters.length > 0 && `(${characters.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'worlds' && (
        <div className="grid-3">
          {books.map(book => (
            <div key={book.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(30,64,175,0.1))',
                fontSize: 44,
              }}>
                📖
              </div>
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{book.title}</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.5, flex: 1, marginBottom: 10 }}>
                  {book.description?.slice(0, 80) || '暂无描述'}
                </p>
                <div className="flex-between" style={{ paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                  <span className="badge badge-purple">{book.category}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>▶ {book.play_count}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>❤️ {book.like_count}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn btn-sm btn-primary" style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}
                    onClick={() => navigate(`/play/${book.id}`)}>
                    ▶ 开始游戏
                  </button>
                  <button className="btn btn-sm" style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}
                    onClick={() => navigate(`/editor/${book.id}`)}>
                    📝 编辑
                  </button>
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '6px 10px', color: '#f87171' }}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'world', id: book.id, name: book.title }); }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          {books.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
              <p>你还没有创建任何世界书</p>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary" onClick={() => navigate('/create')}>✨ 创建第一个世界</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'characters' && (
        <div className="grid-3">
          {characters.map(char => (
            <div key={char.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{
                height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(200,160,80,0.12), rgba(139,92,246,0.08))',
                fontSize: 44,
              }}>
                {char.gender === '女' ? '👩' : char.gender === '男' ? '👨' : '🧑'}
              </div>
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{char.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--accent-purple-light)' }}>Lv{char.level}</span>
                </div>
                {char.title && <div style={{ fontSize: 11, color: 'var(--accent-purple-light)', marginBottom: 4 }}>{char.title}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, marginBottom: 10 }}>
                  {char.identity || char.ip_source || '原创角色'}
                </div>
                <div className="flex-between" style={{ paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {char.ip_type !== 'original' && <span className="badge badge-gold">{char.ip_source || 'IP'}</span>}
                    <span className="badge badge-purple">{char.gender}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, fontSize: 10, color: 'var(--text-secondary)' }}>
                    <span>力{char.strength}</span><span>智{char.intelligence}</span><span>魅{char.charisma}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn btn-sm" style={{ flex: 1, fontSize: 11, padding: '6px 10px' }}
                    onClick={() => navigate(`/character-editor/${char.id}`)}>
                    📝 编辑
                  </button>
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '6px 10px', color: '#f87171' }}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: 'character', id: char.id, name: char.name }); }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
          {characters.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>🎭</p>
              <p>你还没有创建任何角色卡</p>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-gold" onClick={() => navigate('/character-editor/new')}>🎭 创建第一个角色</button>
              </div>
            </div>
          )}
        </div>
      )}

      {deleteTarget && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }} onClick={() => setDeleteTarget(null)}>
          <div className="card" style={{
            maxWidth: 400, width: '100%', padding: 28, textAlign: 'center',
            animation: 'slideUp 0.3s',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ color: '#f87171', marginBottom: 8 }}>确认删除</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              确定要删除「{deleteTarget.name}」吗？此操作不可撤销。
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn" onClick={() => setDeleteTarget(null)}>取消</button>
              <button className="btn" style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                onClick={handleDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
