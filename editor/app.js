// 绘境Online - 世界书编辑器
class WorldBookEditor {
    constructor() {
        this.currentPanel = 'basic';
        this.currentWorkflowStep = 1;
        this.generationQueue = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.initWorkflow();
        this.initRangeSliders();
    }

    bindEvents() {
        // 侧边栏导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const panel = e.currentTarget.dataset.panel;
                this.switchPanel(panel);
            });
        });

        // 预览标签
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const preview = e.currentTarget.dataset.preview;
                this.switchPreview(preview);
            });
        });

        // 工作流步骤
        document.querySelectorAll('.workflow-step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepNum = e.currentTarget.dataset.step;
                this.switchWorkflowStep(stepNum);
            });
        });

        // AI生成按钮
        const aiGenerateBtn = document.getElementById('aiGenerateBasic');
        if (aiGenerateBtn) {
            aiGenerateBtn.addEventListener('click', () => this.aiGenerateBasic());
        }

        const aiOptimizeBtn = document.getElementById('aiOptimizePrompt');
        if (aiOptimizeBtn) {
            aiOptimizeBtn.addEventListener('click', () => this.aiOptimizePrompt());
        }

        // 生成按钮
        const generateImagesBtn = document.getElementById('generateImages');
        if (generateImagesBtn) {
            generateImagesBtn.addEventListener('click', () => this.generateImages());
        }

        const generateVideoBtn = document.getElementById('generateVideo');
        if (generateVideoBtn) {
            generateVideoBtn.addEventListener('click', () => this.generateVideo());
        }

        const previewWithOptionsBtn = document.getElementById('previewWithOptions');
        if (previewWithOptionsBtn) {
            previewWithOptionsBtn.addEventListener('click', () => this.previewWithOptions());
        }

        // 样式预设
        document.querySelectorAll('.style-preset').forEach(preset => {
            preset.addEventListener('click', (e) => {
                document.querySelectorAll('.style-preset').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // 选项样式
        document.querySelectorAll('.option-style-preview').forEach(style => {
            style.addEventListener('click', (e) => {
                document.querySelectorAll('.option-style-preview').forEach(s => s.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // 颜色选择
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // 视觉元素
        document.querySelectorAll('.checkbox-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('active');
                const checkbox = e.currentTarget.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = e.currentTarget.classList.contains('active');
            });
        });

        // 参考图
        document.querySelectorAll('.ref-image').forEach(img => {
            img.addEventListener('click', (e) => {
                if (!e.currentTarget.classList.contains('add-new')) {
                    document.querySelectorAll('.ref-image').forEach(i => i.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });
    }

    // 切换面板
    switchPanel(panelId) {
        // 更新导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.panel === panelId) {
                item.classList.add('active');
            }
        });

        // 更新面板
        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`panel-${panelId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        this.currentPanel = panelId;
    }

    // 切换预览
    switchPreview(previewId) {
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.preview === previewId) {
                tab.classList.add('active');
            }
        });

        document.querySelectorAll('.preview-view').forEach(view => {
            view.classList.remove('active');
        });
        const targetView = document.getElementById(`preview-${previewId}`);
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    // 初始化工作流
    initWorkflow() {
        this.updateWorkflowUI();
    }

    // 切换工作流步骤
    switchWorkflowStep(stepNum) {
        this.currentWorkflowStep = parseInt(stepNum);
        this.updateWorkflowUI();
    }

    // 更新工作流UI
    updateWorkflowUI() {
        document.querySelectorAll('.workflow-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.remove('active');
            if (stepNum === this.currentWorkflowStep) {
                step.classList.add('active');
            }
        });

        document.querySelectorAll('.config-section').forEach(config => {
            const configNum = parseInt(config.dataset.config);
            config.style.display = configNum === this.currentWorkflowStep ? 'block' : 'none';
        });
    }

    // 初始化滑块
    initRangeSliders() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                const display = e.target.nextElementSibling;
                if (display) {
                    const max = e.target.max;
                    if (max === '100') {
                        display.textContent = value + '%';
                    } else if (e.target.id === 'videoDuration') {
                        display.textContent = value + '秒';
                    } else if (e.target.id === 'timeLimit') {
                        display.textContent = value === '0' ? '无限制' : value + '秒';
                    } else {
                        display.textContent = value;
                    }
                }
            });
        });
    }

    // AI生成基础设定
    async aiGenerateBasic() {
        const btn = document.getElementById('aiGenerateBasic');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> AI生成中...';

        // 模拟AI生成
        await this.delay(2000);

        // 填充表单
        document.querySelector('#panel-basic input[type="text"]').value = '赛博朋克都市';
        
        // 显示成功提示
        this.showToast('AI生成完成！已填充基础设定');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span> AI生成完整设定';
    }

    // AI优化描述
    async aiOptimizePrompt() {
        const btn = document.getElementById('aiOptimizePrompt');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 优化中...';

        await this.delay(1500);

        const textarea = document.querySelector('#panel-video-workflow textarea');
        textarea.value = '霓虹灯闪烁的雨夜，巨型公司总部大楼前，主角站在雨中，全息广告在身后闪烁，飞行汽车从头顶掠过';

        this.showToast('描述已优化！');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span> AI优化描述';
    }

    // 生成图片
    async generateImages() {
        const btn = document.getElementById('generateImages');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 生成中...';

        // 添加到队列
        this.addToQueue('场景1：霓虹街道', '图片', 'processing');

        await this.delay(3000);

        this.updateQueueStatus(0, 'completed');
        this.showToast('关键帧生成完成！');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🖼️</span> 生成关键帧';

        // 自动切换到下一步
        this.switchWorkflowStep(3);
    }

    // 生成视频
    async generateVideo() {
        const btn = document.getElementById('generateVideo');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 生成中...';

        this.addToQueue('场景1：霓虹街道', '视频', 'processing');

        await this.delay(5000);

        this.updateQueueStatus(this.generationQueue.length - 1, 'completed');
        this.showToast('视频生成完成！');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🎬</span> 生成视频';

        // 自动切换到下一步
        this.switchWorkflowStep(4);
    }

    // 预览带选项的视频
    previewWithOptions() {
        this.showToast('正在生成预览...');
        
        // 切换到视频预览
        this.switchPreview('video');
        
        // 模拟播放
        setTimeout(() => {
            this.showToast('预览已生成！');
        }, 1000);
    }

    // 添加到队列
    addToQueue(name, type, status) {
        const queue = {
            name,
            type,
            status,
            time: new Date().toLocaleTimeString()
        };
        this.generationQueue.push(queue);
        this.renderQueue();
    }

    // 更新队列状态
    updateQueueStatus(index, status) {
        if (this.generationQueue[index]) {
            this.generationQueue[index].status = status;
            this.renderQueue();
        }
    }

    // 渲染队列
    renderQueue() {
        const queueList = document.querySelector('.queue-list');
        if (!queueList) return;

        queueList.innerHTML = this.generationQueue.map((item, index) => {
            const statusIcon = item.status === 'completed' ? '✅' : 
                              item.status === 'processing' ? '<div class="spinner"></div>' : '⏳';
            const statusClass = item.status;
            const progress = item.status === 'processing' ? '<div class="queue-progress">75%</div>' : 
                            item.status === 'completed' ? `<div class="queue-time">${item.time}</div>` : 
                            '<div class="queue-time">等待中</div>';

            return `
                <div class="queue-item ${statusClass}">
                    <div class="queue-status">${statusIcon}</div>
                    <div class="queue-info">
                        <div class="queue-name">${item.name}</div>
                        <div class="queue-type">${item.type}</div>
                    </div>
                    ${progress}
                </div>
            `;
        }).join('');
    }

    // 显示提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-secondary);
            color: var(--text-primary);
            padding: 12px 24px;
            border-radius: var(--border-radius-sm);
            border: 1px solid var(--primary);
            z-index: 9999;
            animation: slideUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 延迟
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 工作流管理器
class WorkflowManager {
    constructor() {
        this.steps = [
            { id: 1, name: '文本描述', icon: '📝', status: 'active' },
            { id: 2, name: '图片生成', icon: '🖼️', status: 'pending' },
            { id: 3, name: '视频生成', icon: '🎬', status: 'pending' },
            { id: 4, name: '选项注入', icon: '🎮', status: 'pending' }
        ];
    }

    activateStep(stepId) {
        this.steps.forEach(step => {
            if (step.id === stepId) {
                step.status = 'active';
            } else if (step.id < stepId) {
                step.status = 'completed';
            } else {
                step.status = 'pending';
            }
        });
    }

    completeStep(stepId) {
        const step = this.steps.find(s => s.id === stepId);
        if (step) {
            step.status = 'completed';
        }
    }
}

// 图片生成器
class ImageGenerator {
    constructor() {
        this.models = ['image2', 'midjourney', 'flux', 'sdxl'];
        this.currentModel = 'image2';
    }

    async generate(prompt, options = {}) {
        const config = {
            model: options.model || this.currentModel,
            resolution: options.resolution || '1920x1080',
            style: options.style || 'cinematic',
            ...options
        };

        // 模拟API调用
        console.log('生成图片:', { prompt, config });
        
        return {
            id: `img_${Date.now()}`,
            url: `https://api.example.com/images/${Date.now()}`,
            prompt,
            config
        };
    }

    async generateKeyframes(sceneDescription, count = 6) {
        const keyframes = [];
        
        for (let i = 0; i < count; i++) {
            const prompt = `${sceneDescription} - 关键帧 ${i + 1}/${count}`;
            const frame = await this.generate(prompt, {
                style: 'cinematic'
            });
            keyframes.push(frame);
        }

        return keyframes;
    }
}

// 视频生成器
class VideoGenerator {
    constructor() {
        this.models = ['seedance2', 'runway', 'pika', 'luma'];
        this.currentModel = 'seedance2';
    }

    async generate(keyframes, options = {}) {
        const config = {
            model: options.model || this.currentModel,
            fps: options.fps || 30,
            duration: options.duration || 5,
            motionStrength: options.motionStrength || 0.5,
            ...options
        };

        // 模拟API调用
        console.log('生成视频:', { keyframes, config });

        return {
            id: `vid_${Date.now()}`,
            url: `https://api.example.com/videos/${Date.now()}`,
            keyframes,
            config
        };
    }

    async generateWithPrompt(prompt, options = {}) {
        // 先生成关键帧
        const imageGen = new ImageGenerator();
        const keyframes = await imageGen.generateKeyframes(prompt, 6);

        // 再生成视频
        return this.generate(keyframes, options);
    }
}

// 选项注入器
class OptionInjector {
    constructor() {
        this.styles = ['bottom', 'overlay', 'sidebar'];
        this.currentStyle = 'bottom';
    }

    inject(videoElement, options, config = {}) {
        const style = config.style || this.currentStyle;
        const timing = config.timing || 'end';
        const timeLimit = config.timeLimit || 0;

        // 创建选项容器
        const container = document.createElement('div');
        container.className = `options-container ${style}`;

        // 添加选项按钮
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-button';
            btn.innerHTML = `
                <span class="option-text">${option.text}</span>
                ${option.hint ? `<span class="option-hint">${option.hint}</span>` : ''}
            `;
            btn.addEventListener('click', () => this.onOptionSelect(option));
            container.appendChild(btn);
        });

        // 根据时机注入
        if (timing === 'end') {
            videoElement.addEventListener('ended', () => {
                videoElement.parentElement.appendChild(container);
            });
        } else {
            // 在指定时间点注入
            const checkTime = () => {
                if (videoElement.currentTime >= config.injectTime) {
                    videoElement.parentElement.appendChild(container);
                    videoElement.removeEventListener('timeupdate', checkTime);
                }
            };
            videoElement.addEventListener('timeupdate', checkTime);
        }

        // 时间限制
        if (timeLimit > 0) {
            setTimeout(() => {
                if (container.parentElement) {
                    container.remove();
                    this.onTimeout();
                }
            }, timeLimit * 1000);
        }

        return container;
    }

    onOptionSelect(option) {
        console.log('选项被选择:', option);
        // 触发剧情分支
        this.triggerBranch(option.nextNode);
    }

    onTimeout() {
        console.log('选项超时');
        // 触发默认分支
        this.triggerDefaultBranch();
    }

    triggerBranch(nodeId) {
        // 跳转到指定节点
        console.log('触发分支:', nodeId);
    }

    triggerDefaultBranch() {
        // 触发默认分支
        console.log('触发默认分支');
    }
}

// 视频生成工作流覆盖层管理器
class VideoWorkflowOverlay {
    constructor() {
        this.currentStep = 1;
        this.selectedAssets = [];
        this.generatedImages = [];
        this.selectedImage = null;
        this.overlay = document.getElementById('videoWorkflowOverlay');
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // 打开覆盖层 - 从视频工作流面板
        const videoWorkflowNav = document.querySelector('.nav-item[data-panel="video-workflow"]');
        if (videoWorkflowNav) {
            videoWorkflowNav.addEventListener('click', () => {
                this.open();
            });
        }

        // 关闭覆盖层
        const closeBtn = document.getElementById('overlayClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // 步骤导航
        document.getElementById('overlayNext1')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('overlayPrev2')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('overlayNext2')?.addEventListener('click', () => this.startImageGeneration());
        document.getElementById('overlayPrev3')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('overlayRegenerate3')?.addEventListener('click', () => this.regenerateImages());
        document.getElementById('overlayPrev4')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('overlayGenerateVideo')?.addEventListener('click', () => this.generateVideo());
        document.getElementById('overlayFinish')?.addEventListener('click', () => this.close());
        document.getElementById('overlayNewVideo')?.addEventListener('click', () => this.goToStep(1));

        // AI优化
        document.getElementById('overlayAiOptimize')?.addEventListener('click', () => this.optimizePrompt());

        // 素材选择
        document.querySelectorAll('.overlay-asset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('selected');
            });
        });
    }

    open(nodeData = null) {
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.currentStep = 1;
        this.updateStepIndicator();
        this.showStepPanel(1);

        // 如果有节点数据，预填充
        if (nodeData) {
            document.getElementById('currentNodeName').textContent = nodeData.name || '未命名节点';
            document.getElementById('overlayPrompt').value = nodeData.description || '';
        }
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    goToStep(step) {
        this.currentStep = step;
        this.updateStepIndicator();
        this.showStepPanel(step);
    }

    updateStepIndicator() {
        document.querySelectorAll('.step-indicator .step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        document.querySelectorAll('.step-indicator .step-line').forEach((line, index) => {
            line.classList.remove('completed');
            if (index < this.currentStep - 1) {
                line.classList.add('completed');
            }
        });
    }

    showStepPanel(step) {
        document.querySelectorAll('.workflow-step-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const target = document.querySelector(`.workflow-step-panel[data-step-panel="${step}"]`);
        if (target) {
            target.classList.add('active');
        }
    }

    async optimizePrompt() {
        const btn = document.getElementById('overlayAiOptimize');
        const textarea = document.getElementById('overlayPrompt');
        
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>优化中...';

        await this.delay(1500);

        const original = textarea.value || '赛博朋克雨夜街道';
        textarea.value = `${original}，霓虹灯闪烁，雨水反射着彩色光芒，远处有飞行汽车掠过，电影级构图，8K画质，氛围感强烈`;

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span>AI优化描述';
    }

    async startImageGeneration() {
        this.goToStep(3);

        const grid = document.getElementById('overlayImageGrid');
        const cards = grid.querySelectorAll('.overlay-image-card');

        // 重置为加载状态
        cards.forEach(card => {
            card.innerHTML = '<div class="overlay-image-placeholder"><div class="spinner"></div></div>';
            card.classList.remove('selected');
        });

        await this.delay(2500);

        // 模拟生成结果
        const gradients = [
            'linear-gradient(135deg, #1a1a2e, #16213e)',
            'linear-gradient(135deg, #2d1b69, #0f3460)',
            'linear-gradient(135deg, #1e3a5f, #2d5a87)',
            'linear-gradient(135deg, #3d1f00, #8b4513)'
        ];

        this.generatedImages = gradients.map((gradient, index) => ({
            id: `img_${Date.now()}_${index}`,
            gradient,
            text: `场景版本 ${index + 1}：画面氛围独特，光影效果出色`
        }));

        cards.forEach((card, index) => {
            const data = this.generatedImages[index];
            card.innerHTML = `<div class="overlay-image-placeholder" style="background: ${data.gradient};"></div>`;
            card.addEventListener('click', () => this.selectImage(index));
        });
    }

    selectImage(index) {
        const cards = document.querySelectorAll('.overlay-image-card');
        cards.forEach(c => c.classList.remove('selected'));
        cards[index].classList.add('selected');

        this.selectedImage = this.generatedImages[index];
        this.goToStep(4);

        // 更新选中图片显示
        const selectedImg = document.getElementById('overlaySelectedImage');
        selectedImg.style.background = this.selectedImage.gradient;

        // 预填充场景描述
        document.getElementById('overlaySceneText').value = this.selectedImage.text;
    }

    async regenerateImages() {
        await this.startImageGeneration();
    }

    async generateVideo() {
        const btn = document.getElementById('overlayGenerateVideo');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>生成中...';

        await this.delay(3000);

        // 显示完成状态
        this.goToStep(5);

        // 设置结果预览
        const resultPlaceholder = document.getElementById('resultPlaceholder');
        if (resultPlaceholder && this.selectedImage) {
            resultPlaceholder.style.background = this.selectedImage.gradient;
        }

        btn.disabled = false;
        btn.innerHTML = '生成视频';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 初始化
const editor = new WorldBookEditor();
const workflow = new WorkflowManager();
const imageGenerator = new ImageGenerator();
const videoGenerator = new VideoGenerator();
const optionInjector = new OptionInjector();
const videoOverlay = new VideoWorkflowOverlay();

// 导出
window.WorldBookEditor = WorldBookEditor;
window.WorkflowManager = WorkflowManager;
window.ImageGenerator = ImageGenerator;
window.VideoGenerator = VideoGenerator;
window.OptionInjector = OptionInjector;
window.VideoWorkflowOverlay = VideoWorkflowOverlay;

// CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);
