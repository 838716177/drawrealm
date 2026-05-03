import type { WorldBook, CharacterCard, Project, StoryNode } from '../types'

// Local Storage Service for data persistence
const STORAGE_KEYS = {
  WORLDBOOKS: 'hijing_worldbooks',
  CHARACTERS: 'hijing_characters',
  PROJECTS: 'hijing_projects',
  NODES: 'hijing_nodes',
  SETTINGS: 'hijing_settings',
}

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  // World Books
  getWorldBooks(): WorldBook[] {
    return this.getItem<WorldBook[]>(STORAGE_KEYS.WORLDBOOKS, [])
  }

  saveWorldBook(book: WorldBook): void {
    const books = this.getWorldBooks()
    const existingIndex = books.findIndex((b) => b.id === book.id)
    if (existingIndex >= 0) {
      books[existingIndex] = { ...book, updatedAt: new Date().toISOString() }
    } else {
      books.push({
        ...book,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    this.setItem(STORAGE_KEYS.WORLDBOOKS, books)
  }

  deleteWorldBook(id: string): void {
    const books = this.getWorldBooks().filter((b) => b.id !== id)
    this.setItem(STORAGE_KEYS.WORLDBOOKS, books)
  }

  // Character Cards
  getCharacters(): CharacterCard[] {
    return this.getItem<CharacterCard[]>(STORAGE_KEYS.CHARACTERS, [])
  }

  saveCharacter(character: CharacterCard): void {
    const characters = this.getCharacters()
    const existingIndex = characters.findIndex((c) => c.id === character.id)
    if (existingIndex >= 0) {
      characters[existingIndex] = { ...character, updatedAt: new Date().toISOString() }
    } else {
      characters.push({
        ...character,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    this.setItem(STORAGE_KEYS.CHARACTERS, characters)
  }

  deleteCharacter(id: string): void {
    const characters = this.getCharacters().filter((c) => c.id !== id)
    this.setItem(STORAGE_KEYS.CHARACTERS, characters)
  }

  // Projects
  getProjects(): Project[] {
    return this.getItem<Project[]>(STORAGE_KEYS.PROJECTS, [])
  }

  saveProject(project: Project): void {
    const projects = this.getProjects()
    const existingIndex = projects.findIndex((p) => p.id === project.id)
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...project, updatedAt: new Date().toISOString() }
    } else {
      projects.push({
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }
    this.setItem(STORAGE_KEYS.PROJECTS, projects)
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id)
    this.setItem(STORAGE_KEYS.PROJECTS, projects)
  }

  // Story Nodes
  getNodes(): StoryNode[] {
    return this.getItem<StoryNode[]>(STORAGE_KEYS.NODES, [])
  }

  saveNodes(nodes: StoryNode[]): void {
    this.setItem(STORAGE_KEYS.NODES, nodes)
  }

  // Settings
  getSettings(): Record<string, any> {
    return this.getItem<Record<string, any>>(STORAGE_KEYS.SETTINGS, {})
  }

  saveSettings(settings: Record<string, any>): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings)
  }

  // Export/Import
  exportAllData(): string {
    const data = {
      worldBooks: this.getWorldBooks(),
      characters: this.getCharacters(),
      projects: this.getProjects(),
      nodes: this.getNodes(),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(data, null, 2)
  }

  importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString)
      if (data.worldBooks) this.setItem(STORAGE_KEYS.WORLDBOOKS, data.worldBooks)
      if (data.characters) this.setItem(STORAGE_KEYS.CHARACTERS, data.characters)
      if (data.projects) this.setItem(STORAGE_KEYS.PROJECTS, data.projects)
      if (data.nodes) this.setItem(STORAGE_KEYS.NODES, data.nodes)
      return true
    } catch {
      return false
    }
  }

  // Clear all data
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key))
  }

  // Get storage usage
  getStorageUsage(): { used: number; total: number } {
    let used = 0
    Object.values(STORAGE_KEYS).forEach((key) => {
      const item = localStorage.getItem(key)
      if (item) used += item.length * 2 // UTF-16 encoding
    })

    // Approximate total (5MB is typical limit)
    const total = 5 * 1024 * 1024
    return { used, total }
  }
}

export const storageService = new StorageService()
