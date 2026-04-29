class VideoGeneratorApp {
    constructor() {
        this.selectedAssets = {
            characters: [],
            worlds: [],
            playsets: []
        };
        this.generatedImages = [];
        this.selectedImage = null;
        this.currentTab = 'characters';
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.initAssetsPanel();
    }

    bindEvents() {
        // 生成按钮
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.startGeneration());
        }

        // 素材折叠
        const assetsToggle = document.getElementById('assetsToggle');
        if (assetsToggle) {
            assetsToggle.addEventListener('click', () => this.toggleAssets());
        }

        // 素材标签切换
        document.querySelectorAll('.asset-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAssetTab(e.target.dataset.tab));
        });

        // 素材卡片选择
        document.querySelectorAll('.asset-card').forEach(card => {
            card.addEventListener('click', (e) => this.toggleAssetSelection(e.currentTarget));
        });

        // 社区筛选
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchFilter(e.target));
        });

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
            generateVideoBtn.addEventListener('click', () => this.generateVideo());
        }

        // 弹窗关闭
        const modalClose = document.getElementById('modalClose');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => this.closeModal());
        }

        // 确认使用
        const confirmBtn = document.getElementById('confirmBtn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => this.confirmImage());
        }

        // 生成变体
        const variantBtn = document.getElementById('variantBtn');
        if (variantBtn) {
            variantBtn.addEventListener('click', () => this.generateVariant());
        }

        // 回车生成
        const textarea = document.querySelector('.input-textarea');
        if (textarea) {
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    this.startGeneration();
                }
            });
        }
    }

    initAssetsPanel() {
        // 初始化素材面板状态
        this.updateAssetGrid();
    }

    toggleAssets() {
        const toggle = document.getElementById('assetsToggle');
        const panel = document.getElementById('assetsPanel');
        toggle.classList.toggle('expanded');
        panel.classList.toggle('expanded');
    }

    switchAssetTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.asset-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.asset-tab[data-tab="${tab}"]`).classList.add('active');
        this.updateAssetGrid();
    }

    updateAssetGrid() {
        const grid = document.getElementById('characterGrid');
        if (!grid) return;

        // 模拟不同标签的数据
        const data = this.getAssetData(this.currentTab);
        grid.innerHTML = data.map(item => `
            <div class="asset-card ${item.selected ? 'selected' : ''}" data-id="${item.id}" data-type="${this.currentTab}">
                <div class="asset-image" style="${item.style}"></div>
                <div class="asset-name">${item.name}</div>
                <div class="asset-desc">${item.desc}</div>
            </div>
        `).join('') + `
            <div class="asset-card add-new">
                <div class="asset-image">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                </div>
                <div class="asset-name">新建${this.getAssetTypeName(this.currentTab)}</div>
            </div>
        `;

        // 重新绑定事件
        grid.querySelectorAll('.asset-card:not(.add-new)').forEach(card => {
            card.addEventListener('click', (e) => this.toggleAssetSelection(e.currentTarget));
        });
    }

    getAssetData(type) {
        const mockData = {
            characters: [
                { id: 'char1', name: '夜行者', desc: '赛博朋克雇佣兵', style: 'background: linear-gradient(135deg, #6366f1, #8b5cf6);', selected: false },
                { id: 'char2', name: '红狐', desc: '神秘黑客', style: 'background: linear-gradient(135deg, #f59e0b, #ef4444);', selected: false },
                { id: 'char3', name: '白医生', desc: '地下医生', style: 'background: linear-gradient(135deg, #10b981, #3b82f6);', selected: false },
            ],
            worlds: [
                { id: 'world1', name: '赛博都市', desc: '2150年新上海', style: 'background: linear-gradient(135deg, #00f0ff, #0066ff);', selected: false },
                { id: 'world2', name: '魔法王国', desc: '中古奇幻世界', style: 'background: linear-gradient(135deg, #ff00ff, #9900ff);', selected: false },
                { id: 'world3', name: '废土世界', desc: '末日后的地球', style: 'background: linear-gradient(135deg, #ff6600, #cc3300);', selected: false },
            ],
            playsets: [
                { id: 'play1', name: '侦探模式', desc: '解谜探案玩法', style: 'background: linear-gradient(135deg, #333333, #666666);', selected: false },
                { id: 'play2', name: '战斗模式', desc: '即时战斗玩法', style: 'background: linear-gradient(135deg, #cc0000, #990000);', selected: false },
                { id: 'play3', name: '恋爱模式', desc: '剧情互动玩法', style: 'background: linear-gradient(135deg, #ff69b4, #ff1493);', selected: false },
            ]
        };
        return mockData[type] || [];
    }

    getAssetTypeName(type) {
        const names = {
            characters: '角色',
            worlds: '世界',
            playsets: '玩法'
        };
        return names[type] || '';
    }

    toggleAssetSelection(card) {
        if (card.classList.contains('add-new')) return;

        const type = card.dataset.type;
        const id = card.dataset.id;

        card.classList.toggle('selected');

        if (card.classList.contains('selected')) {
            if (!this.selectedAssets[type].includes(id)) {
                this.selectedAssets[type].push(id);
            }
        } else {
            this.selectedAssets[type] = this.selectedAssets[type].filter(i => i !== id);
        }
    }

    async startGeneration() {
        const textarea = document.querySelector('.input-textarea');
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
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div><span>生成中...</span>';

        // 显示生成区域
        const generationSection = document.getElementById('generationSection');
        generationSection.classList.add('active');

        // 滚动到生成区域
        generationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 模拟AI生成图片
        await this.simulateImageGeneration(prompt);

        btn.disabled = false;
        btn.innerHTML = '<span>生成</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
        this.isGenerating = false;
    }

    async simulateImageGeneration(prompt) {
        const grid = document.getElementById('imageGrid');
        const cards = grid.querySelectorAll('.image-card');

        // 模拟生成延迟
        await this.delay(2000);

        // 生成模拟图片数据
        const gradients = [
            'linear-gradient(135deg, #1a1a2e, #16213e)',
            'linear-gradient(135deg, #2d1b69, #0f3460)',
            'linear-gradient(135deg, #1e3a5f, #2d5a87)',
            'linear-gradient(135deg, #3d1f00, #8b4513)'
        ];

        this.generatedImages = gradients.map((gradient, index) => ({
            id: `img_${Date.now()}_${index}`,
            gradient,
            prompt: `${prompt} - 版本 ${index + 1}`,
            text: this.generateSceneText(prompt, index)
        }));

        // 更新UI
        cards.forEach((card, index) => {
            const data = this.generatedImages[index];
            card.innerHTML = `
                <div class="image-placeholder" style="background: ${data.gradient};">
                    <div style="color: white; font-size: 14px; opacity: 0.8;">版本 ${index + 1}</div>
                </div>
            `;
            card.addEventListener('click', () => this.selectImage(index));
        });

        this.showToast('图片生成完成！请选择一张');
    }

    generateSceneText(prompt, variant) {
        const texts = [
            `场景展开：${prompt}。画面中光影交错，氛围渐入佳境。`,
            `镜头推进：${prompt}。细节逐渐清晰，故事缓缓展开。`,
            `全景呈现：${prompt}。宏大场面一览无遗，震撼人心。`,
            `特写切入：${prompt}。聚焦于核心元素，情感张力十足。`
        ];
        return texts[variant] || texts[0];
    }

    selectImage(index) {
        const cards = document.querySelectorAll('.image-card');
        cards.forEach(c => c.classList.remove('selected'));
        cards[index].classList.add('selected');

        this.selectedImage = this.generatedImages[index];

        // 打开编辑弹窗
        this.openEditModal(index);
    }

    openEditModal(index) {
        const modal = document.getElementById('imageEditModal');
        const image = document.getElementById('editImage');
        const textarea = document.getElementById('editTextarea');
        const data = this.generatedImages[index];

        // 创建模拟图片
        image.src = this.createPlaceholderImage(data.gradient);
        textarea.value = data.text;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    createPlaceholderImage(gradient) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');

        // 解析渐变
        const colors = gradient.match(/#[a-fA-F0-9]{6}/g) || ['#1a1a2e', '#16213e'];
        const grd = ctx.createLinearGradient(0, 0, 640, 360);
        grd.addColorStop(0, colors[0]);
        grd.addColorStop(1, colors[1]);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 640, 360);

        // 添加一些装饰
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 640;
            const y = Math.random() * 360;
            const r = Math.random() * 100 + 50;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas.toDataURL();
    }

    closeModal() {
        const modal = document.getElementById('imageEditModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    confirmImage() {
        const textarea = document.getElementById('editTextarea');
        if (this.selectedImage) {
            this.selectedImage.text = textarea.value;
        }
        this.closeModal();
        this.showVideoSection();
    }

    generateVariant() {
        this.showToast('正在生成变体...');
        // 模拟变体生成
        setTimeout(() => {
            this.showToast('变体生成完成！');
        }, 1500);
    }

    showVideoSection() {
        const videoSection = document.getElementById('videoSection');
        const selectedImageEl = document.getElementById('selectedImage');

        videoSection.classList.add('active');
        selectedImageEl.style.background = this.selectedImage.gradient;

        videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async generateVideo() {
        const btn = document.getElementById('generateVideoBtn');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div><span>生成视频中...</span>';

        // 模拟视频生成
        await this.delay(3000);

        btn.innerHTML = '<span>视频生成完成！</span>';
        this.showToast('视频生成成功！');

        // 重置按钮
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<span>生成视频</span>';
        }, 2000);
    }

    regenerate() {
        const textarea = document.querySelector('.input-textarea');
        if (textarea.value.trim()) {
            this.startGeneration();
        }
    }

    editPrompt() {
        const inputSection = document.querySelector('.input-section');
        inputSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.querySelector('.input-textarea').focus();
    }

    switchFilter(tab) {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 模拟筛选动画
        const grid = document.getElementById('masonryGrid');
        grid.style.opacity = '0.5';
        setTimeout(() => {
            grid.style.opacity = '1';
        }, 300);
    }

    showToast(message) {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 14px 28px;
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--primary);
            z-index: 9999;
            animation: slideUp 0.3s ease;
            font-size: 14px;
            box-shadow: var(--shadow-lg);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new VideoGeneratorApp();
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
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
