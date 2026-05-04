import React, { useState } from 'react';
import { useBranchStore } from '../store/branchStore';

interface CreateBranchModalProps {
  worldId: number;
  currentNodeId: string;
  currentNodeDescription?: string;
  existingOptions?: string[];
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  worldId, currentNodeId, currentNodeDescription, existingOptions, onClose, onCreated,
}) => {
  const [idea, setIdea] = useState('');
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const createBranch = useBranchStore((s) => s.createBranch);

  const generatePreview = () => {
    if (!idea.trim()) return;
    setPreview(`基于你的想法「${idea}」，AI生成了以下分支剧情：\n\n${idea}...\n\n这个决定将彻底改变故事的走向。新的路线将解锁隐藏角色和特殊结局。\n\n预计影响：\n• 解锁新区域：地下反抗军基地\n• 新NPC：反抗军领袖零号\n• 世界变量：反抗军士气 +20`);
    setShowPreview(true);
  };

  const handleCreate = () => {
    if (!idea.trim()) return;
    createBranch(worldId, null, currentNodeId, {
      title: idea.substring(0, 20),
      description: idea,
      addedNodes: [`branch_${Date.now()}`],
    });
    onCreated?.();
    onClose();
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <p style={{ color: 'var(--text-secondary)', margin: '0 0 12px' }}>当前场景：{currentNodeDescription || '你在故事的关键节点'}</p>
      </div>

      {existingOptions && existingOptions.length > 0 && (
        <>
          <h4 style={{ color: 'var(--text-secondary)', margin: '0 0 12px', fontSize: '0.95rem' }}>现有选项：</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {existingOptions.map((opt, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {i + 1}. {opt} → AI已生成这条路线
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>✨ 创造新选项：</h4>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          style={{
            width: '100%', minHeight: 80, padding: 12, background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-default)', borderRadius: 8, color: '#fff',
            fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12,
          }}
          placeholder="输入你的想法..."
        />
        <button className="btn-primary" style={{ width: '100%' }} onClick={generatePreview}>🤖 AI生成预览</button>
        {showPreview && (
          <div style={{ marginTop: 16, padding: 16, background: 'rgba(168,85,247,0.05)', border: '1px solid var(--border-active)', borderRadius: 12 }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{preview}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={handleCreate}>确认创建分支</button>
      </div>
    </div>
  );
};
