import React from 'react';
import { useBranchStore } from '../store/branchStore';

interface BranchNetworkProps {
  worldId: number;
  onPlayBranch?: (branchId: string) => void;
  onForkBranch?: (branchId: string) => void;
}

export const BranchNetwork: React.FC<BranchNetworkProps> = ({ worldId, onPlayBranch, onForkBranch }) => {
  const tree = useBranchStore((s) => s.getBranchTree(worldId));
  const branches = useBranchStore((s) => s.branches);

  const countAll = (nodes: any[]): number => {
    let c = 0;
    nodes.forEach((n) => { c += 1 + countAll(n.children || []); });
    return c;
  };

  const getDeepest = (nodes: any[]): number => {
    let m = 0;
    nodes.forEach((n) => { m = Math.max(m, n.depth || 0, getDeepest(n.children || [])); });
    return m;
  };

  const getHottest = (nodes: any[]): any => {
    let h = null;
    let max = 0;
    nodes.forEach((n) => {
      if ((n.stats?.playCount || 0) > max) { max = n.stats.playCount; h = n; }
      const ch = getHottest(n.children || []);
      if (ch && (ch.stats?.playCount || 0) > max) { h = ch; max = ch.stats.playCount; }
    });
    return h;
  };

  const renderTree = (nodes: any[], depth = 0) => {
    if (!nodes.length) return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>暂无分支，成为第一个创造者！</p>;
    return (
      <>
        {nodes.map((b) => (
          <div key={b.id} style={{ marginLeft: depth * 24, marginBottom: 12 }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${depth === 0 ? 'var(--color-purple)' : 'var(--border-subtle)'}`,
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = depth === 0 ? 'var(--color-purple)' : 'var(--border-subtle)'; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: depth === 0 ? 'linear-gradient(135deg,var(--color-purple),var(--color-purple-light))' : 'rgba(168,85,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {depth === 0 ? '根' : b.depth}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{b.metadata?.title || '未命名分支'}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.stats?.playCount || 0}次游玩</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {b.metadata?.description || ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); onPlayBranch?.(b.id); }}>▶ 游玩</button>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); onForkBranch?.(b.id); }}>🌿 分叉</button>
              </div>
            </div>
            {b.children?.length ? (
              <div style={{ marginTop: 8, borderLeft: '2px solid var(--border-subtle)', paddingLeft: 12 }}>
                {renderTree(b.children, depth + 1)}
              </div>
            ) : null}
          </div>
        ))}
      </>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ padding: '10px 16px', background: 'rgba(168,85,247,0.08)', borderRadius: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>总分支数</span>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>{countAll(tree)}</div>
        </div>
        <div style={{ padding: '10px 16px', background: 'rgba(6,182,212,0.08)', borderRadius: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>最热门</span>
          <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{getHottest(tree)?.metadata?.title || '暂无'}</div>
        </div>
        <div style={{ padding: '10px 16px', background: 'rgba(255,149,0,0.08)', borderRadius: 12 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>最深分支</span>
          <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>{getDeepest(tree)}层</div>
        </div>
      </div>
      {renderTree(tree)}
    </div>
  );
};
