import { create } from 'zustand'
import type { WorldBook, CharacterCard, StoryNode, WorkflowNode, WorkflowEdge, GenerationTask, Project } from '../types'

interface AppState {
  // Navigation
  currentPage: string
  setCurrentPage: (page: string) => void

  // World Books
  worldBooks: WorldBook[]
  currentWorldBook: WorldBook | null
  setWorldBooks: (books: WorldBook[]) => void
  setCurrentWorldBook: (book: WorldBook | null) => void
  addWorldBook: (book: WorldBook) => void
  updateWorldBook: (id: string, updates: Partial<WorldBook>) => void

  // Character Cards
  characterCards: CharacterCard[]
  currentCharacter: CharacterCard | null
  setCharacterCards: (cards: CharacterCard[]) => void
  setCurrentCharacter: (card: CharacterCard | null) => void
  addCharacterCard: (card: CharacterCard) => void
  updateCharacterCard: (id: string, updates: Partial<CharacterCard>) => void

  // Story Nodes / Branching
  storyNodes: StoryNode[]
  currentNode: StoryNode | null
  setStoryNodes: (nodes: StoryNode[]) => void
  setCurrentNode: (node: StoryNode | null) => void
  addStoryNode: (node: StoryNode) => void
  updateStoryNode: (id: string, updates: Partial<StoryNode>) => void
  removeStoryNode: (id: string) => void

  // Workflow
  workflowNodes: WorkflowNode[]
  workflowEdges: WorkflowEdge[]
  setWorkflowNodes: (nodes: WorkflowNode[]) => void
  setWorkflowEdges: (edges: WorkflowEdge[]) => void
  addWorkflowNode: (node: WorkflowNode) => void
  addWorkflowEdge: (edge: WorkflowEdge) => void
  removeWorkflowNode: (id: string) => void
  removeWorkflowEdge: (id: string) => void

  // Generation Tasks
  generationTasks: GenerationTask[]
  setGenerationTasks: (tasks: GenerationTask[]) => void
  addGenerationTask: (task: GenerationTask) => void
  updateGenerationTask: (id: string, updates: Partial<GenerationTask>) => void

  // Projects
  projects: Project[]
  currentProject: Project | null
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
}

export const useStore = create<AppState>((set) => ({
  // Navigation
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  // World Books
  worldBooks: [],
  currentWorldBook: null,
  setWorldBooks: (books) => set({ worldBooks: books }),
  setCurrentWorldBook: (book) => set({ currentWorldBook: book }),
  addWorldBook: (book) => set((state) => ({ worldBooks: [...state.worldBooks, book] })),
  updateWorldBook: (id, updates) => set((state) => ({
    worldBooks: state.worldBooks.map((b) => b.id === id ? { ...b, ...updates } : b)
  })),

  // Character Cards
  characterCards: [],
  currentCharacter: null,
  setCharacterCards: (cards) => set({ characterCards: cards }),
  setCurrentCharacter: (card) => set({ currentCharacter: card }),
  addCharacterCard: (card) => set((state) => ({ characterCards: [...state.characterCards, card] })),
  updateCharacterCard: (id, updates) => set((state) => ({
    characterCards: state.characterCards.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),

  // Story Nodes
  storyNodes: [],
  currentNode: null,
  setStoryNodes: (nodes) => set({ storyNodes: nodes }),
  setCurrentNode: (node) => set({ currentNode: node }),
  addStoryNode: (node) => set((state) => ({ storyNodes: [...state.storyNodes, node] })),
  updateStoryNode: (id, updates) => set((state) => ({
    storyNodes: state.storyNodes.map((n) => n.id === id ? { ...n, ...updates } : n)
  })),
  removeStoryNode: (id) => set((state) => ({
    storyNodes: state.storyNodes.filter((n) => n.id !== id)
  })),

  // Workflow
  workflowNodes: [],
  workflowEdges: [],
  setWorkflowNodes: (nodes) => set({ workflowNodes: nodes }),
  setWorkflowEdges: (edges) => set({ workflowEdges: edges }),
  addWorkflowNode: (node) => set((state) => ({ workflowNodes: [...state.workflowNodes, node] })),
  addWorkflowEdge: (edge) => set((state) => ({ workflowEdges: [...state.workflowEdges, edge] })),
  removeWorkflowNode: (id) => set((state) => ({
    workflowNodes: state.workflowNodes.filter((n) => n.id !== id)
  })),
  removeWorkflowEdge: (id) => set((state) => ({
    workflowEdges: state.workflowEdges.filter((e) => e.id !== id)
  })),

  // Generation Tasks
  generationTasks: [],
  setGenerationTasks: (tasks) => set({ generationTasks: tasks }),
  addGenerationTask: (task) => set((state) => ({ generationTasks: [...state.generationTasks, task] })),
  updateGenerationTask: (id, updates) => set((state) => ({
    generationTasks: state.generationTasks.map((t) => t.id === id ? { ...t, ...updates } : t)
  })),

  // Projects
  projects: [],
  currentProject: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
}))
