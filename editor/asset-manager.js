/**
 * 绘境Online - 素材管理器
 * 角色卡、世界书、玩法集的CRUD + AI生成
 */

class AssetManager {
    constructor() {
        this.store = dataStore;
        this.currentType = 'characters';
        this.currentItem = null;
        this.searchKeyword = '';
    }

    // ==================== 渲染列表 ====================

    renderList(type = this.currentType) {
        this.currentType = type;
        const container = document.getElementById('assetListContainer');
        if (!container) return;

        let items = this.store.getAll(type);
        if (this.searchKeyword) {
            items = this.store.search(type, this.searchKeyword);
        }

        const typeLabel = { characters: '角色卡', worlds: '世界书', playsets: '玩法集' }[type];

        container.innerHTML = `
            <div class="asset-list-header">
                <h3>${typeLabel}列表</h3>
                <button class="btn btn-primary btn-sm" onclick="assetManager.openEditor()">
                    <span>+</span> 新建
                </button>
            </div>
            <div class="asset-search">
                <input type="text" class="form-input" placeholder="搜索..." value="${this.searchKeyword}" oninput="assetManager.onSearch(this.value)">
            </div>
            <div class="asset-grid">
                ${items.map(item => this.createAssetCard(item, type)).join('')}
            </div>
        `;
    }

    createAssetCard(item, type) {
        const icon = { characters: '👤', worlds: '🌍', playsets: '🎮' }[type];
        const subtitle = {
            characters: item.personality?.substring(0, 30) + '...',
            worlds: item.description?.substring(0, 30) + '...',
            playsets: item.description?.substring(0, 30) + '...',
        }[type];

        return `
            <div class="asset-card" data-id="${item.id}" onclick="assetManager.selectItem('${item.id}')">
                <div class="asset-card-icon">${icon}</div>
                <div class="asset-card-info">
                    <div class="asset-card-name">${item.name}</div>
                    <div class="asset-card-sub">${subtitle || ''}</div>
                    <div class="asset-card-tags">
                        ${(item.tags || []).map(t => `<span class="tag-sm">${t}</span>`).join('')}
                    </div>
                </div>
                <div class="asset-card-actions" onclick="event.stopPropagation()">
                    <button class="btn-icon-sm" onclick="assetManager.editItem('${item.id}')" title="编辑">✏️</button>
                    <button class="btn-icon-sm" onclick="assetManager.deleteItem('${item.id}')" title="删除">🗑️</button>
                </div>
            </div>
        `;
    }

    // ==================== 搜索 ====================

    onSearch(keyword) {
        this.searchKeyword = keyword;
        this.renderList();
    }

    // ==================== 选择/编辑 ====================

    selectItem(id) {
        this.currentItem = this.store.getById(this.currentType, id);
        this.renderDetail();
    }

    editItem(id) {
        this.currentItem = this.store.getById(this.currentType, id);
        this.openEditor(this.currentItem);
    }

    deleteItem(id) {
        if (!confirm('确定要删除吗？')) return;
        this.store.delete(this.currentType, id);
        if (this.currentItem?.id === id) {
            this.currentItem = null;
        }
        this.renderList();
        this.renderDetail();
    }

    // ==================== 详情面板 ====================

    renderDetail() {
        const container = document.getElementById('assetDetailContainer');
        if (!container) return;

        if (!this.currentItem) {
            container.innerHTML = `
                <div class="asset-empty">
                    <div class="asset-empty-icon">📂</div>
                    <p>选择一个${this.getTypeLabel()}查看详情</p>
                </div>
            `;
            return;
        }

        const item = this.currentItem;
        const type = this.currentType;

        let detailHtml = '';
        if (type === 'characters') {
            detailHtml = this.renderCharacterDetail(item);
        } else if (type === 'worlds') {
            detailHtml = this.renderWorldDetail(item);
        } else if (type === 'playsets') {
            detailHtml = this.renderPlaysetDetail(item);
        }

        container.innerHTML = detailHtml;
    }

    renderCharacterDetail(char) {
        return `
            <div class="asset-detail">
                <div class="detail-header">
                    <h3>${char.name}</h3>
                    <span class="detail-alias">${char.alias || ''}</span>
                </div>
                <div class="detail-section">
                    <label>性格</label>
                    <p>${char.personality || '未设置'}</p>
                </div>
                <div class="detail-section">
                    <label>背景</label>
                    <p>${char.background || '未设置'}</p>
                </div>
                <div class="detail-section">
                    <label>外貌</label>
                    <p>${char.appearance || '未设置'}</p>
                </div>
                <div class="detail-section">
                    <label>能力</label>
                    <div class="tag-list">
                        ${(char.abilities || []).map(a => `<span class="tag">${a}</span>`).join('')}
                    </div>
                </div>
                <div class="detail-section">
                    <label>声线</label>
                    <p>${char.voice || '未设置'}</p>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="assetManager.editItem('${char.id}')">编辑</button>
                    <button class="btn btn-ai" onclick="assetManager.aiGenerateImage('${char.id}')">🎨 AI生成形象</button>
                </div>
            </div>
        `;
    }

