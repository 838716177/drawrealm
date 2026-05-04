import { useCallback } from 'react';
import type { CharacterCard, BranchSuggestion, NarrativeContext } from '../types';

export function useAIDirector() {
  const generateScenePrompt = useCallback((nodeTemplate: any, characterState: CharacterCard | undefined, worldState: any) => {
    const parts: string[] = [];

    if (nodeTemplate?.visual_prompt) parts.push(nodeTemplate.visual_prompt);

    // 角色视觉注入
    if (characterState?.visual) {
      const v = characterState.visual;
      const visualParts: string[] = [];
      if (v.level >= 100) visualParts.push('divine golden halo radiating from the body');
      else if (v.level >= 50) visualParts.push('faint glowing aura surrounding the character');
      else if (v.level >= 20) visualParts.push('subtle energy emanating from the body');
      if (v.equipped_title) visualParts.push(`bearing the title "${v.equipped_title}"`);
      if (v.outfit && v.outfit !== 'default') visualParts.push(`wearing ${v.outfit}`);
      if (v.weapon_skin) visualParts.push(`wielding a ${v.weapon_skin}`);
      if (v.aura) visualParts.push(`surrounded by ${v.aura} aura`);
      if (v.mount) visualParts.push(`riding a majestic ${v.mount}`);
      if (visualParts.length) parts.push('Character: ' + visualParts.join(', '));
    }

    // 世界状态注入
    if (worldState?.flags) {
      const wp: string[] = [];
      if (worldState.flags.destroyed_factory?.value) wp.push('factory destroyed, smoke rising');
      if (worldState.flags.saved_mayor?.value) wp.push('city celebrating, banners flying');
      if (wp.length) parts.push('Environment: ' + wp.join(', '));
    }

    // NPC行为注入
    if (characterState?.relational?.npc_relationships) {
      const np: string[] = [];
      Object.entries(characterState.relational.npc_relationships).forEach(([, rel]: [string, any]) => {
        if (rel.value >= 80) np.push(`${rel.name} smiles warmly`);
        else if (rel.value <= -30) np.push(`${rel.name} looks hostile`);
      });
      if (np.length) parts.push('NPCs: ' + np.join(', '));
    }

    return parts.join('. ');
  }, []);

  const generateNarrative = useCallback((nodeTemplate: any, context: NarrativeContext) => {
    const { characterState, worldState, choiceHistory } = context;
    let narrative = nodeTemplate?.description || '';

    if (characterState?.visual?.level && characterState.visual.level >= 50) {
      narrative += ' 你的强大气场让周围的一切都变得渺小。';
    }

    if (worldState?.globalFlags?.event_martial_law_triggered) {
      narrative += ' 戒严令下的街道显得格外冷清，巡逻机器人的红眼扫视着每一个角落。';
    }

    const style = detectPlayerStyle(choiceHistory);
    if (style === 'aggressive') narrative += ' 空气中弥漫着战斗的气息。';
    if (style === 'diplomatic') narrative += ' 你感觉到言语中蕴含的力量。';

    return narrative;
  }, []);

  const suggestBranches = useCallback((nodeContext: any, characterState: CharacterCard | undefined): BranchSuggestion[] => {
    const suggestions: BranchSuggestion[] = [];

    if (characterState?.capability?.combat_power && characterState.capability.combat_power >= 5000) {
      suggestions.push({
        type: 'power',
        title: '以力破局',
        description: '凭借强大的战斗力直接突破当前困境',
        preview: '你释放出强大的气场，周围的敌人不由自主地后退...',
        requires: { combat_power: 5000 },
      });
    }

    if (characterState?.capability?.attributes?.int && characterState.capability.attributes.int >= 30) {
      suggestions.push({
        type: 'intelligence',
        title: '智取妙计',
        description: '运用智慧找到非常规解决方案',
        preview: '你仔细观察周围环境，发现了一个隐藏的机关...',
        requires: { int: 30 },
      });
    }

    if (characterState?.capability?.attributes?.cha && characterState.capability.attributes.cha >= 25) {
      suggestions.push({
        type: 'charisma',
        title: '巧舌如簧',
        description: '用言语说服对方，化敌为友',
        preview: '你的话语如同春风化雨，对方的态度逐渐软化...',
        requires: { cha: 25 },
      });
    }

    suggestions.push({
      type: 'twist',
      title: '命运转折',
      description: '一个完全出乎意料的第三选项',
      preview: '就在此时，一个你完全没有预料到的情况发生了...',
      requires: {},
    });

    return suggestions.slice(0, 4);
  }, []);

  const checkConsistency = useCallback((worldId: number, newNode: any, choiceHistory: any[]) => {
    const issues: string[] = [];
    if (choiceHistory?.length > 0) {
      const last = choiceHistory[choiceHistory.length - 1];
      if (last?.choice?.includes('杀死') && newNode?.description?.includes('那个被你杀死的人')) {
        issues.push('角色已死亡，不应再次出现');
      }
    }
    return { isConsistent: issues.length === 0, issues };
  }, []);

  return { generateScenePrompt, generateNarrative, suggestBranches, checkConsistency };
}

function detectPlayerStyle(choiceHistory: any[]): string {
  if (!choiceHistory || choiceHistory.length < 3) return 'balanced';
  const aggressive = choiceHistory.filter((c) => c.choice?.includes('战斗') || c.choice?.includes('攻击')).length;
  const diplomatic = choiceHistory.filter((c) => c.choice?.includes('谈判') || c.choice?.includes('说服')).length;
  if (aggressive > diplomatic) return 'aggressive';
  if (diplomatic > aggressive) return 'diplomatic';
  return 'balanced';
}
