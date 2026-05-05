export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar_url: string;
  is_active: boolean;
  coins: number;
  experience: number;
  level: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface WorldBook {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cover_url: string;
  category: string;
  tags: string;
  price: number;
  is_published: boolean;
  is_featured: boolean;
  play_count: number;
  like_count: number;
  version: number;
  worldview: string;
  timeline: string;
  world_rules: string;
  geography: string;
  culture: string;
  history: string;
  races: string;
  factions: string;
  gods: string;
  artifacts: string;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: number;
  name: string;
  description: string;
  scene_type: string;
  visual_prompt: string;
  video_url: string;
  image_url: string;
  duration_seconds: number;
  is_generated: boolean;
  generation_status: string;
  worldbook_id: number;
  order_index: number;
  created_at: string;
}

export interface StoryBranch {
  id: number;
  choice_text: string;
  choice_id: string;
  description: string;
  is_hot: boolean;
  choice_count: number;
  from_scene_id: number;
  to_scene_id: number | null;
}

// ========== 角色状态向量系统 ==========
export interface CharacterVisual {
  level: number;
  exp: number;
  expToNext: number;
  equipped_title: string;
  outfit: string;
  weapon_skin: string;
  aura: string;
  mount: string;
  portrait: string | null;
}

export interface CharacterCapability {
  attributes: {
    str: number;
    agi: number;
    int: number;
    vit: number;
    cha: number;
    luk: number;
  };
  skills: CharacterSkill[];
  passive_skills: string[];
  combat_power: number;
}

export interface CharacterSkill {
  name: string;
  description: string;
  level: number;
}

export interface NPCRelationship {
  name: string;
  value: number; // -100 to 100
  lastUpdated: string;
}

export interface CharacterRelational {
  npc_relationships: Record<string, NPCRelationship>;
  faction_standing: Record<string, string>;
  reputation: number;
}

export interface CharacterWorldState {
  flags: Record<string, { value: any; setAt: string }>;
  economy: Record<string, number>;
  weather: string;
}

export interface TravelLog {
  worldId: number;
  worldName: string;
  nodeId: string;
  nodeName: string;
  choice: string;
  timestamp: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  unlockedAt: string;
}

export interface CharacterCard {
  id: number;
  name: string;
  title: string;
  identity: string;
  gender: string;
  age: string;
  appearance: string;
  background: string;
  personality: string;
  beliefs: string;
  avatar_url: string;
  worldbook_id: number | null;
  ip_type: string;
  ip_source: string;
  ip_author: string;
  ip_url: string;
  level: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  strength: number;
  agility: number;
  intelligence: number;
  charisma: number;
  is_published: boolean;
  price: number;
  usage_count: number;
  creator_id: number;
  created_at: string;
  updated_at: string;

  // 扩展字段
  visual?: CharacterVisual;
  capability?: CharacterCapability;
  relational?: CharacterRelational;
  world_state?: CharacterWorldState;
  travel_log?: TravelLog[];
  achievements?: Achievement[];
}

// ========== 分支系统 ==========
export interface WorldBranch {
  id: string;
  worldId: number;
  parentBranchId: string | null;
  rootWorldId: number;
  forkPointNodeId: string;
  forkDepth: number;
  creatorId: number | null;
  branchType: 'extension' | 'alternate' | 'remix';
  visibility: 'public' | 'friends_only' | 'inherited';
  forkLicense: string;
  diffData: BranchDiff;
  stats: BranchStats;
  metadata: BranchMetadata;
}

export interface BranchDiff {
  addedNodes: string[];
  modifiedNodes: Record<string, any>;
  removedNodes: string[];
  newCharacters: string[];
  newItems: string[];
}

export interface BranchStats {
  playCount: number;
  forkCount: number;
  rating: number;
}

export interface BranchMetadata {
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
}

// ========== 动态世界状态 ==========
export interface WorldVariable {
  name: string;
  value: number;
  min: number;
  max: number;
  initial: number;
}

export interface WorldEvent {
  id: string;
  trigger: string;
  name: string;
  effects: string[];
}

export interface WorldStateSnapshot {
  userId: number;
  worldId: number;
  characterId: number | null;
  currentNodeId: string | null;
  choiceHistory: { nodeId: string; choice: string; timestamp: string }[];
  characterSnapshot: any;
  worldVariables: Record<string, number>;
  flags: Record<string, any>;
  npcRelationships: Record<string, NPCRelationship>;
  playTimeSeconds: number;
  nodesVisited: number;
  branchesCreated: number;
  createdAt: string;
  updatedAt: string;
}

// ========== AI导演 ==========
export interface ScenePromptConfig {
  nodeTemplate: any;
  characterState: any;
  worldState: any;
}

export interface BranchSuggestion {
  type: string;
  title: string;
  description: string;
  preview: string;
  requires: Record<string, any>;
}

export interface NarrativeContext {
  characterState: any;
  worldState: any;
  choiceHistory: any[];
  currentNode: any;
}
