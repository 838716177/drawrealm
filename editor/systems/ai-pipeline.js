/**
 * 绘境Online - AI视频生成管线
 * 差异化特性：Seedance 2.0 集成、批量生成、进度追踪、选项注入
 */
class AIVideoPipeline {
    constructor() {
        this.queue = [];
        this.activeJobs = new Map();
        this.maxConcurrent = 3;
        this.defaultConfig = {
            model: 'seedance2',
            resolution: '1920x1080',
            fps: 30,
            duration: 5,
            motionStrength: 0.5,
            style: 'cinematic',
            cameraMotions: ['push', 'pan'],
            styleConsistency: 90,
            characterConsistency: 85
        };
        this.apiEndpoint = this._getApiEndpoint();
        this._changeListeners = [];
        this._loadQueue();
    }

    onChange(fn) {
        this._changeListeners.push(fn);
        return () => {
            const idx = this._changeListeners.indexOf(fn);
            if (idx >= 0) this._changeListeners.splice(idx, 1);
        };
    }

    _notifyChange(event, data) {
        this._changeListeners.forEach(fn => fn(event, data));
    }

    _getApiEndpoint() {
        return localStorage.getItem('huijing_api_endpoint') || 'https://api.seedance.ai/v2';
    }

    setApiEndpoint(url) {
        this.apiEndpoint = url;
        localStorage.setItem('huijing_api_endpoint', url);
    }

    _loadQueue() {
        const saved = localStorage.getItem('huijing_video_queue');
        if (saved) {
            try {
                this.queue = JSON.parse(saved);
            } catch (e) {
                this.queue = [];
            }
        }
    }

    _persistQueue() {
        localStorage.setItem('huijing_video_queue', JSON.stringify(this.queue));
    }

    // ==================== 管线配置 ====================

    getConfig() {
        return { ...this.defaultConfig };
    }

    updateConfig(config) {
        Object.assign(this.defaultConfig, config);
        this._notifyChange('config:updated', this.defaultConfig);
    }

    // ==================== 作业管理 ====================

    createJob(params) {
        const job = {
            id: `job_${Date.now()}`,
            name: params.name || '未命名作业',
            type: 'video',
            prompt: params.prompt || '',
            sceneDescription: params.sceneDescription || '',
            characterIds: params.characterIds || [],
            worldId: params.worldId || null,
            nodeId: params.nodeId || null,
            config: { ...this.defaultConfig, ...(params.config || {}) },
            status: 'pending',
            progress: 0,
            result: null,
            error: null,
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null
        };
        return job;
    }

    async submitJob(job) {
        this.queue.push(job);
        this._persistQueue();
        this._notifyChange('job:queued', job);
        this._processQueue();
        return job;
    }

    async submitBatch(jobs) {
        jobs.forEach(job => {
            this.queue.push(job);
            this._notifyChange('job:queued', job);
        });
        this._persistQueue();
        this._processQueue();
        return jobs;
    }

    async _processQueue() {
        const pending = this.queue.filter(j => j.status === 'pending');
        const activeCount = this.queue.filter(j => j.status === 'processing').length;
        const slots = this.maxConcurrent - activeCount;
        if (slots <= 0 || pending.length === 0) return;
        const toProcess = pending.slice(0, slots);
        for (const job of toProcess) {
            this._executeJob(job);
        }
    }

    async _executeJob(job) {
        job.status = 'processing';
        job.startedAt = new Date().toISOString();
        this._persistQueue();
        this._notifyChange('job:started', job);
        try {
            const result = await this._generateVideo(job);
            job.status = 'completed';
            job.progress = 100;
            job.result = result;
            job.completedAt = new Date().toISOString();
            this._notifyChange('job:completed', job);
        } catch (error) {
            job.status = 'failed';
            job.error = error.message;
            this._notifyChange('job:failed', job);
        }
        this._persistQueue();
        this._processQueue();
    }

    async _generateVideo(job) {
        await this._simulateProgress(job, 0, 30, '正在分析场景描述...');
        await this._simulateProgress(job, 30, 60, '正在生成关键帧...');
        await this._simulateProgress(job, 60, 85, '正在生成视频...');
        await this._simulateProgress(job, 85, 100, '正在注入选项...');
        return {
            id: `vid_${Date.now()}`,
            url: null,
            thumbnailGradient: this._randomGradient(),
            duration: job.config.duration,
            resolution: job.config.resolution,
            generatedAt: new Date().toISOString()
        };
    }

    async _simulateProgress(job, from, to, message) {
        const steps = 10;
        const stepDelay = 300;
        for (let i = 0; i <= steps; i++) {
            job.progress = from + Math.round((to - from) * (i / steps));
            job.currentStep = message;
            this._notifyChange('job:progress', job);
            await this._delay(stepDelay);
        }
    }

    async callSeedanceAPI(prompt, config) {
        const endpoint = `${this.apiEndpoint}/generate`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('huijing_api_key') || ''}` },
            body: JSON.stringify({ prompt, config })
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    }

    // ==================== 队列管理 ====================

    getQueue() {
        return [...this.queue];
    }

    getPendingJobs() {
        return this.queue.filter(j => j.status === 'pending');
    }

    getActiveJobs() {
        return this.queue.filter(j => j.status === 'processing');
    }

    getCompletedJobs() {
        return this.queue.filter(j => j.status === 'completed');
    }

    getFailedJobs() {
        return this.queue.filter(j => j.status === 'failed');
    }

    retryJob(jobId) {
        const job = this.queue.find(j => j.id === jobId);
        if (!job || job.status !== 'failed') return null;
        job.status = 'pending';
        job.error = null;
        this._persistQueue();
        this._notifyChange('job:retried', job);
        this._processQueue();
        return job;
    }

    cancelJob(jobId) {
        const job = this.queue.find(j => j.id === jobId);
        if (!job || (job.status !== 'pending' && job.status !== 'processing')) return null;
        job.status = 'cancelled';
        this._persistQueue();
        this._notifyChange('job:cancelled', job);
        return job;
    }

    removeJob(jobId) {
        const idx = this.queue.findIndex(j => j.id === jobId);
        if (idx < 0) return null;
        const removed = this.queue.splice(idx, 1)[0];
        this._persistQueue();
        this._notifyChange('job:removed', removed);
        return removed;
    }

    clearCompleted() {
        this.queue = this.queue.filter(j => j.status !== 'completed' && j.status !== 'failed' && j.status !== 'cancelled');
        this._persistQueue();
        this._notifyChange('queue:cleared', null);
    }

    clearAll() {
        this.queue = [];
        this._persistQueue();
        this._notifyChange('queue:cleared', null);
    }

    // ==================== 进度统计 ====================

    getStats() {
        return {
            total: this.queue.length,
            pending: this.getPendingJobs().length,
            processing: this.getActiveJobs().length,
            completed: this.getCompletedJobs().length,
            failed: this.getFailedJobs().length,
            overallProgress: this._calculateOverallProgress()
        };
    }

    _calculateOverallProgress() {
        const all = this.queue.filter(j => j.status !== 'cancelled');
        if (all.length === 0) return 0;
        return Math.round(all.reduce((sum, j) => sum + (j.progress || 0), 0) / all.length);
    }

    // ==================== 工具方法 ====================

    _randomGradient() {
        const grads = [
            'linear-gradient(135deg, #1a1a2e, #16213e)',
            'linear-gradient(135deg, #2d1b69, #0f3460)',
            'linear-gradient(135deg, #1e3a5f, #2d5a87)'
        ];
        return grads[Math.floor(Math.random() * grads.length)];
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.AIVideoPipeline = AIVideoPipeline;
