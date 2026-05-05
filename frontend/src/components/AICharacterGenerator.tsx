import React, { useState } from 'react';
import type { CharacterCard } from '../types';

interface AICharacterGeneratorProps {
  onGenerated?: (character: Partial<CharacterCard>) => void;
}

const TEMPLATES = [
  { name: '冷酷刺客', icon: '🗡️', desc: '暗影中的杀手，擅长潜行与暗杀' },
  { name: '精灵射手', icon: '🏹', desc: '森林守护者，百步穿杨的神射手' },
  { name: '龙裔战士', icon: '🐉', desc: '拥有龙族血脉的强大战士' },
  { name: '元素法师', icon: '🔮', desc: '掌控四大元素的强大法师' },
  { name: '圣骑士', icon: '⚔️', desc: '信仰坚定的守护者，正义的化身' },
  { name: '暗影术士', icon: '🌑', desc: '钻研禁忌魔法的黑暗学者' },
  { name: '机械师', icon: '⚙️', desc: '擅长制造机械装置的工匠' },
  { name: '吟游诗人', icon: '🎵', desc: '用音乐和故事传递力量的旅者' },
];

export const AICharacterGenerator: React.FC<AICharacterGeneratorProps> = ({ onGenerated }) => {
  const [input, setInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [generated, setGenerated] = useState<Partial<CharacterCard> | null>(null);

  const generateCharacter = () => {
    const desc = input.trim().toLowerCase();
    if (!desc) return;

    let charData: Partial<CharacterCard> = {};

    if (desc.includes('刺客') || desc.includes('杀手') || desc.includes('暗影')) {
      charData = {
        name: '影刃', title: '暗影之刃', gender: 'male',
        appearance: '黑色紧身劲装，银色面具遮住半张脸。双眼如鹰隼般锐利，腰间佩戴着淬毒的匕首。',
        background: '出身于被毁灭的暗影宗门，自幼接受残酷训练成为顶尖刺客。',
        personality: '冷酷,果断,孤独,正义感,隐忍',
        beliefs: '追查并摧毁培养他的暗影组织，为死去的同伴复仇。',
        strength: 18, agility: 22, intelligence: 12, charisma: 8,
      };
    } else if (desc.includes('精灵') || desc.includes('弓箭') || desc.includes('森林')) {
      charData = {
        name: '艾拉瑞尔', title: '翡翠射手', gender: 'female',
        appearance: '翠绿色长发如瀑布般垂落，尖耳上佩戴着树叶形状的水晶耳坠。身着轻便的皮甲。',
        background: '翡翠森林的守护者，精灵族中最年轻的神射手。',
        personality: '活泼,善良,勇敢,自然亲和,正义',
        beliefs: '守护翡翠森林不被外界侵扰，寻找失落的精灵圣物。',
        strength: 12, agility: 20, intelligence: 16, charisma: 14,
      };
    } else if (desc.includes('黑客') || desc.includes('赛博') || desc.includes('科技')) {
      charData = {
        name: '零', title: '幽灵黑客', gender: 'female',
        appearance: '银白色短发，左眼是散发着蓝光的机械义眼。右臂完全机械化。',
        background: '新东京地下世界的传奇黑客，拥有半机械化的身体。',
        personality: '聪明,叛逆,正义感,技术宅,独立',
        beliefs: '揭露星环科技的阴谋，摧毁"伊甸园"计划。',
        strength: 8, agility: 14, intelligence: 24, charisma: 12,
      };
    } else if (desc.includes('法师') || desc.includes('魔法') || desc.includes('巫师')) {
      charData = {
        name: '奥瑞恩', title: '星辰法师', gender: 'male',
        appearance: '银灰色长发用星辰发冠束起，身穿绣有四大元素符文的深蓝色法袍。',
        background: '元素议会最年轻的大法师，拥有罕见的四元素亲和体质。',
        personality: '睿智,温和,好奇,责任感,博学',
        beliefs: '寻找恢复元素精灵力量的方法，阻止黑暗势力打开远古封印。',
        strength: 10, agility: 10, intelligence: 24, charisma: 14,
      };
    } else {
      charData = {
        name: '无名旅者', title: '命运之子', gender: 'male',
        appearance: '穿着旅行者常见的斗篷和皮甲，腰间挂着一把隐隐发光的短剑。',
        background: '一个来历神秘的旅者，似乎与这个世界的命运有着某种联系。',
        personality: '勇敢,机智,神秘,适应力强,正义',
        beliefs: '探索世界的真相，寻找自己的身世之谜。',
        strength: 12, agility: 12, intelligence: 12, charisma: 12,
      };
    }

    setGenerated(charData);
    onGenerated?.(charData);
  };

  const applyTemplate = (templateName: string) => {
    setInput(`一个${templateName}角色`);
    setShowTemplates(false);
    setTimeout(generateCharacter, 100);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 12, fontSize: '0.9rem' }}>描述你想要的角色，AI会为你生成完整的角色设定</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{
            width: '100%', minHeight: 80, padding: 12, background: 'rgba(0,0,0,0.3)',
            border: '1px solid var(--border-default)', borderRadius: 8, color: '#fff',
            fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12,
          }}
          placeholder="例如：一个冷酷的刺客，擅长暗影魔法..."
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={generateCharacter}>✨ AI生成角色</button>
          <button className="btn-secondary" onClick={() => setShowTemplates(!showTemplates)}>📋 选择模板</button>
        </div>
      </div>

      {showTemplates && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 12,
          marginBottom: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12,
        }}>
          {TEMPLATES.map((t) => (
            <div
              key={t.name}
              style={{
                padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)',
                borderRadius: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
              }}
              onClick={() => applyTemplate(t.name)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 8 }}>{t.icon}</span>
              <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{t.name}</strong>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '6px 0 0', lineHeight: 1.4 }}>{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      {generated && (
        <div style={{
          padding: 20, background: 'rgba(168,85,247,0.05)', border: '1px solid var(--border-active)',
          borderRadius: 16, marginBottom: 16,
        }}>
          <h4 style={{ color: 'var(--color-purple-light)', margin: '0 0 12px' }}>🤖 AI生成结果</h4>
          <div style={{ display: 'grid', gap: 8 }}>
            {Object.entries(generated).map(([key, val]) => {
              if (!val || typeof val === 'object') return null;
              const labels: Record<string, string> = {
                name: '名称', title: '称号', gender: '性别', appearance: '外貌',
                background: '背景', personality: '性格', beliefs: '信念',
              };
              return (
                <div key={key} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: 60 }}>{labels[key] || key}:</span>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>{String(val)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
