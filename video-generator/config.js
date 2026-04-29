/**
 * 绘境 - 全局配置文件
 * 
 * 使用方式：
 * 1. 纯前端演示：直接填写 API Key（仅本地演示，生产环境请走后端）
 * 2. 接入后端：将 baseUrl 改为你的后端地址，留空 apiKey（由后端管理）
 */

const CONFIG = {
    // ==================== 模式切换 ====================
    // 'frontend' = 前端直连大模型API
    // 'backend'  = 调用自己的后端服务
    mode: 'frontend',

    // ==================== 后端配置（mode='backend'时使用）====================
    backend: {
        baseUrl: 'http://localhost:3000/api',
    },

    // ==================== 前端直连配置（mode='frontend'时使用）====================
    frontend: {
        // 图片生成服务商
        imageProvider: 'openai', // 'openai' | 'stability' | 'replicate' | 'pollinations'
        
        // 视频生成服务商
        videoProvider: 'replicate', // 'replicate' | 'runway' | 'pika' | 'kling'
        
        // 文本/提示词优化服务商
        textProvider: 'openai', // 'openai' | 'anthropic' | 'google'

        // API Keys（生产环境请走后端，不要暴露在前端）
        apiKeys: {
            openai: '',      // OpenAI API Key: sk-...
            replicate: '',   // Replicate API Token: r8_...
            stability: '',   // Stability AI Key
            anthropic: '',   // Claude API Key
            google: '',      // Gemini API Key
        },

        // 模型配置
        models: {
            // 图片生成模型
            image: {
                openai: 'dall-e-3',
                stability: 'stable-diffusion-xl-1024-v1-0',
                replicate: 'black-forest-labs/flux-schnell',
                pollinations: 'flux', // 免费无需Key
            },
            // 视频生成模型
            video: {
                replicate: 'stability-ai/stable-video-diffusion',
                runway: 'gen-3',
                pika: '1.5',
                kling: 'kling-v1',
            },
            // 文本优化模型
            text: {
                openai: 'gpt-4o-mini',
                anthropic: 'claude-3-haiku-20240307',
                google: 'gemini-1.5-flash',
            }
        },

        // 生成参数
        generation: {
            image: {
                size: '1024x1024',     // OpenAI: 1024x1024, 1792x1024, 1024x1792
                quality: 'standard',   // 'standard' | 'hd'
                style: 'vivid',        // 'vivid' | 'natural'
                n: 4,                  // 生成数量（部分服务商不支持批量）
            },
            video: {
                duration: 5,           // 秒
                motion: 'medium',      // 'low' | 'medium' | 'high'
                fps: 24,
            }
        }
    },

    // ==================== 功能开关 ====================
    features: {
        aiOptimize: true,      // AI提示词优化
        assetManagement: true, // 素材管理
        communityPublish: true, // 发布到社区
        autoSave: true,        // 自动保存作品到localStorage
    },

    // ==================== 调试配置 ====================
    debug: {
        mockMode: false,       // true = 使用模拟数据，不调用真实API
        logApiCalls: true,     // 打印API调用日志
        timeout: 60000,        // API超时时间（毫秒）
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