    renderWorldDetail(world) {
        return `
            <div class="asset-detail">
                <div class="detail-header">
                    <h3>${world.name}</h3>
                    <span class="detail-type">${world.type || ''} · ${world.era || ''}</span>
                </div>
                <div class="detail-section">
                    <label>描述</label>
                    <p>${world.description || '未设置'}</p>
                </div>
                <div class="detail-section">
                    <label>世界规则</label>
                    <div class="detail-rules">
                        ${world.rules ? Object.entries(world.rules).map(([k, v]) => `
                            <div class="rule-item"><strong>${k}:</strong> ${v}</div>
                        `).join('') : '未设置'}
                    </div>
                </div>
                <div class="detail-section">
                    <label>地区</label>
                    <div class="region-list">
                        ${(world.geography?.regions || []).map(r => `
                            <div class="region-item">
                                <strong>${r.name}</strong>
                                <p>${r.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="detail-section">
                    <label>势力</label>
                    <div class="faction-list">
                        ${(world.factions || []).map(f => `
                            <div class="faction-item ${f.alignment}">
                                <strong>${f.name}</strong>
                                <span class="alignment-badge">${f.alignment}</span>
                                <p>${f.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="assetManager.editItem('${world.id}')">编辑</button>
                    <button class="btn btn-ai" onclick="assetManager.aiExpandWorld('${world.id}')">✨ AI扩展设定</button>
                </div>
            </div>
        `;
    }

    renderPlaysetDetail(playset) {
        return `
            <div class="asset-detail">
                <div class="detail-header">
                    <h3>${playset.name}</h3>
                    <span class="detail-type">${playset.type || ''}</span>
                </div>
                <div class="detail-section">
                    <label>描述</label>
                    <p>${playset.description || '未设置'}</p>
                </div>
                <div class="detail-section">
                    <label>规则</label>
                    <div class="detail-rules">
                        ${playset.rules ? `
                            <div class="rule-item"><strong>目标:</strong> ${playset.rules.objective}</div>
                            <div class="rule-item"><strong>胜利:</strong> ${playset.rules.winCondition}</div>
                            <div class="rule-item"><strong>失败:</strong> ${playset.rules.loseCondition}</div>
                        ` : '未设置'}
                    </div>
                </div>
                <div class="detail-section">
                    <label>机制</label>
                    <div class="tag-list">
                        ${(playset.rules?.mechanics || []).map(m => `<span class="tag">${m}</span>`).join('')}
                    </div>
                </div>
                <div class="detail-section">
                    <label>场景</label>
                    <div class="scene-list">
                        ${(playset.scenes || []).map(s => `
                            <div class="scene-item">
                                <strong>${s.name}</strong>
                                <p>${s.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="assetManager.editItem('${playset.id}')">编辑</button>
                    <button class="btn btn-ai" onclick="assetManager.aiGenerateScenes('${playset.id}')">✨ AI生成场景</button>
                </div>
            </div>
        `;
    }

    // ==================== 编辑器弹窗 ====================

    openEditor(item = null) {
        this.currentItem = item;
        const modal = document.getElementById('assetEditorModal');
        const form = document.getElementById('assetEditorForm');
        const title = document.getElementById('assetEditorTitle');

        title.textContent = item ? '编辑' + this.getTypeLabel() : '新建' + this.getTypeLabel();

        if (form) {
            form.innerHTML = this.buildEditorForm(item);
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeEditor() {
        document.getElementById('assetEditorModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    buildEditorForm(item) {
        const type = this.currentType;
        const isEdit = !!item;
        const data = item || {};

        let fields = '';

        // 通用字段
        fields += `
            <div class="form-group">
                <label>名称 *</label>
                <input type="text" class="form-input" name="name" value="${data.name || ''}" required>
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea class="form-textarea" name="description" rows="3">${data.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>标签（逗号分隔）</label>
                <input type="text" class="form-input" name="tags" value="${(data.tags || []).join(', ')}" placeholder="科幻, 主角, 黑客">
            </div>
        `;

        if (type === 'characters') {
            fields += `
                <div class="form-group">
                    <label>别名</label>
                    <input type="text" class="form-input" name="alias" value="${data.alias || ''}">
                </div>
                <div class="form-group">
                    <label>性格</label>
                    <textarea class="form-textarea" name="personality" rows="2">${data.personality || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>背景故事</label>
                    <textarea class="form-textarea" name="background" rows="3">${data.background || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>外貌描述</label>
                    <textarea class="form-textarea" name="appearance" rows="2">${data.appearance || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>能力（逗号分隔）</label>
                    <input type="text" class="form-input" name="abilities" value="${(data.abilities || []).join(', ')}" placeholder="黑客, 潜行, 格斗">
                </div>
                <div class="form-group">
                    <label>声线</label>
                    <input type="text" class="form-input" name="voice" value="${data.voice || ''}">
                </div>
                <div class="form-group">
                    <label>所属世界</label>
                    <select class="form-select" name="worldId">
                        <option value="">无</option>
                        ${this.store.getWorlds().map(w => `
                            <option value="${w.id}" ${data.worldId === w.id ? 'selected' : ''}>${w.name}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        } else if (type === 'worlds') {
            fields += `
                <div class="form-row">
                    <div class="form-group">
                        <label>类型</label>
                        <select class="form-select" name="type">
                            <option value="fantasy" ${data.type === 'fantasy' ? 'selected' : ''}>奇幻</option>
                            <option value="scifi" ${data.type === 'scifi' ? 'selected' : ''}>科幻</option>
                            <option value="modern" ${data.type === 'modern' ? 'selected' : ''}>现代</option>
                            <option value="historical" ${data.type === 'historical' ? 'selected' : ''}>历史</option>
                            <option value="horror" ${data.type === 'horror' ? 'selected' : ''}>恐怖</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>时代</label>
                        <input type="text" class="form-input" name="era" value="${data.era || ''}" placeholder="如：未来2150">
                    </div>
                </div>
                <div class="form-group">
                    <label>难度</label>
                    <select class="form-select" name="difficulty">
                        <option value="easy" ${data.difficulty === 'easy' ? 'selected' : ''}>简单</option>
                        <option value="normal" ${data.difficulty === 'normal' ? 'selected' : ''}>普通</option>
                        <option value="hard" ${data.difficulty === 'hard' ? 'selected' : ''}>困难</option>
                        <option value="extreme" ${data.difficulty === 'extreme' ? 'selected' : ''}>极限</option>
                    </select>
                </div>
            `;
        } else if (type === 'playsets') {
            fields += `
                <div class="form-group">
                    <label>玩法类型</label>
                    <select class="form-select" name="type">
                        <option value="investigation" ${data.type === 'investigation' ? 'selected' : ''}>侦探推理</option>
                        <option value="survival" ${data.type === 'survival' ? 'selected' : ''}>生存挑战</option>
                        <option value="stealth" ${data.type === 'stealth' ? 'selected' : ''}>潜入行动</option>
                        <option value="combat" ${data.type === 'combat' ? 'selected' : ''}>战斗</option>
                        <option value="social" ${data.type === 'social' ? 'selected' : ''}>社交</option>
                        <option value="exploration" ${data.type === 'exploration' ? 'selected' : ''}>探索</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>目标</label>
                    <input type="text" class="form-input" name="objective" value="${data.rules?.objective || ''}">
                </div>
                <div class="form-group">
                    <label>胜利条件</label>
                    <input type="text" class="form-input" name="winCondition" value="${data.rules?.winCondition || ''}">
                </div>
                <div class="form-group">
                    <label>失败条件</label>
                    <input type="text" class="form-input" name="loseCondition" value="${data.rules?.loseCondition || ''}">
                </div>
            `;
        }

        return fields;
    }

    saveFromEditor() {
        const form = document.getElementById('assetEditorForm');
        const formData = new FormData(form);
        const data = {};

        formData.forEach((value, key) => {
            if (key === 'tags' || key === 'abilities') {
                data[key] = value.split(',').map(s => s.trim()).filter(Boolean);
            } else if (key === 'objective' || key === 'winCondition' || key === 'loseCondition') {
                if (!data.rules) data.rules = {};
                data.rules[key] = value;
            } else {
                data[key] = value;
            }
        });

        if (this.currentItem) {
            data.id = this.currentItem.id;
        }

        this.store.save(this.currentType, data);
        this.closeEditor();
        this.renderList();
        this.selectItem(data.id);
        this.showToast('保存成功！');
    }

    getTypeLabel() {
        return { characters: '角色卡', worlds: '世界书', playsets: '玩法集' }[this.currentType];
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

    // ==================== 弹窗控制 ====================

    openAssetManager() {
        const modal = document.getElementById('assetManagerModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderList();
        this.renderDetail();
    }

    closeAssetManager() {
        document.getElementById('assetManagerModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    switchType(type) {
        this.currentType = type;
        this.currentItem = null;
        this.searchKeyword = '';

        document.querySelectorAll('.asset-type-item').forEach(item => {
            item.classList.toggle('active', item.dataset.type === type);
        });

        this.renderList();
        this.renderDetail();
    }

    // ==================== AI生成 ====================

    async aiGenerateImage(charId) {
        this.showToast('AI生成形象功能开发中...');
    }

    async aiExpandWorld(worldId) {
        this.showToast('AI扩展设定功能开发中...');
    }

    async aiGenerateScenes(playsetId) {
        this.showToast('AI生成场景功能开发中...');
    }
}

// 全局实例
let assetManager;
