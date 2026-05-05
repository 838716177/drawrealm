import React from 'react';
import { useCharacterStore } from '../store/characterStore';

interface CharacterPassportProps {
  characterId: number;
  onClose?: () => void;
  onShare?: () => void;
}

export const CharacterPassport: React.FC<CharacterPassportProps> = ({ characterId, onClose, onShare }) => {
  const char = useCharacterStore((s) => s.getCharacter(characterId));
  const highlights = useCharacterStore((s) => s.getTravelHighlights(characterId));
  const shareCard = useCharacterStore((s) => s.generateShareCard(characterId));

  if (!char) return null;

  const v = char.visual;
  const c = char.capability;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
        <div style={{
          width: 90, height: 120, borderRadius: 16,
          background: 'linear-gradient(135deg,var(--color-purple),var(--color-cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', flexShrink: 0,
        }}>
          {char.gender === 'female' ? '👩' : '👨'}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px', color: '#fff' }}>{char.name}</h2>
          <p style={{ color: 'var(--color-purple-light)', margin: '0 0 8px', fontWeight: 600 }}>
            {char.title || '无名之辈'} | Lv.{v?.level || char.level || 1}
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(char.personality ? [char.personality] : []).slice(0, 4).map((t, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(168,85,247,0.1)', color: 'var(--color-purple-light)', fontSize: '0.8rem' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {c && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>EXP</span><span>{v?.exp || 0}/{v?.expToNext || 100}</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              width: `${((v?.exp || 0) / (v?.expToNext || 100)) * 100}%`, height: '100%',
              background: 'linear-gradient(90deg,var(--color-purple),var(--color-cyan))', borderRadius: 2, transition: 'width 0.5s',
            }} />
          </div>
        </div>
      )}

      {c && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
          {Object.entries(c.attributes).map(([k, val]) => (
            <div key={k} style={{ textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textTransform: 'uppercase' }}>{k}</div>
              <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{val}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
        <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>🌍 旅行记录</h4>
        {highlights.length ? highlights.map((h, i) => (
          <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#fff' }}>{h.worldName}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{h.nodesVisited}个节点</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0' }}>首次访问: {new Date(h.firstVisit).toLocaleDateString()}</p>
          </div>
        )) : <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>暂无旅行记录</p>}
      </div>

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
        <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>🏆 成就</h4>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {char.achievements?.length ? char.achievements.map((a, i) => (
            <span key={i} style={{ padding: '6px 12px', borderRadius: 20, background: 'rgba(255,149,0,0.1)', color: 'var(--color-orange)', fontSize: '0.85rem', fontWeight: 600 }}>🏅 {a.name}</span>
          )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>暂无成就</span>}
        </div>
      </div>

      {char.travel_log && char.travel_log.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>📜 最精彩的时刻</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{char.travel_log[char.travel_log.length - 1]?.choice || '一段难忘的冒险...'}"
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        {onClose && <button className="btn-secondary" onClick={onClose}>关闭</button>}
        {onShare && <button className="btn-primary" onClick={onShare}>📤 分享角色卡</button>}
      </div>
    </div>
  );
};
