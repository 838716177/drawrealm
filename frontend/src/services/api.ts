import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { User, TokenResponse, WorldBook, Scene, StoryBranch, CharacterCard } from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 180000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    api.post<User>('/auth/register', data).then((r) => r.data),
  login: (data: { username: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', data).then((r) => r.data),
  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

export const worldbookAPI = {
  list: (params?: { skip?: number; limit?: number; category?: string; search?: string; my_only?: boolean }) =>
    api.get<WorldBook[]>('/worldbooks/', { params }).then((r) => r.data),
  get: (id: number) => api.get<WorldBook>(`/worldbooks/${id}`).then((r) => r.data),
  create: (data: Partial<WorldBook>) => api.post<WorldBook>('/worldbooks/', data).then((r) => r.data),
  update: (id: number, data: Partial<WorldBook>) => api.put<WorldBook>(`/worldbooks/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/worldbooks/${id}`),
  categories: () => api.get<string[]>('/worldbooks/categories').then((r) => r.data),
};

export const sceneAPI = {
  list: (worldbookId: number) => api.get<Scene[]>(`/scenes/worldbook/${worldbookId}`).then((r) => r.data),
  create: (worldbookId: number, data: Partial<Scene>) =>
    api.post<Scene>(`/scenes/worldbook/${worldbookId}`, data).then((r) => r.data),
  branches: (sceneId: number) => api.get<StoryBranch[]>(`/scenes/${sceneId}/branches`).then((r) => r.data),
  addBranch: (sceneId: number, data: Partial<StoryBranch>) =>
    api.post<StoryBranch>(`/scenes/${sceneId}/branches`, data).then((r) => r.data),
  selectBranch: (sceneId: number, branchId: number) =>
    api.post(`/scenes/${sceneId}/select-branch/${branchId}`).then((r) => r.data),
};

export const characterAPI = {
  list: (params?: { skip?: number; limit?: number; worldbook_id?: number; search?: string; my_only?: boolean }) =>
    api.get<CharacterCard[]>('/characters/', { params }).then((r) => r.data),
  get: (id: number) => api.get<CharacterCard>(`/characters/${id}`).then((r) => r.data),
  create: (data: Partial<CharacterCard>) => api.post<CharacterCard>('/characters/', data).then((r) => r.data),
  update: (id: number, data: Partial<CharacterCard>) =>
    api.put<CharacterCard>(`/characters/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/characters/${id}`),
};

export const aiAPI = {
  generateWorldview: (userInput: string, style?: string) =>
    api.post<{ content: string; model_used: string; tokens_used: number }>('/ai/generate-worldview', {
      user_input: userInput,
      style: style || '史诗奇幻',
    }).then((r) => r.data),

  generateWorldviewStream: (userInput: string, style?: string) => {
    const token = useAuthStore.getState().token;
    return fetch('/api/v1/ai/generate-worldview-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user_input: userInput, style: style || '史诗奇幻' }),
    });
  },

  generateOpening: (worldbookId: number, characterId?: number) =>
    api.post<{ content: string; model_used: string; tokens_used: number }>('/ai/generate-opening', {
      worldbook_id: worldbookId,
      character_id: characterId,
    }).then((r) => r.data),

  generateOpeningStream: (worldbookId: number) => {
    const token = useAuthStore.getState().token;
    return fetch('/api/v1/ai/generate-opening-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ worldbook_id: worldbookId }),
    });
  },

  generateScene: (worldbookId: number, sceneName: string, sceneDescription: string, previousContext?: string) =>
    api.post('/ai/generate-scene', {
      worldbook_id: worldbookId,
      scene_name: sceneName,
      scene_description: sceneDescription,
      previous_scene_context: previousContext,
    }).then((r) => r.data),

  generateBranches: (worldbookId: number, sceneId: number, numBranches: number = 3) =>
    api.post('/ai/generate-branches', {
      worldbook_id: worldbookId,
      scene_id: sceneId,
      num_branches: numBranches,
    }).then((r) => r.data),

  generateImage: (prompt: string, size?: string) =>
    api.post<{ image_url: string; prompt_used: string }>('/ai/generate-image', {
      prompt,
      size: size || '1024x1024',
    }).then((r) => r.data),

  generateVideo: (imageUrl: string, prompt?: string, duration?: number) =>
    api.post<{ video_url: string; status: string }>('/ai/generate-video', {
      image_url: imageUrl,
      prompt: prompt || '',
      duration: duration || 5,
    }).then((r) => r.data),
};

export default api;
