import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CharacterCard, CharacterVisual, CharacterCapability, NPCRelationship, TravelLog, Achievement } from '../types';

interface CharacterState {
  characters: CharacterCard[];
  currentCharacterId: number | null;

  addCharacter: (char: CharacterCard) => void;
  updateCharacter: (id: number, updates: Partial<CharacterCard>) => void;
  removeCharacter: (id: number) => void;
  setCurrentCharacter: (id: number | null) => void;
  getCharacter: (id: number) => CharacterCard | undefined;

  // 升级系统
  addExp: (id: number, amount: number) => boolean;

  // NPC关系
  setNPCRelationship: (charId: number, npcId: string, npcName: string, value: number) => void;
  changeNPCRelationship: (charId: number, npcId: string, delta: number) => void;

  // 世界Flag
  setWorldFlag: (charId: number, flag: string, value: any) => void;
  hasWorldFlag: (charId: number, flag: string) => boolean;

  // 旅行记录
  addTravelLog: (charId: number, log: TravelLog) => void;
  getTravelHighlights: (charId: number) => any[];

  // 成就
  unlockAchievement: (charId: number, achievement: Achievement) => void;

  // 生成分享卡
  generateShareCard: (charId: number) => any;
}

const calcCombatPower = (attrs: CharacterCapability['attributes']) => {
  return Math.floor((attrs.str + attrs.agi + attrs.int + attrs.vit + attrs.cha + attrs.luk) * 2.5);
};

