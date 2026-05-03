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
}
