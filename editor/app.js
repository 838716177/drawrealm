// 绘境Online - 世界书编辑器
const RANDOM_GRADIENTS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #f59e0b, #ef4444)',
    'linear-gradient(135deg, #10b981, #3b82f6)',
    'linear-gradient(135deg, #ec4899, #8b5cf6)',
    'linear-gradient(135deg, #06b6d4, #6366f1)',
    'linear-gradient(135deg, #f97316, #ef4444)',
    'linear-gradient(135deg, #8b5cf6, #ec4899)',
    'linear-gradient(135deg, #14b8a6, #06b6d4)'
];

function randomGrad() {
    return RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)];
}

function debounce(fn, delay = 200) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

class WorldBookEditor {
    constructor() {
        this.currentPanel = 'basic';
        this.currentWorkflowStep = 1;
        this.generationQueue = [];
        this.autoSaveTimer = null;
        this.pendingChanges = false;
        this.renderedPanels = new Set(['basic']);
        this.dom = {};
        this.currentWorldData = this.loadWorldData();
        this.worldBook = new WorldBookSystem(dataStore);
        this.characterCard = new CharacterCardSystem(dataStore);
        this.gameOptions = new GameOptionsSystem();
        this.tradingMarket = new TradingMarketSystem(dataStore);
        this.characterGrowth = new CharacterGrowthSystem();
        this.social = new SocialInterconnectionSystem();
        this.aiPipeline = new AIVideoPipeline();
        this.characterCard.load();
        this.worldBook.load(dataStore.getCurrentWorld()?.id);
        this._debouncedFilter = debounce(() => this._filterMarketListings(), 200);
        this.init();
    }

    _cacheDOM() {
        this.dom.marketGrid = () => document.getElementById('marketGrid');
        this.dom.marketSearch = () => document.getElementById('marketSearch');
        this.dom.marketSort = () => document.getElementById('marketSort');
        this.dom.leaderboardContent = () => document.getElementById('leaderboardContent');
        this.dom.toast = () => document.getElementById('editorToast');
    }

    init() {
        this._verifySystems();
        this.bindEvents();
        this.initWorkflow();
        this.initRangeSliders();
        this.initTagInputs();
        this.initDynamicLists();
        this.initPreviewControls();
        this.initGalleryThumbs();
        this.initColorPicker();
        this.initVisualElements();
        this.initMapUpload();
        this.initAutoSave();
        this.initPreviewButtons();
        this.initItemCategories();
        this.loadFormData();
        this._cacheDOM();
        this._setupKeyboardShortcuts();
    }

