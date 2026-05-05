export interface WorldBook {
  id: string;
  name: string;
  description: string;
  type: 'fantasy' | 'scifi' | 'modern' | 'historical' | 'horror';
  era: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  tags: string[];
  rules: WorldRule[];
  geography: GeographyInfo;
  factions: Faction[];
  storyNodes: StoryNode[];
  characters: CharacterPreset[];
  items: Item[];
  visualStyle: VisualStyle;
  createdAt: string;
  updatedAt: string;
}

export interface WorldRule {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface GeographyInfo {
  description: string;
  regions: Region[];
  climate: string;
  landmarks: string[];
}

export interface Region {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  alignment: string;
  traits: string[];
}

export interface StoryNode {
  id: string;
  title: string;
  description: string;
  type: 'scene' | 'dialogue' | 'battle' | 'choice' | 'ending';
  position: { x: number; y: number };
  connections: string[];
  options?: StoryOption[];
  videoConfig?: VideoConfig;
  conditions?: Condition[];
}

export interface StoryOption {
  id: string;
  text: string;
  targetNodeId: string;
  conditions?: Condition[];
  effects?: Effect[];
}

export interface Condition {
  type: 'stat' | 'item' | 'flag' | 'random';
  key: string;
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
  value: string | number;
}

export interface Effect {
  type: 'stat' | 'item' | 'flag';
  key: string;
  value: string | number;
}

export interface VideoConfig {
  prompt: string;
  duration: number;
  style: string;
  cameraMotion: string[];
  music?: string;
}

export interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  role: string;
  appearance: string;
  personality: string;
  voice: string;
  behavior: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  effects: string[];
}

export interface VisualStyle {
  primaryColor: string;
  elements: string[];
  referenceImages: string[];
  style: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  appearance: {
    gender: string;
    age: string;
    height: string;
    build: string;
    hair: string;
    eyes: string;
    clothing: string;
    features: string[];
  };
  personality: {
    traits: string[];
    alignment: string;
    motivation: string;
    fears: string[];
    strengths: string[];
    weaknesses: string[];
  };
  voice: {
    type: string;
    tone: string;
    accent: string;
    speed: string;
    emotion: string;
  };
  behavior: {
    greeting: string;
    dialogueStyle: string;
    actionPatterns: string[];
    reactionTriggers: string[];
  };
  stats: {
    level: number;
    exp: number;
    hp: number;
    mp: number;
    strength: number;
    agility: number;
    intelligence: number;
    charisma: number;
  };
  skills: Skill[];
  inventory: Item[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: string;
  level: number;
  maxLevel: number;
}

export interface Relationship {
  characterId: string;
  type: string;
  level: number;
  description: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description?: string;
    config?: Record<string, any>;
    status?: 'idle' | 'running' | 'completed' | 'error';
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface GenerationTask {
  id: string;
  type: 'image' | 'video' | 'audio' | 'text';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  result?: string;
  progress: number;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  worldBookId?: string;
  characterIds: string[];
  nodes: StoryNode[];
  createdAt: string;
  updatedAt: string;
}
