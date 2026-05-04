import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { worldbookAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { STORE_CATEGORIES } from '../constants/worldData';
import { WorldBookDetail } from '../components/WorldBookDetail';
import type { WorldBook } from '../types';

const PRESET_WORLDBOOKS = [
  { title: '星辰之海', subtitle: '星际冒险史诗', description: '在遥远的未来，人类已经征服了银河系。你是一名星际探险家，驾驶着破旧的飞船穿梭在星辰之间。古老的星际帝国正在崩塌，新的势力正在崛起。在这片星辰之海中，每一颗行星都隐藏着秘密，每一次跃迁都可能改变命运。', category: 'scifi', price: 15, playCount: 12800, likeCount: 3400, icon: '🚀', tags: '科幻,冒险,星际', featured: true },
  { title: '武侠:剑影江湖', subtitle: '快意恩仇的武侠世界', description: '大争之世，王朝动荡。你出身于武林世家，从小习武，天赋异禀。江湖中，六大门派明争暗斗，朝廷势力蠢蠢欲动。一把绝世神剑的传说，引来了无数江湖豪杰。', category: 'wuxia', price: 0, playCount: 28900, likeCount: 8700, icon: '⚔️', tags: '武侠,江湖,宗门', featured: true },
  { title: '修真:问道长生', subtitle: '问道长生的仙侠史诗', description: '灵气复苏，大道通天。你本是山村少年，机缘巧合之下踏入修仙之路。从筑基到金丹，从元婴到化神，每一步都充满艰险。仙魔之战即将爆发，三界格局即将改写。', category: 'xianxia', price: 12, playCount: 34500, likeCount: 11200, icon: '☯️', tags: '仙侠,修真,飞升', featured: true },
  { title: '都市:逆袭人生', subtitle: '都市重生逆袭记', description: '一觉醒来，你回到了十年前。曾经错过的机会，曾经失去的爱人，曾经被践踏的尊严——这一世，你绝对不会再让这些发生。带着十年的记忆和阅历，你将在都市中掀起怎样的风暴？', category: 'modern', price: 0, playCount: 45600, likeCount: 15200, icon: '🌆', tags: '都市,重生,逆袭', featured: true },
  { title: '末日:废土求生', subtitle: '末日废土生存实录', description: '核战后的世界，一片荒芜。辐射变异生物横行，幸存者们在废墟中挣扎求生。你从一个地下避难所醒来，外面的世界已经完全变了模样。', category: 'scifi', price: 10, playCount: 18900, likeCount: 5600, icon: '💀', tags: '末日,废土,生存', featured: false },
  { title: '玄幻:龙族崛起', subtitle: '龙族末裔的崛起之路', description: '龙族曾经统治世界，如今却濒临灭绝。你是最后一条幼龙，需要在这个充满敌意的世界中生存下来，并重建龙族的辉煌。', category: 'fantasy', price: 8, playCount: 22100, likeCount: 6800, icon: '🐉', tags: '玄幻,龙族,崛起', featured: false },
  { title: '历史:三国霸业', subtitle: '改写三国历史', description: '穿越到东汉末年，你成为了一个不起眼的小人物。黄巾起义刚刚爆发，天下即将大乱。在这个英雄辈出的时代，你将如何书写自己的传奇？', category: 'historical', price: 0, playCount: 31200, likeCount: 9800, icon: '🏺', tags: '历史,三国,争霸', featured: false },
  { title: '奇幻:魔法学院', subtitle: '魔法学院的日常与冒险', description: '你收到了一封来自魔法学院的录取通知书。在这个充满魔法与奇迹的世界中，你将学习各种神奇的魔法，结识来自不同种族的伙伴，揭开学院隐藏千年的秘密。', category: 'fantasy', price: 6, playCount: 25600, likeCount: 7200, icon: '🧙', tags: '奇幻,魔法,学院', featured: false },
  { title: '都市:娱乐圈风云', subtitle: '娱乐圈的勾心斗角', description: '你是一个刚出道的小演员，在这个光鲜亮丽的娱乐圈中摸爬滚打。这里有最闪耀的舞台，也有最黑暗的角落。', category: 'modern', price: 5, playCount: 16700, likeCount: 4300, icon: '🎭', tags: '都市,娱乐圈,明星', featured: false },
  { title: '武侠:魔教教主', subtitle: '魔教教主的养成之路', description: '你意外成为了魔教的教主继承人。在这个被正道围剿的魔教中，你需要用智慧和实力赢得教众的信任，带领魔教走向一个新的时代。', category: 'wuxia', price: 10, playCount: 19800, likeCount: 5400, icon: '🗡️', tags: '武侠,魔教,养成', featured: false },
  { title: '仙侠:天庭小仙', subtitle: '天庭小职员的修仙日常', description: '你在天庭当一个小小的文职神仙，每天处理繁杂的文书工作。枯燥的生活被一次意外打破——你被卷入了一场涉及三界的大阴谋。', category: 'xianxia', price: 8, playCount: 21300, likeCount: 6100, icon: '🏯', tags: '仙侠,天庭,搞笑', featured: false },
  { title: '奇幻:黑暗之魂', subtitle: '黑暗深邃的奇幻冒险', description: '世界被黑暗笼罩，深渊中的存在正在苏醒。你是一名被选中的灵魂战士，必须在黑暗中寻找光明，在绝望中找到希望。', category: 'fantasy', price: 15, playCount: 14200, likeCount: 3800, icon: '🌑', tags: '奇幻,暗黑,史诗', featured: true },
];

type PriceFilter = 'all' | 'free' | 'premium';

export default function StorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const myOnly = searchParams.get('my') === 'true';
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const [worldbooks, setWorldbooks] = useState<(WorldBook | typeof PRESET_WORLDBOOKS[0])[]>([]);
  const [category, setCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<WorldBook | null>(null);

  useEffect(() => {
    if (myOnly && !isLoggedIn) {
      navigate('/login');
      return;
    }
    loadBooks();
  }, [myOnly]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const books = await worldbookAPI.list({ my_only: myOnly });
      if (myOnly) {
        setWorldbooks(books);
      } else {
        setWorldbooks([...PRESET_WORLDBOOKS, ...books]);
      }
    } catch {
      if (!myOnly) setWorldbooks([...PRESET_WORLDBOOKS]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = worldbooks.filter(book => {
    if (category !== 'all' && book.category !== category) return false;
    if (myOnly) return true;
    if (priceFilter === 'free' && (book.price || 0) > 0) return false;
    if (priceFilter === 'premium' && (book.price || 0) === 0) return false;
    if (search && !book.title.includes(search) && !(book.description || '').includes(search)) return false;
    return true;
  });

  const handleBookClick = (book: WorldBook | typeof PRESET_WORLDBOOKS[0]) => {
    if ('id' in book && book.id) {
      if (myOnly) {
        navigate(`/editor/${book.id}`);
        return;
      }
    }
    // Convert preset book to WorldBook-like object for detail view
    const detailBook: WorldBook = {
      id: ('id' in book ? book.id : 0) as number,
      title: book.title,
      subtitle: book.subtitle || '',
      description: book.description,
      cover_url: '',
      category: book.category,
      tags: typeof book.tags === 'string' ? book.tags : '',
      price: book.price || 0,
      is_published: true,
      is_featured: 'featured' in book ? !!book.featured : false,
      play_count: 'playCount' in book ? book.playCount : 0,
      like_count: 'likeCount' in book ? book.likeCount : 0,
      version: 1,
      worldview: book.description,
      timeline: '',
      world_rules: '',
      geography: '',
      culture: '',
      history: '',
      races: '',
      factions: '',
      gods: '',
      artifacts: '',
      creator_id: 0,
      created_at: '',
      updated_at: '',
    };
    setSelectedBook(detailBook);
  };

  if (loading) {
    return (
      <div className="page-container centered">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, animation: 'float 2s infinite', marginBottom: 12 }}>📚</div>
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
        <h2 className="section-title" style={{ margin: 0 }}>{myOnly ? '📖 我的世界书' : '📚 世界书广场'}</h2>
        <button className="btn btn-sm" onClick={() => navigate(myOnly ? '/store' : '/store?my=true')}>
          {myOnly ? '去广场' : '我的'}
        </button>
      </div>

      {!myOnly && (
        <>
          <div className="flex-between mb-12" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div className="tab-bar" style={{ margin: 0 }}>
              {STORE_CATEGORIES.map(cat => (
                <button key={cat.id} className={`tab-item ${category === cat.id ? 'active' : ''}`}
                  onClick={() => setCategory(cat.id)}>{cat.name}</button>
              ))}
            </div>
            <input className="input" style={{ width: 220, height: 40 }} placeholder="🔍 搜索世界书..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="flex-between mb-20" style={{ flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['all', '全部'], ['free', '免费'], ['premium', '付费']] as [PriceFilter, string][]).map(([id, label]) => (
                <button key={id} className={`btn btn-sm ${priceFilter === id ? 'btn-primary' : ''}`}
                  onClick={() => setPriceFilter(id)} style={{ minWidth: 80 }}>{label}</button>
              ))}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              共 {filteredBooks.length} 本世界书
            </div>
          </div>
        </>
      )}

      <div className="grid-3">
        {filteredBooks.map((book, i) => (
          <div key={i} className="card" style={{
            cursor: 'pointer', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            animation: `fadeIn 0.5s ${i * 0.05}s both`,
          }} onClick={() => handleBookClick(book)}>
            <div style={{
              height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(34,211,238,0.1))',
              fontSize: 48,
            }}>
              {'icon' in book ? book.icon : '📖'}
            </div>
            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{book.title}</span>
                {'featured' in book && book.featured && <span className="badge badge-gold">精选</span>}
                {'id' in book && book.id && <span className="badge badge-purple">玩家</span>}
              </div>
              {book.subtitle && <div style={{ fontSize: 12, color: 'var(--accent-purple-light)', marginBottom: 6 }}>{book.subtitle}</div>}
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {book.description}
              </p>
              <div className="flex-between" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="badge badge-purple">{book.category}</span>
                  {'tags' in book && typeof book.tags === 'string' && book.tags.split(',')[0] && (
                    <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{book.tags.split(',')[0]}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <span>▶ {'playCount' in book ? (book.playCount > 10000 ? `${(book.playCount / 10000).toFixed(1)}万` : book.playCount) : (book as WorldBook).play_count}</span>
                  <span>♥ {'likeCount' in book ? (book.likeCount > 10000 ? `${(book.likeCount / 10000).toFixed(1)}万` : book.likeCount) : (book as WorldBook).like_count}</span>
                  {(book.price || 0) > 0
                    ? <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>🪙{book.price}</span>
                    : <span style={{ color: '#22c55e', fontWeight: 600 }}>免费</span>
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>📭</p>
          <p>{myOnly ? '你还没有创建世界书' : '未找到匹配的世界书'}</p>
          {myOnly && (
            <div className="mt-16">
              <button className="btn btn-primary" onClick={() => navigate('/create')}>🏰 创建你的第一个世界</button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content" style={{ maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <WorldBookDetail
              book={selectedBook}
              onClose={() => setSelectedBook(null)}
              onEnterWorld={(id) => {
                setSelectedBook(null);
                navigate(`/play/${id}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
