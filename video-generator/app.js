class VideoGeneratorApp {
    constructor() {
        this.selectedAssets = [];
        this.generatedImages = [];
        this.selectedImage = null;
        this.isGenerating = false;
        this.isOptimizing = false;
        this.currentFilter = 'all';
        this.optimizedPrompt = null;
        this.api = apiService;
        this.works = this.loadWorks();
        this.init();
    }

    init() {
        this.bindEvents();
        this.initWorksFilter();
        this.renderWorks();
        this.loadConfig();
    }

    // ==================== 配置管理 ====================

    loadConfig() {
        const saved = localStorage.getItem('huijing_config');
        if (saved) {
            try {
                const cfg = JSON.parse(saved);
                Object.assign(CONFIG.frontend.apiKeys, cfg.apiKeys || {});
                CONFIG.frontend.imageProvider = cfg.imageProvider || 'pollinations';
                CONFIG.frontend.videoProvider = cfg.videoProvider || 'replicate';
                CONFIG.frontend.textProvider = cfg.textProvider || 'openai';
                CONFIG.mode = cfg.mode || 'frontend';
            } catch (e) {
                console.warn('配置加载失败', e);
            }
        }
    }

    saveConfig() {
        const cfg = {
            apiKeys: CONFIG.frontend.apiKeys,
            imageProvider: CONFIG.frontend.imageProvider,
            videoProvider: CONFIG.frontend.videoProvider,
            textProvider: CONFIG.frontend.textProvider,
            mode: CONFIG.mode,
        };
        localStorage.setItem('huijing_config', JSON.stringify(cfg));
    }

    openConfigModal() {
        const modal = document.getElementById('configModal');
        document.getElementById('configMode').value = CONFIG.mode;
        document.getElementById('configImageProvider').value = CONFIG.frontend.imageProvider;
        document.getElementById('configVideoProvider').value = CONFIG.frontend.videoProvider;
        document.getElementById('configTextProvider').value = CONFIG.frontend.textProvider;
        document.getElementById('configOpenaiKey').value = CONFIG.frontend.apiKeys.openai || '';
        document.getElementById('configReplicateKey').value = CONFIG.frontend.apiKeys.replicate || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeConfigModal() {
        document.getElementById('configModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    resetConfig() {
        CONFIG.mode = 'frontend';
        CONFIG.frontend.imageProvider = 'pollinations';
        CONFIG.frontend.videoProvider = 'replicate';
        CONFIG.frontend.textProvider = 'openai';
        CONFIG.frontend.apiKeys = { openai: '', replicate: '', stability: '', anthropic: '', google: '' };
        localStorage.removeItem('huijing_config');
        this.loadConfig();
        this.closeConfigModal();
        this.showToast('配置已重置');
    }

    // ==================== 事件绑定 ====================

    bindEvents() {
        // 生成按钮
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.startGeneration());
        }

        // AI优化按钮
        const aiOptimizeBtn = document.getElementById('aiOptimizeBtn');
        if (aiOptimizeBtn) {
            aiOptimizeBtn.addEventListener('click', () => this.optimizePrompt());
        }

        const optimizeBtn = document.getElementById('optimizeBtn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => this.optimizePrompt());
        }

        // 快捷素材选择
        document.querySelectorAll('.quick-asset-item:not(.add-new)').forEach(item => {
            item.addEventListener('click', (e) => this.toggleQuickAsset(e.currentTarget));
        });

        // 新建按钮
        const createNewBtn = document.getElementById('createNewBtn');
        if (createNewBtn) {
            createNewBtn.addEventListener('click', () => {
                document.getElementById('promptInput').focus();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // 管理素材
        const manageAssetsBtn = document.getElementById('manageAssetsBtn');
        if (manageAssetsBtn) {
            manageAssetsBtn.addEventListener('click', () => {
                this.showToast('素材管理功能开发中...');
            });
        }

        // 重新生成
        const regenerateBtn = document.getElementById('regenerateBtn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerate());
        }

        // 修改描述
        const editPromptBtn = document.getElementById('editPromptBtn');
        if (editPromptBtn) {
            editPromptBtn.addEventListener('click', () => this.editPrompt());
        }

        // 生成视频
        const generateVideoBtn = document.getElementById('generateVideoBtn');
        if (generateVideoBtn) {
            generateVideoBtn.addEventListener('click', () => this.startVideoGeneration());
        }

        // 作品筛选
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.filterWorks(e.target.dataset.filter));
        });

        // 视图切换
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }

        // 弹窗关闭
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal('workDetailModal'));
        document.getElementById('imageModalClose')?.addEventListener('click', () => this.closeModal('imageEditModal'));
        document.getElementById('configModalClose')?.addEventListener('click', () => this.closeConfigModal());
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                e.target.parentElement.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // 图片编辑确认
        document.getElementById('confirmBtn')?.addEventListener('click', () => this.confirmImage());
        document.getElementById('variantBtn')?.addEventListener('click', () => this.generateVariant());

        // 作品详情操作
        document.getElementById('detailEditBtn')?.addEventListener('click', () => this.showToast('编辑功能开发中...'));
        document.getElementById('detailRegenerateBtn')?.addEventListener('click', () => this.showToast('重新生成功能开发中...'));
        document.getElementById('detailPublishBtn')?.addEventListener('click', () => this.publishWork());

        // 配置弹窗
        document.getElementById('configSaveBtn')?.addEventListener('click', () => this.saveConfigFromModal());
        document.getElementById('configResetBtn')?.addEventListener('click', () => this.resetConfig());

        // 回车生成
        const textarea = document.getElementById('promptInput');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    this.startGeneration();
                }
            });
        }

        // Logo点击打开配置
        document.querySelector('.logo')?.addEventListener('dblclick', () => {
            this.openConfigModal();
        });
    }

    // ==================== AI提示词优化 ====================

    async optimizePrompt() {
        const textarea = document.getElementById('promptInput');
        const prompt = textarea.value.trim();

        if (!prompt) {
            this.showToast('请先输入视频描述');
            textarea.focus();
            return;
        }

        if (this.isOptimizing) return;
        this.isOptimizing = true;

        const btn = document.getElementById('aiOptimizeBtn');
        const originalHtml = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:12px;height:12px;border-width:2px;"></div><span>优化中...</span>';

        try {
            const optimized = await this.api.optimizePrompt(prompt, 'video');
            this.optimizedPrompt = optimized;

            // 显示优化后的提示词
            textarea.value = optimized;
            textarea.parentElement.classList.add('prompt-optimized');

            this.showToast('提示词已AI优化 ✨');

            // 3秒后移除高亮
            setTimeout(() => {
                textarea.parentElement.classList.remove('prompt-optimized');
            }, 3000);
        } catch (error) {
            console.error('优化失败:', error);
            this.showToast('优化失败: ' + error.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
            this.isOptimizing = false;
        }
    }

    // ==================== 图片生成 ====================

    async startGeneration() {
        const textarea = document.getElementById('promptInput');
        const prompt = textarea.value.trim();

        if (!prompt) {
            this.showToast('请输入视频描述');
            textarea.focus();
            return;
        }

        if (this.isGenerating) return;
        this.isGenerating = true;

        const btn = document.getElementById('generateBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div><span>生成中...</span>';

        // 隐藏作品区，显示生成区
        const generationSection = document.getElementById('generationSection');
        generationSection.classList.add('active');
        generationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 重置视频区
        document.getElementById('videoSection').classList.remove('active');

        // 设置加载状态
        this.setImageGridLoading();

        try {
            // 调用API生成图片
            const images = await this.api.generateImages(prompt, { count: 4 });
            this.generatedImages = images;
            this.renderGeneratedImages(images);
            this.showToast('图片生成完成！请选择一张');
        } catch (error) {
            console.error('生成失败:', error);
            this.showToast('生成失败: ' + error.message);
            // 回退到模拟数据
            const mockImages = await this.api.mockImageGeneration(prompt, 4);
            this.generatedImages = mockImages;
            this.renderGeneratedImages(mockImages);
            this.showToast('已使用演示模式');
        }

        btn.disabled = false;
        btn.innerHTML = '<span>生成</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        this.isGenerating = false;
    }

    setImageGridLoading() {
        const grid = document.getElementById('imageGrid');
        const cards = grid.querySelectorAll('.image-card');
        cards.forEach(card => {
            card.classList.add('generating');
            card.innerHTML = '<div class="image-placeholder"><div class="spinner"></div></div>';
            card.classList.remove('selected');
        });
    }

    renderGeneratedImages(images) {
        const grid = document.getElementById('imageGrid');
        const cards = grid.querySelectorAll('.image-card');

        cards.forEach((card, index) => {
            card.classList.remove('generating');
            if (images[index]) {
                const data = images[index];
                // 使用真实图片URL或渐变占位
                if (data.url && data.url.startsWith('http')) {
                    card.innerHTML = `<img src="${data.url}" alt="版本 ${index + 1}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\' style=\\'background:${data.gradient || 'var(--bg-tertiary)'}\\'><div style=\\'color:white;font-size:13px;opacity:0.8\\'>版本 ${index + 1}</div></div>'">`;
                } else {
                    card.innerHTML = `<div class="image-placeholder" style="background: ${data.gradient || 'var(--bg-tertiary)'};"><div style="color: white; font-size: 13px; opacity: 0.8;">版本 ${index + 1}</div></div>`;
                }
                card.onclick = () => this.selectImage(index);
            }
        });
    }

    // ==================== 图片选择与编辑 ====================

    selectImage(index) {
        const cards = document.querySelectorAll('.image-card');
        cards.forEach(c => c.classList.remove('selected'));
        cards[index].classList.add('selected');

        this.selectedImage = this.generatedImages[index];
        this.openImageEditModal(index);
    }

    openImageEditModal(index) {
        const modal = document.getElementById('imageEditModal');
        const image = document.getElementById('editImage');
        const textarea = document.getElementById('editTextarea');
        const data = this.generatedImages[index];

        if (data.url && data.url.startsWith('http')) {
            image.src = data.url;
        } else {
            image.src = data.url || this.api.createPlaceholderImage(data.gradient);
        }
        textarea.value = data.text || '';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    confirmImage() {
        const textarea = document.getElementById('editTextarea');
        if (this.selectedImage) {
            this.selectedImage.text = textarea.value;
        }
        this.closeModal('imageEditModal');
        this.showVideoSection();
    }

    generateVariant() {
        this.showToast('正在生成变体...');
        setTimeout(() => {
            this.showToast('变体生成完成！');
        }, 1500);
    }

    showVideoSection() {
        const videoSection = document.getElementById('videoSection');
        const selectedImageEl = document.getElementById('selectedImage');

        videoSection.classList.add('active');

        // 显示选中的图片
        if (this.selectedImage.url && this.selectedImage.url.startsWith('http')) {
            selectedImageEl.style.background = `url(${this.selectedImage.url}) center/cover`;
        } else {
            selectedImageEl.style.background = this.selectedImage.gradient || 'var(--bg-tertiary)';
        }

        // 清除之前的视频结果
        const existingResult = videoSection.querySelector('.video-result');
        if (existingResult) existingResult.remove();
        const existingStatus = videoSection.querySelector('.video-status');
        if (existingStatus) existingStatus.remove();

        videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ==================== 视频生成 ====================

    async startVideoGeneration() {
        if (!this.selectedImage) {
            this.showToast('请先选择一张图片');
            return;
        }

        const btn = document.getElementById('generateVideoBtn');
        const videoSection = document.getElementById('videoSection');
        const duration = document.getElementById('durationSelect')?.value || 5;
        const motion = document.getElementById('motionSelect')?.value || 'medium';

        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div><span>生成视频中...</span>';

        // 显示状态
        this.showVideoStatus('正在生成视频，请稍候...');

        try {
            // 获取图片URL
            let imageUrl = this.selectedImage.url;
            if (!imageUrl || !imageUrl.startsWith('http')) {
                // 如果是base64或本地数据，需要上传到图床或转base64
                // 这里使用 Pollinations 的免费图片作为fallback
                imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(this.selectedImage.prompt)}?seed=${Date.now()}&width=1024&height=576&nologo=true`;
            }

            const result = await this.api.generateVideo(imageUrl, {
                duration: parseInt(duration),
                motion,
            });

            if (result.status === 'processing' && result.predictionId) {
                // 异步任务，开始轮询
                this.pollVideoStatus(result.predictionId, result.provider);
            } else {
                this.onVideoComplete(result);
            }
        } catch (error) {
            console.error('视频生成失败:', error);
            this.showToast('视频生成失败: ' + error.message);
            this.updateVideoStatus('生成失败: ' + error.message);

            // 演示模式回退
            setTimeout(() => {
                this.onVideoComplete({
                    status: 'completed',
                    url: null,
                    message: '演示模式：视频生成完成',
                });
            }, 1500);
        }

        btn.disabled = false;
        btn.innerHTML = '<span>生成视频</span>';
    }

    showVideoStatus(message) {
        const videoSection = document.getElementById('videoSection');
        let statusEl = videoSection.querySelector('.video-status');
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.className = 'video-status';
            videoSection.appendChild(statusEl);
        }
        statusEl.innerHTML = `<div class="spinner"></div><span class="video-status-text">${message}</span>`;
    }

    updateVideoStatus(message) {
        const videoSection = document.getElementById('videoSection');
        const statusEl = videoSection.querySelector('.video-status');
        if (statusEl) {
            statusEl.innerHTML = `<span class="video-status-text">${message}</span>`;
        }
    }

    async pollVideoStatus(taskId, provider) {
        try {
            const result = await this.api.checkVideoStatus(taskId, provider);
            if (result.status === 'completed') {
                this.onVideoComplete(result);
            } else {
                this.showVideoStatus(`生成中... ${Math.round((result.progress || 0.5) * 100)}%`);
                setTimeout(() => this.pollVideoStatus(taskId, provider), 3000);
            }
        } catch (error) {
            this.updateVideoStatus('查询状态失败: ' + error.message);
        }
    }

    onVideoComplete(result) {
        const videoSection = document.getElementById('videoSection');

        // 移除状态提示
        const statusEl = videoSection.querySelector('.video-status');
        if (statusEl) statusEl.remove();

        // 显示视频结果
        let resultEl = videoSection.querySelector('.video-result');
        if (!resultEl) {
            resultEl = document.createElement('div');
            resultEl.className = 'video-result';
            videoSection.appendChild(resultEl);
        }

        if (result.url) {
            resultEl.innerHTML = `<video src="${result.url}" controls autoplay loop></video>`;
        } else {
            // 演示模式，显示占位
            resultEl.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:14px;">🎬 视频生成完成<br><small style="margin-top:8px;">演示模式：配置真实API后可播放</small></div>`;
        }

        // 添加到作品
        this.addWork({
            title: this.selectedImage.prompt.substring(0, 20) + '...',
            prompt: this.selectedImage.prompt,
            imageUrl: this.selectedImage.url,
            videoUrl: result.url,
            status: 'completed',
            duration: document.getElementById('durationSelect')?.value || 5,
        });

        this.showToast('视频生成成功！已添加到我的作品');

        // 滚动到结果
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ==================== 作品管理 ====================

    addWork(work) {
        const newWork = {
            id: `work_${Date.now()}`,
            title: work.title || '未命名作品',
            prompt: work.prompt || '',
            imageUrl: work.imageUrl || '',
            videoUrl: work.videoUrl || '',
            status: work.status || 'completed',
            duration: work.duration || 5,
            createdAt: new Date().toISOString(),
            gradient: this.selectedImage?.gradient || 'linear-gradient(135deg, #1a1a2e, #16213e)',
        };

        this.works.unshift(newWork);
        this.saveWorks();
        this.renderWorks();
    }

    loadWorks() {
        const saved = localStorage.getItem('huijing_works');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return this.getDefaultWorks();
            }
        }
        return this.getDefaultWorks();
    }

    saveWorks() {
        localStorage.setItem('huijing_works', JSON.stringify(this.works));
    }

    getDefaultWorks() {
        return [
            { id: 'work_1', title: '霓虹雨夜', prompt: '霓虹雨夜场景', status: 'completed', duration: 5, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
            { id: 'work_2', title: '魔法森林', prompt: '魔法森林场景', status: 'completed', duration: 3, createdAt: new Date(Date.now() - 86400000).toISOString(), gradient: 'linear-gradient(135deg, #2d1b69, #0f3460)' },
            { id: 'work_3', title: '深海探险', prompt: '深海探险场景', status: 'processing', duration: 0, createdAt: new Date().toISOString(), gradient: 'linear-gradient(135deg, #1e3a5f, #2d5a87)' },
            { id: 'work_4', title: '西部黄昏', prompt: '西部黄昏场景', status: 'published', duration: 5, createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), gradient: 'linear-gradient(135deg, #3d1f00, #8b4513)' },
            { id: 'work_5', title: '星空漫步', prompt: '星空漫步场景', status: 'completed', duration: 5, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), gradient: 'linear-gradient(135deg, #1a0a2e, #4a148c)' },
            { id: 'work_6', title: '竹林剑影', prompt: '竹林剑影场景', status: 'completed', duration: 3, createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), gradient: 'linear-gradient(135deg, #0d3328, #1a6b4e)' },
        ];
    }

    renderWorks() {
        const grid = document.getElementById('worksGrid');
        if (!grid) return;

        grid.innerHTML = this.works.map(work => this.createWorkCard(work)).join('');

        // 重新绑定点击事件
        grid.querySelectorAll('.work-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-menu') && !e.target.closest('.work-menu')) {
                    this.openWorkDetail(card);
                }
            });
        });

        // 重新应用筛选
        this.filterWorks(this.currentFilter);
    }

    createWorkCard(work) {
        const timeText = this.formatTime(work.createdAt);
        const statusClass = work.status;
        const statusText = { completed: '已完成', processing: '生成中', published: '已发布' }[work.status] || work.status;
        const durationText = work.duration > 0 ? `${work.duration}s` : '--';

        return `
            <div class="work-card" data-status="${work.status}" data-id="${work.id}">
                <div class="work-thumbnail" style="background: ${work.gradient};">
                    <div class="work-overlay ${work.status === 'processing' ? 'processing' : ''}">
                        ${work.status === 'processing'
                            ? '<div class="spinner"></div>'
                            : `<button class="btn-play"><svg width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>`
                        }
                    </div>
                    <div class="work-duration">${durationText}</div>
                    ${work.status !== 'processing' ? `
                    <div class="work-menu">
                        <button class="btn-menu">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                            </svg>
                        </button>
                    </div>` : ''}
                </div>
                <div class="work-info">
                    <div class="work-title">${work.title}</div>
                    <div class="work-meta">
                        <span class="work-time">${timeText}</span>
                        <span class="work-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    }

    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
        if (diff < 7 * 86400000) return `${Math.floor(diff / 86400000)}天前`;
        if (diff < 30 * 86400000) return `${Math.floor(diff / (7 * 86400000))}周前`;
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    publishWork() {
        this.showToast('发布到社区功能开发中...');
    }

    // ==================== 原有功能 ====================

    toggleQuickAsset(item) {
        item.classList.toggle('selected');
        const id = item.dataset.id;
        const type = item.dataset.type;

        if (item.classList.contains('selected')) {
            this.selectedAssets.push({ id, type });
        } else {
            this.selectedAssets = this.selectedAssets.filter(a => a.id !== id);
        }
    }

    regenerate() {
        const textarea = document.getElementById('promptInput');
        if (textarea.value.trim()) {
            this.startGeneration();
        }
    }

    editPrompt() {
        document.getElementById('createSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('promptInput').focus();
    }

    initWorksFilter() {
        this.filterWorks('all');
    }

    filterWorks(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            const status = card.dataset.status;
            card.style.display = (filter === 'all' || status === filter) ? '' : 'none';
        });
    }

    switchView(view) {
        const gridBtn = document.getElementById('gridViewBtn');
        const listBtn = document.getElementById('listViewBtn');
        const worksGrid = document.getElementById('worksGrid');

        if (view === 'grid') {
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
            worksGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
        } else {
            listBtn.classList.add('active');
            gridBtn.classList.remove('active');
            worksGrid.style.gridTemplateColumns = '1fr';
        }
    }

    openWorkDetail(card) {
        const workId = card.dataset.id;
        const work = this.works.find(w => w.id === workId);
        if (!work) return;

        const modal = document.getElementById('workDetailModal');
        const title = document.getElementById('detailTitle');
        const time = document.getElementById('detailTime');
        const status = document.getElementById('detailStatus');
        const prompt = document.getElementById('detailPrompt');
        const video = document.getElementById('detailVideo');

        title.textContent = work.title;
        time.textContent = this.formatTime(work.createdAt);
        status.textContent = { completed: '已完成', processing: '生成中', published: '已发布' }[work.status] || work.status;
        prompt.value = work.prompt || '';
        video.style.background = work.gradient;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    saveConfigFromModal() {
        CONFIG.mode = document.getElementById('configMode').value;
        CONFIG.frontend.imageProvider = document.getElementById('configImageProvider').value;
        CONFIG.frontend.videoProvider = document.getElementById('configVideoProvider').value;
        CONFIG.frontend.textProvider = document.getElementById('configTextProvider').value;
        CONFIG.frontend.apiKeys.openai = document.getElementById('configOpenaiKey').value;
        CONFIG.frontend.apiKeys.replicate = document.getElementById('configReplicateKey').value;

        this.saveConfig();
        this.closeConfigModal();
        this.showToast('配置已保存');
    }

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new VideoGeneratorApp();
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
    }
`;
document.head.appendChild(style);
