import { create } from 'zustand';
import type { WorldBook, Scene, StoryBranch, CharacterCard } from '../types';

interface WorldState {
  currentWorldBook: WorldBook | null;
  currentScene: Scene | null;
  currentBranches: StoryBranch[];
  selectedCharacter: CharacterCard | null;
  videoPlaying: boolean;
  generatedContent: string;
  isGenerating: boolean;

  setCurrentWorldBook: (wb: WorldBook | null) => void;
  setCurrentScene: (scene: Scene | null) => void;
  setCurrentBranches: (branches: StoryBranch[]) => void;
  setSelectedCharacter: (char: CharacterCard | null) => void;
  setVideoPlaying: (playing: boolean) => void;
  setGeneratedContent: (content: string) => void;
  appendGeneratedContent: (chunk: string) => void;
  setIsGenerating: (generating: boolean) => void;
  resetGeneration: () => void;
}

export const useWorldStore = create<WorldState>((set) => ({
  currentWorldBook: null,
  currentScene: null,
  currentBranches: [],
  selectedCharacter: null,
  videoPlaying: false,
  generatedContent: '',
  isGenerating: false,

  setCurrentWorldBook: (wb) => set({ currentWorldBook: wb }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setCurrentBranches: (branches) => set({ currentBranches: branches }),
  setSelectedCharacter: (char) => set({ selectedCharacter: char }),
  setVideoPlaying: (playing) => set({ videoPlaying: playing }),
  setGeneratedContent: (content) => set({ generatedContent: content }),
  appendGeneratedContent: (chunk) => set((s) => ({ generatedContent: s.generatedContent + chunk })),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  resetGeneration: () => set({ generatedContent: '', isGenerating: false }),
}));