    _verifySystems() {
        const checks = [
            { name: 'WorldBookSystem', obj: this.worldBook },
            { name: 'CharacterCardSystem', obj: this.characterCard },
            { name: 'GameOptionsSystem', obj: this.gameOptions },
            { name: 'TradingMarketSystem', obj: this.tradingMarket },
            { name: 'CharacterGrowthSystem', obj: this.characterGrowth },
            { name: 'SocialInterconnectionSystem', obj: this.social },
            { name: 'AIVideoPipeline', obj: this.aiPipeline }
        ];
        const failed = checks.filter(c => !c.obj);
        if (failed.length > 0) {
            console.warn('系统初始化警告: ' + failed.map(c => c.name).join(', '));
        }
    }

    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's': e.preventDefault(); this.saveWorldData(); this.showToast('已保存 (Ctrl+S)', 'success'); break;
                    case '1': e.preventDefault(); this.switchPanel('basic'); break;
                    case '2': e.preventDefault(); this.switchPanel('rules'); break;
                    case '3': e.preventDefault(); this.switchPanel('geography'); break;
                    case '4': e.preventDefault(); this.switchPanel('factions'); break;
                    case '5': e.preventDefault(); this.switchPanel('story'); break;
                    case '6': e.preventDefault(); this.switchPanel('characters'); break;
                }
            }
        });
    }

    // ==================== 数据持久化 ====================

    loadWorldData() {
        const saved = localStorage.getItem('huijing_editor_current_world_data');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('加载世界数据失败:', e);
            }
        }
        return {
            basic: {},
            rules: {},
            geography: {},
            factions: {},
            story: { nodes: [], endings: [] },
            characters: [],
            items: [],
            visualStyle: {}
        };
    }

    saveWorldData() {
        this.collectFormData();
        localStorage.setItem('huijing_editor_current_world_data', JSON.stringify(this.currentWorldData));
        this.showAutoSaveIndicator();
    }

    collectFormData() {
        // 基础信息
        const basicInputs = document.querySelectorAll('#panel-basic input, #panel-basic select');
        basicInputs.forEach(input => {
            if (input.name || input.id) {
                this.currentWorldData.basic[input.name || input.id] = input.value;
            }
        });

        // 世界规则
        const ruleTech = document.getElementById('ruleTech');
        const ruleSociety = document.getElementById('ruleSociety');
        const ruleMagic = document.getElementById('ruleMagic');
        const ruleDanger = document.getElementById('ruleDanger');
        if (ruleTech) this.currentWorldData.rules.technology = ruleTech.value;
        if (ruleSociety) this.currentWorldData.rules.society = ruleSociety.value;
        if (ruleMagic) this.currentWorldData.rules.magic = ruleMagic.value;
        if (ruleDanger) this.currentWorldData.rules.danger = ruleDanger.value;

        // 地理环境
        const climateInput = document.getElementById('climateInput');
        if (climateInput) this.currentWorldData.geography.climate = climateInput.value;
    }

    loadFormData() {
        const data = this.currentWorldData;
        if (data.basic) {
            Object.entries(data.basic).forEach(([key, value]) => {
                const input = document.querySelector(`#panel-basic [name="${key}"], #panel-basic #${key}`);
                if (input) input.value = value;
            });
        }
        if (data.rules) {
            if (data.rules.technology && document.getElementById('ruleTech')) document.getElementById('ruleTech').value = data.rules.technology;
            if (data.rules.society && document.getElementById('ruleSociety')) document.getElementById('ruleSociety').value = data.rules.society;
            if (data.rules.magic && document.getElementById('ruleMagic')) document.getElementById('ruleMagic').value = data.rules.magic;
            if (data.rules.danger && document.getElementById('ruleDanger')) document.getElementById('ruleDanger').value = data.rules.danger;
        }
    }

    // ==================== 自动保存 ====================

    initAutoSave() {
        // 监听所有表单输入变化
        document.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(input => {
            input.addEventListener('input', () => this.onFormChange(input));
            input.addEventListener('change', () => this.onFormChange(input));
        });

        // 每30秒自动保存
        setInterval(() => {
            if (this.pendingChanges) {
                this.saveWorldData();
                this.pendingChanges = false;
            }
        }, 30000);
    }

    onFormChange(input) {
        this.pendingChanges = true;
        input.classList.add('changed');
        input.classList.remove('saved');

        // 清除之前的定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // 2秒后自动保存
        this.autoSaveTimer = setTimeout(() => {
            this.saveWorldData();
            input.classList.remove('changed');
            input.classList.add('saved');
            setTimeout(() => input.classList.remove('saved'), 2000);
        }, 2000);
    }

    showAutoSaveIndicator() {
        let indicator = document.querySelector('.auto-save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator';
            indicator.innerHTML = '<span class="save-dot"></span><span class="save-text">已自动保存</span>';
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                navActions.insertBefore(indicator, navActions.firstChild);
            }
        }
        indicator.classList.add('saving');
        setTimeout(() => indicator.classList.remove('saving'), 1000);
    }

    // ==================== 事件绑定 ====================

    bindEvents() {
        // 侧边栏导航
        document.querySelectorAll('.nav-item[data-panel]').forEach(item => {
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

        const aiExpandStoryBtn = document.getElementById('aiExpandStory');
        if (aiExpandStoryBtn) {
            aiExpandStoryBtn.addEventListener('click', () => this.aiExpandStory());
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
                this.pendingChanges = true;
            });
        });

        // 选项样式
        document.querySelectorAll('.option-style-preview').forEach(style => {
            style.addEventListener('click', (e) => {
                document.querySelectorAll('.option-style-preview').forEach(s => s.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.pendingChanges = true;
            });
        });

        // 快速创建角色
        const quickCreateCharBtn = document.getElementById('quickCreateChar');
        if (quickCreateCharBtn) {
            quickCreateCharBtn.addEventListener('click', () => this.quickCreateCharacter());
        }

        // 添加物品
        const addItemCard = document.getElementById('addItemCard');
        if (addItemCard) {
            addItemCard.addEventListener('click', () => this.openItemEditor());
        }
    }

    // ==================== 面板切换 ====================

    switchPanel(panelId) {
        if (this.currentPanel === panelId && this.renderedPanels.has(panelId)) return;
        this.saveWorldData();

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.panel === panelId) {
                item.classList.add('active');
            }
        });

        document.querySelectorAll('.panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const targetPanel = document.getElementById(`panel-${panelId}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        this.currentPanel = panelId;

        if (!this.renderedPanels.has(panelId)) {
            this.updatePreviewForPanel(panelId);
            this.renderedPanels.add(panelId);
        }
    }

    updatePreviewForPanel(panelId) {
        if (panelId === 'visual-style') {
            this.switchPreview('images');
        } else if (panelId === 'story') {
            this.switchPreview('flow');
        } else if (panelId.startsWith('social-')) {
            this.renderSocialPanel(panelId);
        } else if (panelId.startsWith('market-')) {
            this.renderMarketPanel(panelId);
        } else if (panelId.startsWith('growth-')) {
            this.renderGrowthPanel(panelId);
        } else {
            this.switchPreview('video');
        }
    }

    // ==================== 社交面板渲染 ====================

    renderSocialPanel(panelId) {
        if (panelId === 'social-friends') this._renderFriendsPanel();
        else if (panelId === 'social-guilds') this._renderGuildsPanel();
        else if (panelId === 'social-leaderboard') this._renderLeaderboardPanel();
    }

    _renderFriendsPanel() {
        const container = document.getElementById('socialFriendsContent');
        if (!container) return;
        const friends = this.social.getFriends();
        const activity = this.social.getActivityFeed(10);
        const iconMap = { achievement: '🏆', trade: '💼', level: '⬆️', guild: '🏰', create: '📖', social: '🤝', auction: '🔨', war: '⚔️' };
        
        container.innerHTML = `
            <div class="social-layout">
                <div class="social-main">
                    <div class="form-group">
                        <label>在线好友 (${this.social.getOnlineFriends().length}/${friends.length})</label>
                        <div class="friend-list">
                            ${friends.map(f => `
                                <div class="friend-card">
                                    <div class="friend-avatar" style="background:${f.avatarGradient}">${f.name[0]}</div>
                                    <div class="friend-info">
                                        <div class="friend-name">${f.name} <span class="status-dot ${f.status}"></span></div>
                                        <div class="friend-meta">
                                            <span>${f.relationLabel} · ${f.relationshipValue}♥</span>
                                            <span>${f.world || '未知世界'}</span>
                                        </div>
                                        <div class="friend-tags">${(f.tags||[]).map(t=>`<span class="tag-sm">${t}</span>`).join('')}</div>
                                    </div>
                                    <div class="friend-actions">
                                        <button class="btn btn-secondary btn-sm" onclick="editor.social.sendMessage('${f.userId}','${f.name}','你好！')">💬</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <button class="btn btn-secondary" id="addFriendBtn" style="margin-top:12px;" onclick="editor._showAddFriendDialog()">
                        <span>+</span> 添加好友
                    </button>
                </div>
                <div class="social-sidebar">
                    <h3>最近动态</h3>
                    <div class="activity-feed">
                        ${activity.map(a => `
                            <div class="activity-item">
                                <span class="activity-icon">${iconMap[a.type] || '📌'}</span>
                                <div class="activity-content">
                                    <strong>${a.userName}</strong> ${a.content}
                                </div>
                                <div class="activity-time">${this._formatTimeAgo(a.time)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    _renderGuildsPanel() {
        const container = document.getElementById('socialGuildsContent');
        if (!container) return;
        const guilds = this.social.getGuilds();
        const myGuild = guilds.find(g => g.members.some(m => m.userId === 'current_user'));

        container.innerHTML = `
            <div class="social-layout">
                <div class="social-main">
                    ${myGuild ? `
                    <div class="my-guild-card">
                        <div class="guild-banner" style="background:${myGuild.emblem}">
                            <h3>[${myGuild.tag}] ${myGuild.name}</h3>
                            <span class="guild-level">Lv.${myGuild.level}</span>
                        </div>
                        <div class="guild-stats">
                            <div class="guild-stat"><span>👥</span> ${myGuild.memberCount}/${myGuild.maxMembers} 成员</div>
                            <div class="guild-stat"><span>🏆</span> 排名 #${myGuild.rank || '-'}</div>
                            <div class="guild-stat"><span>⚔️</span> ${myGuild.wars.won}胜 ${myGuild.wars.lost}负</div>
                        </div>
                        <p class="guild-desc">${myGuild.description}</p>
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label>全部公会</label>
                        <div class="guild-list">
                            ${guilds.map(g => `
                                <div class="guild-item">
                                    <div class="guild-emblem" style="background:${g.emblem}">${g.name[0]}</div>
                                    <div class="guild-info">
                                        <div class="guild-name">[${g.tag}] ${g.name} <span class="guild-level-sm">Lv.${g.level}</span></div>
                                        <div class="guild-meta">${g.memberCount}成员 · 排名#${g.rank||'-'}</div>
                                    </div>
                                    <button class="btn btn-primary btn-sm">加入</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderLeaderboardPanel() {
        const container = document.getElementById('socialLeaderboardContent');
        if (!container) return;
        const categories = [
            { id: 'level', name: '等级排行', icon: '⬆️' },
            { id: 'wealth', name: '财富排行', icon: '💰' },
            { id: 'guild', name: '公会排行', icon: '🏰' },
            { id: 'creation', name: '创作排行', icon: '🎨' }
        ];

        container.innerHTML = `
            <div class="leaderboard-tabs">
                ${categories.map(c => `<button class="lb-tab ${c.id==='level'?'active':''}" data-lb="${c.id}" onclick="editor._switchLeaderboard('${c.id}')">${c.icon} ${c.name}</button>`).join('')}
            </div>
            <div class="leaderboard-content" id="leaderboardContent">
                ${this._renderLeaderboardList('level')}
            </div>
        `;
    }

    _switchLeaderboard(category) {
        document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-lb="${category}"]`)?.classList.add('active');
        const content = document.getElementById('leaderboardContent');
        if (content) content.innerHTML = this._renderLeaderboardList(category);
    }

    _renderLeaderboardList(category) {
        const entries = this.social.getLeaderboard(category);
        return entries.map((e, i) => `
            <div class="lb-item ${i < 3 ? 'top-' + (i + 1) : ''}">
                <div class="lb-rank">${i < 3 ? ['🥇', '🥈', '🥉'][i] : '#' + (i + 1)}</div>
                <div class="lb-avatar" style="background:${randomGrad()}">${e.name[0]}</div>
                <div class="lb-info">
                    <div class="lb-name">${e.name}</div>
                    <div class="lb-detail">${e.detail}</div>
                </div>
                <div class="lb-score">${typeof e.score === 'number' && e.score > 1000 ? (e.score / 1000).toFixed(1) + 'K' : e.score}</div>
            </div>
        `).join('');
    }

    // ==================== 市场面板渲染 ====================

    renderMarketPanel(panelId) {
        if (panelId === 'market-listings') this._renderMarketListings();
        else if (panelId === 'market-auctions') this._renderMarketAuctions();
        else if (panelId === 'market-creator') this._renderCreatorCenter();
    }

    _renderMarketListings() {
        const container = document.getElementById('marketListingsContent');
        if (!container) return;
        const listings = this.tradingMarket.getAllListings();
        const stats = this.tradingMarket.getMarketStats();

        container.innerHTML = `
            <div class="market-stats-bar">
                <div class="market-stat"><span>${stats.totalListings}</span> 在售</div>
                <div class="market-stat"><span>${stats.totalSellers}</span> 创作者</div>
                <div class="market-stat"><span>${stats.averagePrice.toFixed(0)}¢</span> 均价</div>
            </div>
            <div class="market-filters">
                <input type="text" class="form-input" placeholder="搜索市场..." id="marketSearch" oninput="editor._debouncedFilter()">
                <select class="form-select" id="marketSort" onchange="editor._filterMarketListings()">
                    <option value="newest">最新上架</option>
                    <option value="price_asc">价格从低到高</option>
                    <option value="price_desc">价格从高到低</option>
                    <option value="rating">评分最高</option>
                    <option value="sales">销量最多</option>
                </select>
            </div>
            <div class="market-grid" id="marketGrid">
                ${listings.map(l => this._marketCardHTML(l)).join('')}
            </div>
        `;
    }

    _renderMarketAuctions() {
        const container = document.getElementById('marketAuctionsContent');
        if (!container) return;
        const auctions = this.tradingMarket.getActiveAuctions();

        container.innerHTML = `
            <div class="auction-list">
                ${auctions.map(a => {
                    const timeLeft = Math.max(0, new Date(a.endsAt) - new Date());
                    const hoursLeft = Math.ceil(timeLeft / 3600000);
                    return `
                    <div class="auction-card">
                        <div class="auction-header" style="background:${randomGrad()}">
                            <h4>${a.name}</h4>
                            <span class="auction-badge">${a.rarity.toUpperCase()}</span>
                        </div>
                        <div class="auction-body">
                            <div class="auction-price-row">
                                <div><label>当前出价</label><span class="auction-bid">${a.currentBid.toLocaleString()}¢</span></div>
                                <div><label>起拍价</label><span>${a.startingBid.toLocaleString()}¢</span></div>
                                ${a.buyoutPrice ? `<div><label>一口价</label><span>${a.buyoutPrice.toLocaleString()}¢</span></div>` : ''}
                            </div>
                            <div class="auction-meta">
                                <span>👤 ${a.sellerName}</span>
                                <span>🔨 ${a.bidCount}次出价</span>
                                <span>⏰ ${hoursLeft}小时后结束</span>
                            </div>
                        </div>
                        <div class="auction-footer">
                            <button class="btn btn-primary btn-sm" onclick="editor._placeBid('${a.id}')">出价</button>
                            ${a.buyoutPrice ? `<button class="btn btn-secondary btn-sm" onclick="editor._buyNowAuction('${a.id}')">一口价</button>` : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    }

    _renderCreatorCenter() {
        const container = document.getElementById('marketCreatorContent');
        if (!container) return;
        const stats = this.tradingMarket.getCreatorStats('current_user');

        container.innerHTML = `
            <div class="creator-stats">
                <div class="creator-stat-card">
                    <div class="stat-value">${stats.totalListings}</div>
                    <div class="stat-label">总上架数</div>
                </div>
                <div class="creator-stat-card">
                    <div class="stat-value">${stats.totalSold}</div>
                    <div class="stat-label">已售出</div>
                </div>
                <div class="creator-stat-card highlight">
                    <div class="stat-value">${stats.totalRevenue.toLocaleString()}¢</div>
                    <div class="stat-label">总收益</div>
                </div>
                <div class="creator-stat-card">
                    <div class="stat-value">${stats.averageRating.toFixed(1)}</div>
                    <div class="stat-label">评分</div>
                </div>
            </div>
            <div class="creator-info-box">
                <h3>创作者收益分配</h3>
                <div class="revenue-breakdown">
                    <div class="revenue-item">
                        <div class="revenue-bar" style="width:70%"><span>创作者 70%</span></div>
                    </div>
                    <div class="revenue-item">
                        <div class="revenue-bar secondary" style="width:25%"><span>平台 25%</span></div>
                    </div>
                    <div class="revenue-item">
                        <div class="revenue-bar tertiary" style="width:5%"><span>推荐 5%</span></div>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" style="margin-top:16px;" onclick="editor._showListDialog()">上架新物品</button>
        `;
    }

    _filterMarketListings() {
        const queryEl = this.dom.marketSearch?.() || document.getElementById('marketSearch');
        const sortEl = this.dom.marketSort?.() || document.getElementById('marketSort');
        const grid = this.dom.marketGrid?.() || document.getElementById('marketGrid');
        if (!grid) return;
        const query = queryEl?.value || '';
        const sortBy = sortEl?.value || 'newest';
        const results = this.tradingMarket.filterListings({ sortBy });
        const filtered = query ? results.filter(l =>
            l.name.toLowerCase().includes(query.toLowerCase()) ||
            (l.tags || []).some(t => t.toLowerCase().includes(query.toLowerCase()))
        ) : results;
        grid.innerHTML = filtered.map(l => this._marketCardHTML(l)).join('');
    }

    _marketCardHTML(l) {
        const typeIcons = { character: '👤', world: '🌍', equipment: '⚔️', playset: '🎮' };
        const typeLabels = { character: '角色卡', world: '世界书', equipment: '装备', playset: '玩法集' };
        const rarityColors = { common: '#a1a1aa', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' };
        return `
            <div class="market-card" onclick="editor._buyItem('${l.id}')">
                <div class="market-card-header" style="background:${randomGrad()}">
                    <span class="market-type-badge">${typeIcons[l.type] || '📦'} ${typeLabels[l.type] || l.type}</span>
                    <span class="market-rarity" style="color:${rarityColors[l.rarity] || '#a1a1aa'}">${l.rarity.toUpperCase()}</span>
                </div>
                <div class="market-card-body">
                    <h4>${l.name}</h4>
                    <p>${(l.description || '').substring(0, 60)}...</p>
                    <div class="market-card-meta">
                        <span>👤 ${l.sellerName}</span>
                        <span>⭐ ${(l.rating || 0).toFixed(1)}</span>
                        ${l.salesCount ? `<span>📦 ${l.salesCount}售出</span>` : ''}
                    </div>
                </div>
                <div class="market-card-footer">
                    <span class="market-price">${(l.price || 0).toLocaleString()}¢</span>
                    <button class="btn btn-primary btn-sm">立即购买</button>
                </div>
            </div>`;
    }

    _buyItem(listingId) {
        const listing = this.tradingMarket.getListing(listingId);
        if (!listing) return;
        if (confirm(`确定购买 "${listing.name}" 吗？价格：${listing.price.toLocaleString()}¢`)) {
            const txn = this.tradingMarket.buyItem(listingId, 'current_user', '我');
            if (txn) {
                this.showToast(`购买成功！创作者将获得 ${txn.creatorRevenue.toLocaleString()}¢`, 'success');
                this.renderMarketPanel('market-listings');
            }
        }
    }

    _placeBid(auctionId) {
        const amount = prompt('请输入出价金额（¢）：');
        if (!amount || isNaN(amount)) return;
        const result = this.tradingMarket.placeBid(auctionId, 'current_user', '我', parseInt(amount));
        if (result) {
            this.showToast(`出价成功！${parseInt(amount).toLocaleString()}¢`, 'success');
            this.renderMarketPanel('market-auctions');
        } else {
            this.showToast('出价失败，请检查金额', 'error');
        }
    }

    _buyNowAuction(auctionId) {
        if (confirm('确定以一口价购买吗？')) {
            const result = this.tradingMarket.buyNowAuction(auctionId, 'current_user', '我');
            if (result) this.showToast('一口价购买成功！');
            this.renderMarketPanel('market-auctions');
        }
    }

    _showListDialog() {
        const name = prompt('物品名称：');
        if (!name) return;
        const price = parseInt(prompt('价格（¢）：', '1000'));
        if (!price) return;
        const type = prompt('类型 (character/world/equipment/playset)：', 'character');
        const listing = this.tradingMarket.listItem({
            name, price, type: type || 'character',
            rarity: 'common', description: name + ' - 创作者上架',
            sellerId: 'current_user', sellerName: '我', tags: []
        });
        if (listing) {
            this.showToast(`"${name}" 已上架市场！`);
            this.renderMarketPanel('market-listings');
        }
    }

    _showAddFriendDialog() {
        const name = prompt('请输入好友名称：');
        if (!name) return;
        const id = 'friend_' + Date.now();
        const friend = this.social.addFriend(id, name);
        if (friend) {
            this.showToast(`已添加好友 "${name}"`);
            this.renderSocialPanel('social-friends');
        }
    }

    // ==================== 成长面板渲染 ====================

    renderGrowthPanel(panelId) {
        if (panelId === 'growth-skills') this._renderSkillsPanel();
        else if (panelId === 'growth-equipment') this._renderEquipmentPanel();
    }

    _renderSkillsPanel() {
        const container = document.getElementById('growthSkillsContent');
        if (!container) return;
        const sampleChar = { 
            id: 'sample', name: '夜行者', 
            growth: { level: 42, experience: 3500, experienceToNext: 8500, skillPoints: 3, attributePoints: 5 },
            skillTree: { combat: { level: 5, skills: [{ id: 'powerStrike', level: 5 }, { id: 'whirlwind', level: 2 }] } },
            attributes: { hp: 450, attack: 85, defense: 60, speed: 55, intelligence: 70, charisma: 40, luck: 25 }
        };
        const progress = this.characterGrowth.getLevelProgress(sampleChar);
        const skillTrees = this.characterGrowth.getSkillTreeForCharacter(sampleChar);

        container.innerHTML = `
            <div class="growth-header-card">
                <div class="growth-char-info">
                    <div class="growth-avatar" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">夜</div>
                    <div>
                        <h3>夜行者</h3>
                        <div class="growth-level">Lv.${progress.level}</div>
                    </div>
                </div>
                <div class="growth-progress-bar">
                    <div class="progress-label">经验值 ${progress.experience.toLocaleString()} / ${progress.experienceToNext.toLocaleString()}</div>
                    <div class="progress-track">
                        <div class="progress-fill-gold" style="width:${progress.progress}%"></div>
                    </div>
                </div>
                <div class="growth-points">
                    <span>技能点: <strong>${sampleChar.growth.skillPoints}</strong></span>
                    <span>属性点: <strong>${sampleChar.growth.attributePoints}</strong></span>
                </div>
            </div>
            <div class="skill-trees">
                ${skillTrees.map(tree => `
                    <div class="skill-tree-card">
                        <div class="skill-tree-header">
                            <span>${tree.icon}</span>
                            <h4>${tree.name}</h4>
                            <span class="tree-level">Lv.${tree.level}</span>
                        </div>
                        <div class="skill-list">
                            ${tree.skills.map(skill => `
                                <div class="skill-item ${skill.currentLevel > 0 ? 'learned' : ''}">
                                    <div class="skill-info">
                                        <div class="skill-name">${skill.name}</div>
                                        <div class="skill-desc">${skill.description}</div>
                                        ${skill.currentLevel > 0 ? `<div class="skill-level-bar">${Array(skill.maxLevel).fill(0).map((_,i) => `<span class="skill-dot ${i < skill.currentLevel ? 'filled' : ''}"></span>`).join('')}</div>` : ''}
                                    </div>
                                    <button class="btn btn-sm ${skill.currentLevel > 0 ? 'btn-secondary' : 'btn-primary'}" ${skill.currentLevel >= skill.maxLevel ? 'disabled' : ''}>
                                        ${skill.currentLevel >= skill.maxLevel ? 'MAX' : skill.currentLevel > 0 ? '升级' : '学习'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    _renderEquipmentPanel() {
        const container = document.getElementById('growthEquipmentContent');
        if (!container) return;
        const slots = [
            { id: 'weapon', name: '武器', icon: '⚔️', item: { name: '电磁脉冲刀', rarity: 'rare', stats: { attack: 85, emp: 30 }, durability: 85, maxDurability: 100 } },
            { id: 'head', name: '头盔', icon: '⛑️', item: { name: '战术目镜', rarity: 'epic', stats: { defense: 25, intelligence: 15 }, durability: 92, maxDurability: 100 } },
            { id: 'chest', name: '上衣', icon: '👕', item: { name: '纳米纤维甲', rarity: 'rare', stats: { defense: 40, hp: 80 }, durability: 78, maxDurability: 100 } },
            { id: 'legs', name: '下装', icon: '👖', item: { name: '机动护腿', rarity: 'common', stats: { defense: 18, speed: 10 }, durability: 95, maxDurability: 100 } },
            { id: 'boots', name: '鞋子', icon: '👢', item: { name: '磁力靴', rarity: 'rare', stats: { speed: 25, defense: 10 }, durability: 90, maxDurability: 100 } },
            { id: 'accessory1', name: '饰品1', icon: '💍', item: { name: '暗影戒指', rarity: 'epic', stats: { luck: 20, stealth: 15 }, durability: 88, maxDurability: 100 } },
            { id: 'accessory2', name: '饰品2', icon: '📿', item: { name: '数据护符', rarity: 'rare', stats: { intelligence: 20 }, durability: 93, maxDurability: 100 } },
            { id: 'pet', name: '宠物', icon: '🐾', item: null }
        ];
        const rarityColors = { common: '#a1a1aa', rare: '#3b82f6', epic: '#8b5cf6', legendary: '#f59e0b' };

        container.innerHTML = `
            <div class="equipment-grid">
                ${slots.map(s => `
                    <div class="equipment-slot ${s.item ? 'occupied' : 'empty'}">
                        <div class="slot-header">
                            <span class="slot-icon">${s.icon}</span>
                            <span class="slot-name">${s.name}</span>
                        </div>
                        ${s.item ? `
                            <div class="slot-item">
                                <div class="slot-item-name" style="color:${rarityColors[s.item.rarity]||'#a1a1aa'}">${s.item.name}</div>
                                <div class="slot-item-rarity">${({common:'普通',rare:'稀有',epic:'史诗',legendary:'传说'})[s.item.rarity]||'普通'}</div>
                                <div class="slot-item-stats">
                                    ${Object.entries(s.item.stats||{}).map(([k,v])=>`<span>${k}+${v}</span>`).join('')}
                                </div>
                                <div class="slot-durability">
                                    <div class="durability-bar"><div class="durability-fill" style="width:${s.item.durability}%"></div></div>
                                    <span>${s.item.durability}/${s.item.maxDurability}</span>
                                </div>
                            </div>
                        ` : `
                            <div class="slot-empty">
                                <span>空</span>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
            <div class="equipment-total-stats">
                <h4>总属性加成</h4>
                <div class="total-stats-grid">
                    <div class="total-stat"><span>⚔️</span> 攻击 +85</div>
                    <div class="total-stat"><span>🛡️</span> 防御 +93</div>
                    <div class="total-stat"><span>💨</span> 速度 +35</div>
                    <div class="total-stat"><span>🧠</span> 智力 +35</div>
                    <div class="total-stat"><span>❤️</span> 生命 +80</div>
                    <div class="total-stat"><span>🍀</span> 幸运 +20</div>
                </div>
            </div>
        `;
    }

    _formatTimeAgo(timeStr) {
        const diff = Date.now() - new Date(timeStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '刚刚';
        if (mins < 60) return mins + '分钟前';
        const hours = Math.floor(mins / 60);
        if (hours < 24) return hours + '小时前';
        return Math.floor(hours / 24) + '天前';
    }

    // ==================== 预览切换 ====================

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

    // ==================== 工作流 ====================

    initWorkflow() {
        this.updateWorkflowUI();
    }

    switchWorkflowStep(stepNum) {
        this.currentWorkflowStep = parseInt(stepNum);
        this.updateWorkflowUI();
    }

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

    // ==================== 滑块 ====================

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
                    } else if (e.target.id === 'keyframeCount') {
                        display.textContent = value;
                    } else if (e.target.id === 'commonDropRate' || e.target.id === 'rareDropRate') {
                        display.textContent = value + '%';
                    } else {
                        display.textContent = value;
                    }
                }
                this.pendingChanges = true;
            });
        });
    }

    // ==================== 标签输入 ====================

    initTagInputs() {
        document.querySelectorAll('.tag-input').forEach(container => {
            const input = container.querySelector('input');
            if (!input) return;

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    e.preventDefault();
                    this.addTag(container, input.value.trim());
                    input.value = '';
                }
            });

            // 绑定已有标签的关闭按钮
            container.querySelectorAll('.tag-close').forEach(closeBtn => {
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.target.closest('.tag').remove();
                    this.pendingChanges = true;
                });
            });
        });
    }

    addTag(container, text) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${text}<span class="tag-close">×</span>`;
        tag.querySelector('.tag-close').addEventListener('click', (e) => {
            e.stopPropagation();
            tag.remove();
            this.pendingChanges = true;
        });
        container.insertBefore(tag, container.querySelector('input'));
        this.pendingChanges = true;
    }

    // ==================== 动态列表 ====================

    initDynamicLists() {
        // 自定义规则
        const addCustomRuleBtn = document.getElementById('addCustomRule');
        if (addCustomRuleBtn) {
            addCustomRuleBtn.addEventListener('click', () => this.addCustomRule());
        }

        // 区域
        const addRegionBtn = document.getElementById('addRegion');
        if (addRegionBtn) {
            addRegionBtn.addEventListener('click', () => this.addRegion());
        }

        // 势力
        const addFactionBtn = document.getElementById('addFaction');
        if (addFactionBtn) {
            addFactionBtn.addEventListener('click', () => this.addFaction());
        }

        // 剧情节点
        const addStoryNodeBtn = document.getElementById('addStoryNode');
        if (addStoryNodeBtn) {
            addStoryNodeBtn.addEventListener('click', () => this.addStoryNode());
        }

        // 结局
        const addEndingBtn = document.getElementById('addEnding');
        if (addEndingBtn) {
            addEndingBtn.addEventListener('click', () => this.addEnding());
        }
    }

    addCustomRule() {
        const list = document.getElementById('customRulesList');
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.innerHTML = `
            <input type="text" class="form-input" placeholder="规则名称">
            <textarea class="form-textarea" rows="2" placeholder="规则描述"></textarea>
            <button class="btn-icon-sm" onclick="editor.removeDynamicItem(this)" title="删除">🗑️</button>
        `;
        list.appendChild(item);
        this.pendingChanges = true;
    }

    addRegion() {
        const list = document.getElementById('regionList');
        const item = document.createElement('div');
        item.className = 'dynamic-item region-item-card';
        item.innerHTML = `
            <div class="region-header">
                <input type="text" class="form-input" placeholder="区域名称">
                <select class="form-select region-type">
                    <option value="city">城市</option>
                    <option value="wilderness">荒野</option>
                    <option value="dungeon">地下城</option>
                    <option value="special">特殊区域</option>
                </select>
                <button class="btn-icon-sm" onclick="editor.removeDynamicItem(this)" title="删除">🗑️</button>
            </div>
            <textarea class="form-textarea" rows="2" placeholder="区域描述"></textarea>
            <div class="region-tags">
                <span class="tag">新区域<span class="tag-close" onclick="this.parentElement.remove()">×</span></span>
            </div>
        `;
        list.appendChild(item);
        this.pendingChanges = true;
    }

    addFaction() {
        const list = document.getElementById('factionList');
        const item = document.createElement('div');
        item.className = 'dynamic-item faction-item-card';
        item.innerHTML = `
            <div class="faction-header">
                <input type="text" class="form-input" placeholder="势力名称">
                <select class="form-select faction-alignment">
                    <option value="friendly">友好</option>
                    <option value="neutral" selected>中立</option>
                    <option value="hostile">敌对</option>
                </select>
                <button class="btn-icon-sm" onclick="editor.removeDynamicItem(this)" title="删除">🗑️</button>
            </div>
            <textarea class="form-textarea" rows="2" placeholder="势力描述"></textarea>
            <div class="faction-meta">
                <input type="text" class="form-input" placeholder="势力领袖">
                <input type="text" class="form-input" placeholder="势力规模">
            </div>
        `;
        list.appendChild(item);
        this.pendingChanges = true;
    }

    addStoryNode() {
        const list = document.getElementById('storyNodesList');
        const nodeCount = list.querySelectorAll('.story-node-card').length + 1;
        const nodeId = `node_${Date.now()}`;
        const item = document.createElement('div');
        item.className = 'story-node-card';
        item.dataset.nodeId = nodeId;
        item.innerHTML = `
            <div class="node-number">${nodeCount}</div>
            <div class="node-info">
                <input type="text" class="form-input" placeholder="节点名称">
                <textarea class="form-textarea" rows="2" placeholder="节点描述"></textarea>
            </div>
            <div class="node-actions">
                <button class="btn-icon-sm" title="编辑选项" onclick="editor.editNodeOptions('${nodeId}')">⚙️</button>
                <button class="btn-icon-sm" title="生成视频" onclick="videoOverlay.open({name:'新节点',description:''})">🎬</button>
                <button class="btn-icon-sm" title="删除" onclick="editor.removeStoryNode(this)">🗑️</button>
            </div>
        `;
        list.appendChild(item);
        this.updateNodeNumbers();
        this.pendingChanges = true;
    }

    addEnding() {
        const list = document.getElementById('endingsList');
        const item = document.createElement('div');
        item.className = 'dynamic-item ending-card';
        item.innerHTML = `
            <input type="text" class="form-input" placeholder="结局名称">
            <select class="form-select ending-type">
                <option value="good">好结局</option>
                <option value="bad">坏结局</option>
                <option value="neutral" selected>普通结局</option>
                <option value="secret">隐藏结局</option>
            </select>
            <textarea class="form-textarea" rows="2" placeholder="结局描述"></textarea>
            <button class="btn-icon-sm" onclick="editor.removeDynamicItem(this)" title="删除">🗑️</button>
        `;
        list.appendChild(item);
        this.pendingChanges = true;
    }

    removeDynamicItem(btn) {
        const item = btn.closest('.dynamic-item');
        if (item) {
            item.remove();
            this.pendingChanges = true;
            // 如果是剧情节点，重新编号
            if (item.closest('#storyNodesList')) {
                this.updateNodeNumbers();
            }
        }
    }

    removeStoryNode(btn) {
        const card = btn.closest('.story-node-card');
        if (card) {
            card.remove();
            this.updateNodeNumbers();
            this.pendingChanges = true;
        }
    }

    updateNodeNumbers() {
        const nodes = document.querySelectorAll('#storyNodesList .story-node-card');
        nodes.forEach((node, index) => {
            const numEl = node.querySelector('.node-number');
            if (numEl) numEl.textContent = index + 1;
        });
    }

    editNodeOptions(nodeId) {
        const card = document.querySelector(`[data-node-id="${nodeId}"]`);
        const nodeName = card ? card.querySelector('.form-input').value : '节点';

        // 创建选项编辑弹窗
        const modal = document.createElement('div');
        modal.className = 'modal active node-options-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content modal-content-md">
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="asset-editor">
                    <h3>编辑选项 - ${nodeName}</h3>
                    <div class="options-list">
                        <div class="option-row">
                            <input type="text" class="form-input" placeholder="选项文本" value="前往核心区">
                            <input type="text" class="form-input" placeholder="目标节点" value="node_core">
                            <input type="text" class="form-input" placeholder="条件" value="潜行>=50">
                            <button class="btn-icon-sm" onclick="this.closest('.option-row').remove()">🗑️</button>
                        </div>
                        <div class="option-row">
                            <input type="text" class="form-input" placeholder="选项文本" value="前往工业区">
                            <input type="text" class="form-input" placeholder="目标节点" value="node_industry">
                            <input type="text" class="form-input" placeholder="条件" value="无">
                            <button class="btn-icon-sm" onclick="this.closest('.option-row').remove()">🗑️</button>
                        </div>
                    </div>
                    <button class="btn btn-secondary" onclick="editor.addOptionRow(this)">
                        <span>+</span> 添加选项
                    </button>
                    <div class="editor-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="button" class="btn btn-primary" onclick="editor.saveNodeOptions(this, '${nodeId}')">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    addOptionRow(btn) {
        const list = btn.previousElementSibling;
        const row = document.createElement('div');
        row.className = 'option-row';
        row.innerHTML = `
            <input type="text" class="form-input" placeholder="选项文本">
            <input type="text" class="form-input" placeholder="目标节点">
            <input type="text" class="form-input" placeholder="条件">
            <button class="btn-icon-sm" onclick="this.closest('.option-row').remove()">🗑️</button>
        `;
        list.appendChild(row);
    }

    saveNodeOptions(btn, nodeId) {
        this.showToast('选项已保存');
        btn.closest('.modal').remove();
        this.pendingChanges = true;
    }

    // ==================== 预览控制 ====================

    initPreviewControls() {
        const playBtn = document.querySelector('.play-button');
        if (playBtn) {
            playBtn.addEventListener('click', () => this.toggleVideoPlay());
        }

        const prevBtn = document.querySelector('.video-controls .control-btn:nth-child(1)');
        const pauseBtn = document.querySelector('.video-controls .control-btn:nth-child(2)');
        const nextBtn = document.querySelector('.video-controls .control-btn:nth-child(3)');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevFrame());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.toggleVideoPlay());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextFrame());

        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.addEventListener('click', (e) => this.seekVideo(e));
        }
    }

    toggleVideoPlay() {
        const playBtn = document.querySelector('.play-button');
        const pauseBtn = document.querySelector('.video-controls .control-btn:nth-child(2)');

        if (this.isPlaying) {
            this.isPlaying = false;
            if (playBtn) playBtn.textContent = '▶';
            if (pauseBtn) pauseBtn.textContent = '⏯';
            this.showToast('暂停播放');
        } else {
            this.isPlaying = true;
            if (playBtn) playBtn.textContent = '⏸';
            if (pauseBtn) pauseBtn.textContent = '⏸';
            this.showToast('开始播放');
            this.simulateVideoProgress();
        }
    }

    simulateVideoProgress() {
        if (!this.isPlaying) return;
        const progressFill = document.querySelector('.progress-fill');
        const timeEl = document.querySelector('.time');
        if (progressFill && timeEl) {
            let currentWidth = parseFloat(progressFill.style.width) || 35;
            if (currentWidth >= 100) currentWidth = 0;
            currentWidth += 0.5;
            progressFill.style.width = currentWidth + '%';

            const totalSeconds = 90;
            const currentSeconds = Math.floor((currentWidth / 100) * totalSeconds);
            const mins = Math.floor(currentSeconds / 60);
            const secs = currentSeconds % 60;
            timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')} / 1:30`;

            if (currentWidth < 100) {
                requestAnimationFrame(() => this.simulateVideoProgress());
            } else {
                this.isPlaying = false;
                const playBtn = document.querySelector('.play-button');
                if (playBtn) playBtn.textContent = '▶';
            }
        }
    }

    prevFrame() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            let currentWidth = parseFloat(progressFill.style.width) || 35;
            progressFill.style.width = Math.max(0, currentWidth - 10) + '%';
        }
        this.showToast('上一帧');
    }

    nextFrame() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            let currentWidth = parseFloat(progressFill.style.width) || 35;
            progressFill.style.width = Math.min(100, currentWidth + 10) + '%';
        }
        this.showToast('下一帧');
    }

    seekVideo(e) {
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const progressFill = progressBar.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = (percent * 100) + '%';
        }
    }

    // ==================== 图片画廊 ====================

    initGalleryThumbs() {
        document.querySelectorAll('.gallery-thumbs .thumb').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                document.querySelectorAll('.gallery-thumbs .thumb').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // 更新主图
                const mainImg = document.querySelector('.gallery-main img');
                const thumbImg = e.currentTarget.querySelector('img');
                if (mainImg && thumbImg) {
                    mainImg.src = thumbImg.src.replace(/w=100&h=75/, 'w=600&h=400');
                }

                // 更新信息
                const infoSpans = document.querySelectorAll('.image-info span');
                const thumbs = document.querySelectorAll('.gallery-thumbs .thumb');
                const index = Array.from(thumbs).indexOf(e.currentTarget) + 1;
                if (infoSpans[0]) infoSpans[0].textContent = `关键帧 ${index}/${thumbs.length}`;
            });
        });
    }

    // ==================== 颜色选择器 ====================

    initColorPicker() {
        const customPicker = document.getElementById('customColorPicker');
        if (customPicker) {
            customPicker.addEventListener('input', (e) => {
                const color = e.target.value;
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));

                // 检查是否匹配预设颜色
                let matched = false;
                document.querySelectorAll('.color-option').forEach(opt => {
                    const rgb = this.hexToRgb(color);
                    const bg = window.getComputedStyle(opt).backgroundColor;
                    if (this.colorsMatch(rgb, bg)) {
                        opt.classList.add('active');
                        matched = true;
                    }
                });

                if (!matched) {
                    // 创建临时选中状态
                    customPicker.style.boxShadow = `0 0 0 3px ${color}`;
                }
                this.pendingChanges = true;
            });
        }

        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
                e.currentTarget.classList.add('active');
                const bg = window.getComputedStyle(e.currentTarget).backgroundColor;
                if (customPicker) {
                    customPicker.value = this.rgbToHex(bg);
                    customPicker.style.boxShadow = 'none';
                }
                this.pendingChanges = true;
            });
        });
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    rgbToHex(rgb) {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match) return '#000000';
        return '#' + [match[1], match[2], match[3]].map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    colorsMatch(rgb1, rgb2) {
        if (!rgb1) return false;
        const match2 = rgb2.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!match2) return false;
        const r = parseInt(match2[1]);
        const g = parseInt(match2[2]);
        const b = parseInt(match2[3]);
        const threshold = 30;
        return Math.abs(rgb1.r - r) < threshold &&
               Math.abs(rgb1.g - g) < threshold &&
               Math.abs(rgb1.b - b) < threshold;
    }

    // ==================== 视觉元素 ====================

    initVisualElements() {
        document.querySelectorAll('.checkbox-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                card.classList.toggle('active');
                const checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = card.classList.contains('active');
                this.pendingChanges = true;
            });
        });

        // 参考图
        document.querySelectorAll('.ref-image').forEach(img => {
            img.addEventListener('click', (e) => {
                if (img.id === 'addRefImage') {
                    this.addReferenceImage();
                    return;
                }
                if (!img.classList.contains('add-new')) {
                    document.querySelectorAll('.ref-image').forEach(i => {
                        i.classList.remove('active');
                        const overlay = i.querySelector('.ref-overlay');
                        if (overlay) overlay.remove();
                    });
                    img.classList.add('active');
                    if (!img.querySelector('.ref-overlay')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'ref-overlay';
                        overlay.textContent = '✓';
                        img.appendChild(overlay);
                    }
                    this.pendingChanges = true;
                }
            });
        });
    }

    addReferenceImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const container = document.getElementById('referenceImages');
                    const addBtn = document.getElementById('addRefImage');
                    const newImg = document.createElement('div');
                    newImg.className = 'ref-image';
                    newImg.innerHTML = `<img src="${event.target.result}" alt="参考图">`;
                    newImg.addEventListener('click', () => {
                        document.querySelectorAll('.ref-image').forEach(i => {
                            i.classList.remove('active');
                            const overlay = i.querySelector('.ref-overlay');
                            if (overlay) overlay.remove();
                        });
                        newImg.classList.add('active');
                        const overlay = document.createElement('div');
                        overlay.className = 'ref-overlay';
                        overlay.textContent = '✓';
                        newImg.appendChild(overlay);
                    });
                    container.insertBefore(newImg, addBtn);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    }

    // ==================== 地图上传 ====================

    initMapUpload() {
        const uploadArea = document.getElementById('mapUploadArea');
        const fileInput = document.getElementById('mapUploadInput');

        if (uploadArea && fileInput) {
            uploadArea.addEventListener('click', () => fileInput.click());

            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary)';
                uploadArea.style.background = 'var(--bg-hover)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '';
                uploadArea.style.background = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.background = '';
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    this.loadMapImage(file, uploadArea);
                }
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadMapImage(file, uploadArea);
                }
            });
        }
    }

    loadMapImage(file, container) {
        const reader = new FileReader();
        reader.onload = (e) => {
            container.innerHTML = `<img src="${e.target.result}" alt="世界地图">`;
            container.classList.add('has-image');
            this.pendingChanges = true;
        };
        reader.readAsDataURL(file);
    }

    // ==================== 物品分类 ====================

    initItemCategories() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.filterItemsByCategory(e.currentTarget.dataset.category);
            });
        });
    }

    filterItemsByCategory(category) {
        // 这里可以根据分类筛选物品
        this.showToast(`切换到分类: ${category}`);
    }

    // ==================== 预览按钮 ====================

    initPreviewButtons() {
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showToast('正在生成预览...');
                setTimeout(() => {
                    this.switchPreview('video');
                    this.showToast('预览已就绪');
                }, 500);
            });
        }

        const publishBtn = document.getElementById('publishBtn');
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.publishWorld());
        }
    }

    // ==================== 角色快速创建 ====================

    quickCreateCharacter() {
        const name = document.getElementById('quickCharName')?.value.trim();
        const role = document.getElementById('quickCharRole')?.value;
        const desc = document.getElementById('quickCharDesc')?.value.trim();

        if (!name) {
            this.showToast('请输入角色名称');
            return;
        }

        const charId = `char_${Date.now()}`;
        const roleLabels = {
            protagonist: '主角',
            supporting: '配角',
            antagonist: '反派',
            npc: 'NPC'
        };

        // 添加到角色网格
        const grid = document.getElementById('characterGrid');
        const addCard = grid.querySelector('.add-card');
        const newCard = document.createElement('div');
        newCard.className = 'character-card';
        newCard.dataset.charId = charId;
        newCard.innerHTML = `
            <div class="char-avatar" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">${name.charAt(0)}</div>
            <div class="char-info">
                <div class="char-name">${name}</div>
                <div class="char-role">${roleLabels[role] || 'NPC'} · 未分类</div>
                <div class="char-tags">
                    <span class="tag-sm">新角色</span>
                </div>
            </div>
            <div class="char-actions">
                <button class="btn-icon-sm" title="编辑" onclick="assetManager.editItem('${charId}')">✏️</button>
                <button class="btn-icon-sm" title="AI生成形象" onclick="assetManager.aiGenerateImage('${charId}')">🎨</button>
            </div>
        `;

        grid.insertBefore(newCard, addCard);

        // 清空表单
        if (document.getElementById('quickCharName')) document.getElementById('quickCharName').value = '';
        if (document.getElementById('quickCharDesc')) document.getElementById('quickCharDesc').value = '';

        this.showToast(`角色 "${name}" 创建成功`);
        this.pendingChanges = true;
    }

    // ==================== 物品编辑 ====================

    openItemEditor(itemId = null) {
        const isEdit = !!itemId;
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content modal-content-md">
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
                <div class="asset-editor">
                    <h3>${isEdit ? '编辑物品' : '新建物品'}</h3>
                    <form id="itemEditorForm">
                        <div class="form-group">
                            <label>物品名称 *</label>
                            <input type="text" class="form-input" name="name" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>分类</label>
                                <select class="form-select" name="category">
                                    <option value="weapon">武器</option>
                                    <option value="armor">防具</option>
                                    <option value="consumable">消耗品</option>
                                    <option value="key">关键道具</option>
                                    <option value="collectible">收集品</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>稀有度</label>
                                <select class="form-select" name="rarity">
                                    <option value="common">普通</option>
                                    <option value="rare">稀有</option>
                                    <option value="epic">史诗</option>
                                    <option value="legendary">传说</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>描述</label>
                            <textarea class="form-textarea" name="description" rows="2"></textarea>
                        </div>
                        <div class="form-group">
                            <label>属性（格式：名称+数值，逗号分隔）</label>
                            <input type="text" class="form-input" name="stats" placeholder="攻击+25, 暴击+10%">
                        </div>
                    </form>
                    <div class="editor-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button type="button" class="btn btn-primary" onclick="editor.saveItem(this)">保存</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveItem(btn) {
        const form = btn.closest('.modal-content').querySelector('form');
        const formData = new FormData(form);
        const name = formData.get('name');
        if (!name) {
            this.showToast('请输入物品名称');
            return;
        }

        // 创建新物品卡片
        const grid = document.getElementById('itemList');
        const addCard = grid.querySelector('.add-card');
        const itemId = `item_${Date.now()}`;
        const rarityLabels = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
        const rarityClass = formData.get('rarity') || 'common';
        const categoryIcons = { weapon: '⚔️', armor: '🛡️', consumable: '🧪', key: '🔑', collectible: '💎' };

        const newCard = document.createElement('div');
        newCard.className = 'item-card';
        newCard.dataset.itemId = itemId;
        newCard.innerHTML = `
            <div class="item-icon">${categoryIcons[formData.get('category')] || '📦'}</div>
            <div class="item-info">
                <div class="item-name">${name}</div>
                <div class="item-rarity ${rarityClass}">${rarityLabels[rarityClass]}</div>
                <div class="item-desc">${formData.get('description') || '暂无描述'}</div>
            </div>
            <div class="item-stats">
                ${(formData.get('stats') || '').split(',').map(s => s.trim() ? `<span>${s.trim()}</span>` : '').join('')}
            </div>
            <div class="item-actions">
                <button class="btn-icon-sm" title="编辑" onclick="editor.editItem('${itemId}')">✏️</button>
                <button class="btn-icon-sm" title="删除" onclick="editor.removeItem(this)">🗑️</button>
            </div>
        `;

        grid.insertBefore(newCard, addCard);
        btn.closest('.modal').remove();
        this.showToast(`物品 "${name}" 创建成功`);
        this.pendingChanges = true;
    }

    editItem(itemId) {
        this.openItemEditor(itemId);
    }

    removeItem(btn) {
        const card = btn.closest('.item-card');
        if (card) {
            const name = card.querySelector('.item-name')?.textContent || '物品';
            if (confirm(`确定要删除 "${name}" 吗？`)) {
                card.remove();
                this.showToast(`"${name}" 已删除`);
                this.pendingChanges = true;
            }
        }
    }

    // ==================== 发布 ====================

    async publishWorld() {
        this.saveWorldData();
        const btn = document.getElementById('publishBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>发布中...';

        await this.delay(2000);

        btn.disabled = false;
        btn.innerHTML = originalText;
        this.showToast('世界书发布成功！');
    }

    // ==================== AI功能 ====================

    async aiGenerateBasic() {
        const btn = document.getElementById('aiGenerateBasic');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> AI生成中...';

        await this.delay(2000);

        // 填充表单
        const nameInput = document.querySelector('#panel-basic input[type="text"]');
        if (nameInput) nameInput.value = '赛博朋克都市';

        const descInput = document.querySelectorAll('#panel-basic input[type="text"]')[1];
        if (descInput) descInput.value = '霓虹灯闪烁的雨夜，巨型公司统治着新上海';

        this.showToast('AI生成完成！已填充基础设定');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span> AI生成完整设定';
        this.pendingChanges = true;
    }

    async aiOptimizePrompt() {
        const btn = document.getElementById('aiOptimizePrompt');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 优化中...';

        await this.delay(1500);

        const textarea = document.querySelector('#panel-video-workflow textarea');
        if (textarea) {
            textarea.value = '霓虹灯闪烁的雨夜，巨型公司总部大楼前，主角站在雨中，全息广告在身后闪烁，飞行汽车从头顶掠过';
        }

        this.showToast('描述已优化！');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span> AI优化描述';
        this.pendingChanges = true;
    }

    async aiExpandStory() {
        const btn = document.getElementById('aiExpandStory');
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>扩写中...';

        await this.delay(2000);

        const textarea = document.getElementById('storyOutline');
        if (textarea) {
            textarea.value = `2150年的新上海，巨型公司"天启集团"统治着城市的一切。主角是一名曾经的黑客，因揭露公司黑幕而被追杀，隐姓埋名成为"夜行者"。

一个雨夜，主角收到神秘委托，要求潜入天启集团总部获取一份足以颠覆公司的证据。在行动过程中，主角结识了情报贩子"红狐"和天才科学家"艾琳"，三人组成临时联盟。

随着调查深入，主角发现天启集团正在秘密开发一种能够控制人类意识的AI系统。为了阻止这一阴谋，主角必须在公司发布会前摧毁核心服务器...

故事包含多条分支路线：可以选择正面突破、秘密潜入或寻求黑客联盟的帮助。每个选择都会影响最终结局。`;
        }

        this.showToast('剧情扩写完成！');
        btn.disabled = false;
        btn.innerHTML = '<span class="icon">✨</span> AI扩写剧情';
        this.pendingChanges = true;
    }

    async generateImages() {
        const btn = document.getElementById('generateImages');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner"></span> 生成中...';

        this.addToQueue('场景1：霓虹街道', '图片', 'processing');

        await this.delay(3000);

        this.updateQueueStatus(this.generationQueue.length - 1, 'completed');
        this.showToast('关键帧生成完成！');

        btn.disabled = false;
        btn.innerHTML = '<span class="icon">🖼️</span> 生成关键帧';

        this.switchWorkflowStep(3);
    }

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

        this.switchWorkflowStep(4);
    }

    previewWithOptions() {
        this.showToast('正在生成预览...');
        this.switchPreview('video');
        setTimeout(() => {
            this.showToast('预览已生成！');
        }, 1000);
    }

    // ==================== 队列管理 ====================

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

    updateQueueStatus(index, status) {
        if (this.generationQueue[index]) {
            this.generationQueue[index].status = status;
            this.renderQueue();
        }
    }

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

    // ==================== 工具方法 ====================

    showToast(message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

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

        console.log('生成视频:', { keyframes, config });

        return {
            id: `vid_${Date.now()}`,
            url: `https://api.example.com/videos/${Date.now()}`,
            keyframes,
            config
        };
    }

    async generateWithPrompt(prompt, options = {}) {
        const imageGen = new ImageGenerator();
        const keyframes = await imageGen.generateKeyframes(prompt, 6);
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

        const container = document.createElement('div');
        container.className = `options-container ${style}`;

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

        if (timing === 'end') {
            videoElement.addEventListener('ended', () => {
                videoElement.parentElement.appendChild(container);
            });
        } else {
            const checkTime = () => {
                if (videoElement.currentTime >= config.injectTime) {
                    videoElement.parentElement.appendChild(container);
                    videoElement.removeEventListener('timeupdate', checkTime);
                }
            };
            videoElement.addEventListener('timeupdate', checkTime);
        }

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
        this.triggerBranch(option.nextNode);
    }

    onTimeout() {
        console.log('选项超时');
        this.triggerDefaultBranch();
    }

    triggerBranch(nodeId) {
        console.log('触发分支:', nodeId);
    }

    triggerDefaultBranch() {
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
        const videoWorkflowNav = document.querySelector('.nav-item[data-panel="video-workflow"]');
        if (videoWorkflowNav) {
            videoWorkflowNav.addEventListener('click', () => {
                this.open();
            });
        }

        const closeBtn = document.getElementById('overlayClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        document.getElementById('overlayNext1')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('overlayPrev2')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('overlayNext2')?.addEventListener('click', () => this.startImageGeneration());
        document.getElementById('overlayPrev3')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('overlayRegenerate3')?.addEventListener('click', () => this.regenerateImages());
        document.getElementById('overlayPrev4')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('overlayGenerateVideo')?.addEventListener('click', () => this.generateVideo());
        document.getElementById('overlayFinish')?.addEventListener('click', () => this.close());
        document.getElementById('overlayNewVideo')?.addEventListener('click', () => this.goToStep(1));

        document.getElementById('overlayAiOptimize')?.addEventListener('click', () => this.optimizePrompt());

        document.querySelectorAll('.overlay-asset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.currentTarget.classList.toggle('selected');
            });
        });
    }

    open(nodeData = null) {
        if (!this.overlay) return;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.currentStep = 1;
        this.updateStepIndicator();
        this.showStepPanel(1);

        if (nodeData) {
            const nodeNameEl = document.getElementById('currentNodeName');
            const promptEl = document.getElementById('overlayPrompt');
            if (nodeNameEl) nodeNameEl.textContent = nodeData.name || '未命名节点';
            if (promptEl) promptEl.value = nodeData.description || '';
        }
    }

    close() {
        if (!this.overlay) return;
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
        if (!btn || !textarea) return;

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
        if (!grid) return;
        const cards = grid.querySelectorAll('.overlay-image-card');

        cards.forEach(card => {
            card.innerHTML = '<div class="overlay-image-placeholder"><div class="spinner"></div></div>';
            card.classList.remove('selected');
        });

        await this.delay(2500);

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
            card.onclick = () => this.selectImage(index);
        });
    }

    selectImage(index) {
        const cards = document.querySelectorAll('.overlay-image-card');
        cards.forEach(c => c.classList.remove('selected'));
        if (cards[index]) cards[index].classList.add('selected');

        this.selectedImage = this.generatedImages[index];
        this.goToStep(4);

        const selectedImg = document.getElementById('overlaySelectedImage');
        if (selectedImg && this.selectedImage) {
            selectedImg.style.background = this.selectedImage.gradient;
        }

        const sceneText = document.getElementById('overlaySceneText');
        if (sceneText) sceneText.value = this.selectedImage.text;
    }

    async regenerateImages() {
        await this.startImageGeneration();
    }

    async generateVideo() {
        const btn = document.getElementById('overlayGenerateVideo');
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span>生成中...';

        await this.delay(3000);

        this.goToStep(5);

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
assetManager = new AssetManager();

// 导出
window.WorldBookEditor = WorldBookEditor;
window.WorkflowManager = WorkflowManager;
window.ImageGenerator = ImageGenerator;
window.VideoGenerator = VideoGenerator;
window.OptionInjector = OptionInjector;
window.VideoWorkflowOverlay = VideoWorkflowOverlay;
window.AssetManager = AssetManager;

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
