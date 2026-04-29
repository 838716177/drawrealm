/**
 * 绘境 - API 服务层
 * 统一封装图片生成、视频生成、提示词优化等能力
 * 支持前端直连 / 后端代理 两种模式
 */

class ApiService {
    constructor() {
        this.config = CONFIG;
        this.isMockMode = this.config.debug.mockMode;
        this.pendingRequests = new Map();
    }

    // ==================== 工具方法 ====================

    log(...args) {
        if (this.config.debug.logApiCalls) {
            console.log('[API]', ...args);
        }
    }

    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.debug.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请稍后重试');
            }
            throw error;
        }
    }

    getHeaders(provider) {
        const keys = this.config.frontend.apiKeys;
        const headers = {
            'Content-Type': 'application/json',
        };

        switch (provider) {
            case 'openai':
                headers['Authorization'] = `Bearer ${keys.openai}`;
                break;
            case 'replicate':
                headers['Authorization'] = `Token ${keys.replicate}`;
                break;
            case 'stability':
                headers['Authorization'] = `Bearer ${keys.stability}`;
                break;
            case 'anthropic':
                headers['x-api-key'] = keys.anthropic;
                headers['anthropic-version'] = '2023-06-01';
                break;
            case 'google':
                // Google使用URL参数
                break;
        }

        return headers;
    }

    checkApiKey(provider) {
        if (this.isMockMode) return true;
        if (this.config.mode === 'backend') return true;
        
        const key = this.config.frontend.apiKeys[provider];
        if (!key || key.trim() === '') {
            throw new Error(`请先配置 ${provider} 的 API Key`);
        }
        return true;
    }

    // ==================== 模拟数据（用于演示）====================

    mockDelay(ms = 2000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async mockImageGeneration(prompt, count = 4) {
        await this.mockDelay(2000);
        const gradients = [
            'linear-gradient(135deg, #1a1a2e, #16213e)',
            'linear-gradient(135deg, #2d1b69, #0f3460)',
            'linear-gradient(135deg, #1e3a5f, #2d5a87)',
            'linear-gradient(135deg, #3d1f00, #8b4513)',
        ];
        return gradients.slice(0, count).map((gradient, i) => ({
            id: `mock_img_${Date.now()}_${i}`,
            url: this.createPlaceholderImage(gradient),
            prompt: `${prompt} - 版本 ${i + 1}`,
            text: this.generateSceneText(prompt, i),
            gradient,
        }));
    }

    async mockVideoGeneration(imageUrl) {
        await this.mockDelay(3000);
        return {
            id: `mock_video_${Date.now()}`,
            url: null, // 模拟视频没有真实URL
            status: 'completed',
            message: '视频生成完成（演示模式）',
        };
    }

    async mockPromptOptimization(prompt) {
        await this.mockDelay(1000);
        return `优化后的提示词：${prompt}，高质量，电影级画面，8K分辨率，精细细节，专业摄影，戏剧性光影，史诗级构图`;
    }

    createPlaceholderImage(gradient) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        const colors = gradient.match(/#[a-fA-F0-9]{6}/g) || ['#1a1a2e', '#16213e'];
        const grd = ctx.createLinearGradient(0, 0, 640, 360);
        grd.addColorStop(0, colors[0]);
        grd.addColorStop(1, colors[1]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 640, 360);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 640;
            const y = Math.random() * 360;
            const r = Math.random() * 100 + 50;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas.toDataURL('image/png');
    }

    generateSceneText(prompt, variant) {
        const texts = [
            `场景展开：${prompt}。画面中光影交错，氛围渐入佳境。`,
            `镜头推进：${prompt}。细节逐渐清晰，故事缓缓展开。`,
            `全景呈现：${prompt}。宏大场面一览无遗，震撼人心。`,
            `特写切入：${prompt}。聚焦于核心元素，情感张力十足。`,
        ];
        return texts[variant] || texts[0];
    }

    // ==================== 1. 提示词AI优化 ====================

    /**
     * AI优化用户输入的提示词
     * @param {string} prompt - 用户原始输入
     * @param {string} type - 优化类型: 'image' | 'video' | 'general'
     * @returns {Promise<string>} 优化后的提示词
     */
    async optimizePrompt(prompt, type = 'video') {
        this.log('优化提示词:', prompt, '类型:', type);

        if (this.isMockMode) {
            return this.mockPromptOptimization(prompt);
        }

        if (this.config.mode === 'backend') {
            return this.callBackend('/optimize-prompt', { prompt, type });
        }

        const provider = this.config.frontend.textProvider;
        this.checkApiKey(provider);

        const systemPrompt = type === 'video' 
            ? '你是一位专业的AI视频生成提示词工程师。请将用户的描述优化为适合视频生成模型的英文提示词。要求：1) 使用英文输出；2) 包含画面主体、动作、场景、光影、风格、镜头语言；3) 控制在200词以内；4) 不要解释，只输出优化后的提示词。'
            : '你是一位专业的AI绘画提示词工程师。请将用户的描述优化为适合图像生成模型的英文提示词。要求：1) 使用英文输出；2) 包含画面主体、场景、风格、光影、细节；3) 控制在100词以内；4) 不要解释，只输出优化后的提示词。';

        switch (provider) {
            case 'openai':
                return this.optimizeWithOpenAI(prompt, systemPrompt);
            case 'anthropic':
                return this.optimizeWithAnthropic(prompt, systemPrompt);
            case 'google':
                return this.optimizeWithGoogle(prompt, systemPrompt);
            default:
                throw new Error(`不支持的文本优化服务商: ${provider}`);
        }
    }

    async optimizeWithOpenAI(prompt, systemPrompt) {
        const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: this.getHeaders('openai'),
            body: JSON.stringify({
                model: this.config.frontend.models.text.openai,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `OpenAI API错误: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    async optimizeWithAnthropic(prompt, systemPrompt) {
        const response = await this.fetchWithTimeout('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: this.getHeaders('anthropic'),
            body: JSON.stringify({
                model: this.config.frontend.models.text.anthropic,
                max_tokens: 500,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Claude API错误: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text.trim();
    }

    async optimizeWithGoogle(prompt, systemPrompt) {
        const apiKey = this.config.frontend.apiKeys.google;
        const model = this.config.frontend.models.text.google;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await this.fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: systemPrompt },
                        { text: prompt }
                    ]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error?.message || `Google API错误: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    // ==================== 2. 图片生成 ====================

    /**
     * 生成图片
     * @param {string} prompt - 提示词（英文）
     * @param {Object} options - 额外选项
     * @returns {Promise<Array>} 图片URL数组
     */
    async generateImages(prompt, options = {}) {
        this.log('生成图片:', prompt);

        if (this.isMockMode) {
            return this.mockImageGeneration(prompt, options.count || 4);
        }

        if (this.config.mode === 'backend') {
            return this.callBackend('/generate-images', { prompt, ...options });
        }

        const provider = this.config.frontend.imageProvider;

        switch (provider) {
            case 'openai':
                return this.generateImagesWithOpenAI(prompt, options);
            case 'replicate':
                return this.generateImagesWithReplicate(prompt, options);
            case 'stability':
                return this.generateImagesWithStability(prompt, options);
            case 'pollinations':
                return this.generateImagesWithPollinations(prompt, options);
            default:
                throw new Error(`不支持的图片生成服务商: ${provider}`);
        }
    }

    async generateImagesWithOpenAI(prompt, options = {}) {
        this.checkApiKey('openai');
        const config = this.config.frontend.generation.image;
        const count = Math.min(options.count || config.n, 4); // DALL-E 3 一次只能生成1张

        const images = [];
        
        // DALL-E 3 一次只能生成1张，需要多次调用
        for (let i = 0; i < count; i++) {
            const response = await this.fetchWithTimeout('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: this.getHeaders('openai'),
                body: JSON.stringify({
                    model: this.config.frontend.models.image.openai,
                    prompt: prompt,
                    n: 1,
                    size: options.size || config.size,
                    quality: options.quality || config.quality,
                    style: options.style || config.style,
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error?.message || `OpenAI图片生成错误: ${response.status}`);
            }

            const data = await response.json();
            images.push({
                id: `openai_${Date.now()}_${i}`,
                url: data.data[0].url,
                prompt: prompt,
                text: this.generateSceneText(prompt, i),
                revised_prompt: data.data[0].revised_prompt,
            });
        }

        return images;
    }

    async generateImagesWithReplicate(prompt, options = {}) {
        this.checkApiKey('replicate');
        const model = this.config.frontend.models.image.replicate;

        // Replicate 是异步的，需要先创建 prediction
        const response = await this.fetchWithTimeout('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: this.getHeaders('replicate'),
            body: JSON.stringify({
                version: model,
                input: {
                    prompt: prompt,
                    num_outputs: options.count || 4,
                    aspect_ratio: '16:9',
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Replicate API错误: ${response.status}`);
        }

        const prediction = await response.json();
        
        // 轮询等待结果
        const result = await this.pollReplicatePrediction(prediction.id);
        
        return result.output.map((url, i) => ({
            id: `replicate_${Date.now()}_${i}`,
            url: url,
            prompt: prompt,
            text: this.generateSceneText(prompt, i),
        }));
    }

    async generateImagesWithStability(prompt, options = {}) {
        this.checkApiKey('stability');
        
        const response = await this.fetchWithTimeout('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: this.getHeaders('stability'),
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                cfg_scale: 7,
                samples: options.count || 1,
                steps: 30,
                width: 1024,
                height: 1024,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Stability API错误: ${response.status}`);
        }

        const data = await response.json();
        return data.artifacts.map((artifact, i) => ({
            id: `stability_${Date.now()}_${i}`,
            url: `data:image/png;base64,${artifact.base64}`,
            prompt: prompt,
            text: this.generateSceneText(prompt, i),
        }));
    }

    async generateImagesWithPollinations(prompt, options = {}) {
        // Pollinations.ai 是免费的，不需要 API Key
        const count = options.count || 4;
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Date.now();

        return Array.from({ length: count }, (_, i) => ({
            id: `pollinations_${Date.now()}_${i}`,
            url: `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed + i}&width=1024&height=1024&nologo=true`,
            prompt: prompt,
            text: this.generateSceneText(prompt, i),
        }));
    }

    // ==================== 3. 视频生成 ====================

    /**
     * 生成视频
     * @param {string} imageUrl - 参考图片URL
     * @param {Object} options - 配置选项
     * @returns {Promise<Object>} 视频生成结果
     */
    async generateVideo(imageUrl, options = {}) {
        this.log('生成视频, 图片:', imageUrl);

        if (this.isMockMode) {
            return this.mockVideoGeneration(imageUrl);
        }

        if (this.config.mode === 'backend') {
            return this.callBackend('/generate-video', { imageUrl, ...options });
        }

        const provider = this.config.frontend.videoProvider;

        switch (provider) {
            case 'replicate':
                return this.generateVideoWithReplicate(imageUrl, options);
            case 'runway':
                return this.generateVideoWithRunway(imageUrl, options);
            default:
                throw new Error(`不支持的视频生成服务商: ${provider}`);
        }
    }

    async generateVideoWithReplicate(imageUrl, options = {}) {
        this.checkApiKey('replicate');
        const model = this.config.frontend.models.video.replicate;

        const response = await this.fetchWithTimeout('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: this.getHeaders('replicate'),
            body: JSON.stringify({
                version: model,
                input: {
                    image: imageUrl,
                    motion_bucket_id: options.motion === 'high' ? 255 : options.motion === 'low' ? 50 : 127,
                    fps: options.fps || this.config.frontend.generation.video.fps,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Replicate视频API错误: ${response.status}`);
        }

        const prediction = await response.json();
        
        // 返回预测ID，前端需要轮询
        return {
            id: prediction.id,
            status: 'processing',
            provider: 'replicate',
            predictionId: prediction.id,
        };
    }

    async generateVideoWithRunway(imageUrl, options = {}) {
        this.checkApiKey('runway');
        // Runway API 需要申请，这里预留接口
        throw new Error('Runway API 需要单独申请访问权限');
    }

    // ==================== 4. 轮询任务状态 ====================

    /**
     * 轮询 Replicate 预测结果
     */
    async pollReplicatePrediction(predictionId, onProgress) {
        const maxAttempts = 60; // 最多轮询60次
        const interval = 2000; // 每2秒轮询一次

        for (let i = 0; i < maxAttempts; i++) {
            const response = await this.fetchWithTimeout(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                { headers: this.getHeaders('replicate') }
            );

            if (!response.ok) {
                throw new Error('查询预测状态失败');
            }

            const data = await response.json();
            this.log('预测状态:', data.status);

            if (data.status === 'succeeded') {
                return data;
            }

            if (data.status === 'failed' || data.status === 'canceled') {
                throw new Error(data.error || '生成失败');
            }

            if (onProgress) {
                onProgress({
                    status: data.status,
                    progress: data.progress || (i / maxAttempts),
                    logs: data.logs,
                });
            }

            await this.mockDelay(interval);
        }

        throw new Error('生成超时，请稍后查看结果');
    }

    /**
     * 查询视频生成状态
     */
    async checkVideoStatus(taskId, provider) {
        if (this.isMockMode) {
            await this.mockDelay(1000);
            return { status: 'completed', url: null };
        }

        if (provider === 'replicate') {
            const result = await this.pollReplicatePrediction(taskId);
            return {
                status: 'completed',
                url: result.output,
                id: taskId,
            };
        }

        throw new Error(`不支持的状态查询: ${provider}`);
    }

    // ==================== 5. 后端代理模式 ====================

    async callBackend(endpoint, body) {
        const baseUrl = this.config.backend.baseUrl;
        const response = await this.fetchWithTimeout(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `后端错误: ${response.status}`);
        }

        return response.json();
    }

    // ==================== 6. 实用工具 ====================

    /**
     * 将图片URL转换为Base64（用于某些API需要上传图片的场景）
     */
    async urlToBase64(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * 取消进行中的请求
     */
    abortRequest(requestId) {
        const controller = this.pendingRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.pendingRequests.delete(requestId);
        }
    }
}

// 创建全局实例
const apiService = new ApiService();
