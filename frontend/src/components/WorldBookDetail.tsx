import React from 'react';
import type { WorldBook } from '../types';

interface WorldBookDetailProps {
  book: WorldBook;
  onClose?: () => void;
  onEnterWorld?: (bookId: number) => void;
}

export const WorldBookDetail: React.FC<WorldBookDetailProps> = ({ book, onClose, onEnterWorld }) => {
  const parseField = (field: string | undefined) => {
    if (!field) return [];
    try {
      return JSON.parse(field);
    } catch {
      return field.split('\n').filter(Boolean);
    }
  };

  const races = parseField(book.races);
  const factions = parseField(book.factions);
  const locations = parseField(book.geography);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 16,
          background: 'linear-gradient(135deg,var(--color-purple),var(--color-cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0,
        }}>
          📖
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.6 }}>{book.description}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {book.tags?.split(',').map((t, i) => (
              <span key={i} style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(168,85,247,0.1)', color: 'var(--color-purple-light)', fontSize: '0.8rem' }}>{t.trim()}</span>
            ))}
            <span style={{
              padding: '3px 10px', borderRadius: 10,
              background: book.price === 0 ? 'rgba(6,182,212,0.1)' : 'rgba(255,149,0,0.1)',
              color: book.price === 0 ? 'var(--color-cyan)' : 'var(--color-orange)',
              fontSize: '0.8rem', fontWeight: 600,
            }}>
              {book.price === 0 ? '免费' : `${book.price}钻石`}
            </span>
          </div>
        </div>
      </div>

      {book.worldview && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 8px' }}>📜 世界背景</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{book.worldview}</p>
        </div>
      )}

      {races.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>👥 种族</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {races.map((r: any, i: number) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                <strong style={{ color: '#fff' }}>{typeof r === 'string' ? r.split(' - ')[0] : r.name}</strong>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.85rem' }}>{typeof r === 'string' ? r.split(' - ')[1] || '' : r.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {factions.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>⚔️ 势力</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {factions.map((f: any, i: number) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                <strong style={{ color: '#fff' }}>{typeof f === 'string' ? f.split(' - ')[0] : f.name}</strong>
                <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.85rem' }}>{typeof f === 'string' ? f.split(' - ')[1] || '' : f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {locations.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20, marginBottom: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>🏛️ 地点</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {locations.map((l: any, i: number) => (
              <span key={i} style={{ padding: '6px 12px', background: 'rgba(168,85,247,0.08)', border: '1px solid var(--border-default)', borderRadius: 20, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {typeof l === 'string' ? l.split(' - ')[0] : l.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {book.history && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 20 }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 8px' }}>📚 历史脉络</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{book.history}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        {onClose && <button className="btn-secondary" onClick={onClose}>关闭</button>}
        {onEnterWorld && (
          <button className="btn-primary" onClick={() => onEnterWorld(book.id)}>
            <span>🎮 进入世界</span>
          </button>
        )}
      </div>
    </div>
  );
};