const getPrimaryAttr = (traits: string[]) => {
  const t = traits.join('').toLowerCase();
  if (t.includes('力量') || t.includes('战士') || t.includes('勇猛')) return 'str';
  if (t.includes('敏捷') || t.includes('刺客') || t.includes('灵活')) return 'agi';
  if (t.includes('智慧') || t.includes('法师') || t.includes('博学')) return 'int';
  if (t.includes('魅力') || t.includes('领袖') || t.includes('外交')) return 'cha';
  return 'str';
};

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      characters: [],
      currentCharacterId: null,

      addCharacter: (char) => {
        const enriched: CharacterCard = {
          ...char,
          visual: char.visual || {
            level: char.level || 1,
            exp: 0,
            expToNext: 100,
            equipped_title: char.title || '',
            outfit: 'default',
            weapon_skin: '',
            aura: '',
            mount: '',
            portrait: null,
          },
          capability: char.capability || {
            attributes: {
              str: char.strength || 10,
              agi: char.agility || 10,
              int: char.intelligence || 10,
              vit: 10,
              cha: char.charisma || 10,
              luk: 10,
            },
            skills: [],
            passive_skills: [],
            combat_power: calcCombatPower({
              str: char.strength || 10,
              agi: char.agility || 10,
              int: char.intelligence || 10,
              vit: 10,
              cha: char.charisma || 10,
              luk: 10,
            }),
          },
          relational: char.relational || {
            npc_relationships: {},
            faction_standing: {},
            reputation: 0,
          },
          world_state: char.world_state || {
            flags: {},
            economy: {},
            weather: 'clear',
          },
          travel_log: char.travel_log || [],
          achievements: char.achievements || [],
        };
        set((s) => ({ characters: [...s.characters, enriched] }));
      },

      updateCharacter: (id, updates) => {
        set((s) => ({
          characters: s.characters.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      removeCharacter: (id) => {
        set((s) => ({
          characters: s.characters.filter((c) => c.id !== id),
          currentCharacterId: s.currentCharacterId === id ? null : s.currentCharacterId,
        }));
      },

      setCurrentCharacter: (id) => set({ currentCharacterId: id }),

      getCharacter: (id) => get().characters.find((c) => c.id === id),

      addExp: (id, amount) => {
        const char = get().getCharacter(id);
        if (!char || !char.visual) return false;

        const newExp = char.visual.exp + amount;
        let leveledUp = false;
        let newLevel = char.visual.level;
        let newExpToNext = char.visual.expToNext;
        let remainingExp = newExp;

        while (remainingExp >= newExpToNext) {
          remainingExp -= newExpToNext;
          newLevel++;
          newExpToNext = Math.floor(100 * Math.pow(1.2, newLevel - 1));
          leveledUp = true;
        }

        const updates: Partial<CharacterCard> = {
          visual: { ...char.visual, exp: remainingExp, level: newLevel, expToNext: newExpToNext },
          level: newLevel,
        };

        if (leveledUp && char.capability) {
          const primary = getPrimaryAttr(char.personality ? [char.personality] : []);
          const attrs = { ...char.capability.attributes };
          attrs[primary as keyof typeof attrs] += 2;
          const order = ['str', 'agi', 'int', 'vit', 'cha', 'luk'];
          const secondary = order[(order.indexOf(primary) + 1) % order.length];
          attrs[secondary as keyof typeof attrs] += 1;
          attrs.vit += 1;

          updates.capability = {
            ...char.capability,
            attributes: attrs,
            combat_power: calcCombatPower(attrs),
          };
        }

        get().updateCharacter(id, updates);
        return true;
      },

      setNPCRelationship: (charId, npcId, npcName, value) => {
        const char = get().getCharacter(charId);
        if (!char || !char.relational) return;
        const rels = { ...char.relational.npc_relationships };
        rels[npcId] = { name: npcName, value: Math.max(-100, Math.min(100, value)), lastUpdated: new Date().toISOString() };
        get().updateCharacter(charId, {
          relational: { ...char.relational, npc_relationships: rels },
        });
      },

      changeNPCRelationship: (charId, npcId, delta) => {
        const char = get().getCharacter(charId);
        if (!char || !char.relational) return;
        const rel = char.relational.npc_relationships[npcId];
        if (rel) {
          get().setNPCRelationship(charId, npcId, rel.name, rel.value + delta);
        }
      },

      setWorldFlag: (charId, flag, value) => {
        const char = get().getCharacter(charId);
        if (!char || !char.world_state) return;
        const flags = { ...char.world_state.flags };
        flags[flag] = { value, setAt: new Date().toISOString() };
        get().updateCharacter(charId, {
          world_state: { ...char.world_state, flags },
        });
      },

      hasWorldFlag: (charId, flag) => {
        const char = get().getCharacter(charId);
        return !!char?.world_state?.flags?.[flag];
      },

      addTravelLog: (charId, log) => {
        const char = get().getCharacter(charId);
        if (!char) return;
        const logs = [...(char.travel_log || []), log];
        if (logs.length > 200) logs.splice(0, logs.length - 200);
        get().updateCharacter(charId, { travel_log: logs });
      },

      getTravelHighlights: (charId) => {
        const char = get().getCharacter(charId);
        if (!char || !char.travel_log) return [];
        const byWorld: Record<number, TravelLog[]> = {};
        char.travel_log.forEach((log) => {
          if (!byWorld[log.worldId]) byWorld[log.worldId] = [];
          byWorld[log.worldId].push(log);
        });
        return Object.entries(byWorld).map(([wid, logs]) => ({
          worldId: Number(wid),
          worldName: logs[0].worldName,
          firstVisit: logs[0].timestamp,
          lastVisit: logs[logs.length - 1].timestamp,
          nodesVisited: logs.length,
          keyChoices: logs.filter((l) => l.choice).map((l) => l.choice),
        }));
      },

      unlockAchievement: (charId, achievement) => {
        const char = get().getCharacter(charId);
        if (!char || char.achievements?.find((a) => a.id === achievement.id)) return;
        const achievements = [...(char.achievements || []), { ...achievement, unlockedAt: new Date().toISOString() }];
        get().updateCharacter(charId, { achievements });
      },

      generateShareCard: (charId) => {
        const char = get().getCharacter(charId);
        if (!char) return null;
        const highlights = get().getTravelHighlights(charId);
        const rareAchievements = (char.achievements || []).filter((a) => a.rarity === 'rare' || a.rarity === 'legendary');
        return {
          id: char.id,
          name: char.name,
          alias: char.title,
          level: char.visual?.level || char.level,
          title: char.visual?.equipped_title || char.title,
          combat_power: char.capability?.combat_power || 0,
          outfit: char.visual?.outfit,
          aura: char.visual?.aura,
          mount: char.visual?.mount,
          travel_count: highlights.length,
          achievement_count: (char.achievements || []).length,
          rare_achievements: rareAchievements.length,
          highlights: highlights.slice(0, 5),
          best_moment: char.travel_log?.length ? char.travel_log[char.travel_log.length - 1] : null,
        };
      },
    }),
    {
      name: 'drawrealm-characters',
      partialize: (state) => ({ characters: state.characters, currentCharacterId: state.currentCharacterId }),
    }
  )
);
