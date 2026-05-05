import type { GenerationTask } from '../types'

// AI Service Interface
export interface AIService {
  generateText(prompt: string, options?: Record<string, any>): Promise<string>
  generateImage(prompt: string, options?: Record<string, any>): Promise<string>
  generateVideo(imageUrl: string, prompt: string, options?: Record<string, any>): Promise<string>
  generateAudio(text: string, voice?: string): Promise<string>
}

// Mock AI Service for development
class MockAIService implements AIService {
  async generateText(_prompt: string, options?: Record<string, any>): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const templates: Record<string, string> = {
      world: `【世界观设定】

时代背景：${options?.era || '近未来2150年'}

地理环境：
这是一座被巨型霓虹广告牌覆盖的都市，高耸入云的摩天大楼之间由空中走廊连接。永不停歇的雨幕为城市蒙上了一层神秘的蓝色光晕。

社会结构：
- 上层区：巨型公司高管和精英阶层居住的天空之城
- 中层区：普通市民的生活区域，充满各种商铺和娱乐场所
- 下层区：贫民窟和地下世界，是黑客与雇佣兵的聚集地

科技水平：
- 义体改造技术高度发达
- 量子计算机网络覆盖全城
- 反重力飞行器成为主要交通工具

魔法/特殊体系：
在这个世界中，"神经链接"技术让人类可以直接接入数字世界，一些特殊个体拥有操控电子设备的天然能力。`,

      character: `【角色档案】

姓名：${options?.name || '未知'}

外观特征：
- 身高：185cm
- 体型：精瘦但肌肉线条分明
- 发型：黑色短发，略带凌乱
- 特殊特征：左眼为电子义眼，在黑暗中会发出微弱的蓝光

性格特点：
- 冷静沉着，即使在危急时刻也能保持理智
- 对陌生人保持距离，但对信任的人会展现温柔的一面
- 有着强烈的正义感，但行事方式往往游走于灰色地带

背景故事：
曾是一名精英特种兵，在一次任务中失去了左眼和左臂。拒绝接受公司的控制，选择成为独立雇佣兵。一直在暗中调查当年任务背后的真相。

能力特长：
- 精通各种 firearms 和近战格斗
- 顶尖的黑客技术，可以入侵大多数电子系统
- 拥有特殊的"电子视觉"，可以看到常人无法察觉的数字痕迹`,

      scene: `【场景描述】

场景：雨夜街头追逐

视觉元素：
霓虹灯在雨水中折射出迷幻的色彩，巨大的全息广告牌在头顶闪烁。潮湿的地面反射着五彩斑斓的光芒，蒸汽从地下管道中缓缓升起。

氛围营造：
紧张而神秘的氛围，雨声掩盖了脚步声，给追逐增添了一份不确定性。远处传来飞行汽车的嗡鸣声，偶尔有警笛声划破夜空。

角色动作：
主角在狭窄的巷道中快速穿行，时而翻越障碍物，时而贴墙隐蔽。追兵的光束在雨幕中扫射，形成一道道危险的光柱。

镜头建议：
1. 广角镜头：展示整个城市夜景
2. 跟随镜头：紧跟主角的奔跑动作
3. 低角度镜头：强调主角的决绝表情`,
    }

    return templates[options?.type || 'scene'] || '生成内容...'
  }

  async generateImage(_prompt: string, options?: Record<string, any>): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Return a placeholder image URL
    const styles: Record<string, string> = {
      cinematic: 'https://images.unsplash.com/photo-1515630278258-407f66498911?w=1024&h=576&fit=crop',
      anime: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1024&h=576&fit=crop',
      realistic: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1024&h=576&fit=crop',
      cyberpunk: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=1024&h=576&fit=crop',
    }

    return styles[options?.style || 'cinematic'] || styles.cinematic
  }

  async generateVideo(_imageUrl: string, _prompt: string, _options?: Record<string, any>): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // Return a placeholder video URL
    return 'https://example.com/video.mp4'
  }

  async generateAudio(_text: string, _voice?: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return 'https://example.com/audio.mp3'
  }
}

// Task Manager for generation queue
class GenerationTaskManager {
  private tasks: GenerationTask[] = []
  private listeners: ((tasks: GenerationTask[]) => void)[] = []

  addTask(task: GenerationTask): void {
    this.tasks.push(task)
    this.notifyListeners()
    this.processTask(task)
  }

  private async processTask(task: GenerationTask): Promise<void> {
    const aiService = new MockAIService()

    this.updateTask(task.id, { status: 'processing', progress: 10 })

    try {
      switch (task.type) {
        case 'text':
          await aiService.generateText(task.prompt)
          break
        case 'image':
          await aiService.generateImage(task.prompt)
          break
        case 'video':
          await aiService.generateVideo('', task.prompt)
          break
        case 'audio':
          await aiService.generateAudio(task.prompt)
          break
      }

      // Simulate progress
      for (let i = 20; i <= 100; i += 20) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        this.updateTask(task.id, { progress: i })
      }

      this.updateTask(task.id, {
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
      })
    } catch (error) {
      this.updateTask(task.id, { status: 'failed', progress: 0 })
    }
  }

  updateTask(id: string, updates: Partial<GenerationTask>): void {
    const task = this.tasks.find((t) => t.id === id)
    if (task) {
      Object.assign(task, updates)
      this.notifyListeners()
    }
  }

  getTasks(): GenerationTask[] {
    return [...this.tasks]
  }

  subscribe(listener: (tasks: GenerationTask[]) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.tasks]))
  }
}

// Export singleton instances
export const aiService = new MockAIService()
export const taskManager = new GenerationTaskManager()

// Helper functions for common operations
export async function generateWorldBook(description: string): Promise<string> {
  return aiService.generateText(description, { type: 'world' })
}

export async function generateCharacter(name: string, description: string): Promise<string> {
  return aiService.generateText(description, { type: 'character', name })
}

export async function generateSceneDescription(scene: string): Promise<string> {
  return aiService.generateText(scene, { type: 'scene' })
}

export async function generateKeyframe(prompt: string, style: string): Promise<string> {
  return aiService.generateImage(prompt, { style })
}

export async function generateVideoFromImage(imageUrl: string, prompt: string, duration: number): Promise<string> {
  return aiService.generateVideo(imageUrl, prompt, { duration })
}

export function createGenerationTask(
  type: GenerationTask['type'],
  prompt: string
): GenerationTask {
  const task: GenerationTask = {
    id: `task-${Date.now()}`,
    type,
    status: 'pending',
    prompt,
    progress: 0,
    createdAt: new Date().toISOString(),
  }

  taskManager.addTask(task)
  return task
}
