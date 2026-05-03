/**
 * 绘境Online - 世界书系统
 * 差异化特性：规则引擎、坐标地图、势力关系引擎、分支剧情、经济系统
 */
class WorldBookSystem {
    constructor(store) {
        this.store = store || dataStore;
        this.currentWorld = null;
        this.storyNodes = new Map();
        this.factionRelations = new Map();
        this.ruleEngine = new RuleEngine();
        this.economyEngine = new EconomyEngine();
        this._changeListeners = [];
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

    load(worldId) {
        this.currentWorld = this.store.getWorld(worldId);
        this.storyNodes.clear();
        this.factionRelations.clear();
        if (this.currentWorld) {
            (this.currentWorld.storyNodes || []).forEach(n => this.storyNodes.set(n.id, n));
            this.ruleEngine.load(this.currentWorld.rules);
            this.economyEngine.load(this.currentWorld.economy);
            this._buildFactionRelations();
        }
        return this.currentWorld;
    }

    getWorld() {
        return this.currentWorld;
    }

    save() {
        if (!this.currentWorld) return;
        this.currentWorld.storyNodes = Array.from(this.storyNodes.values());
        this.currentWorld.factionRelations = Array.from(this.factionRelations.values());
        this.currentWorld.rules = this.ruleEngine.export();
        this.currentWorld.economy = this.economyEngine.export();
        this.store.saveWorld(this.currentWorld);
        this._notifyChange('world:saved', this.currentWorld);
        return this.currentWorld;
    }

    update(fields) {
        if (!this.currentWorld) return;
        Object.assign(this.currentWorld, fields);
        this.currentWorld.updatedAt = new Date().toISOString();
        this.save();
        this._notifyChange('world:updated', { world: this.currentWorld, fields });
    }

    // ==================== 地理区域 ====================

    getRegions() {
        return this.currentWorld?.geography?.regions || [];
    }

    addRegion(region) {
        if (!this.currentWorld) return null;
        if (!this.currentWorld.geography) this.currentWorld.geography = { regions: [] };
        const newRegion = {
            id: `region_${Date.now()}`,
            name: region.name || '新区域',
            type: region.type || 'city',
            description: region.description || '',
            coordinates: region.coordinates || { x: 50, y: 50 },
            climate: region.climate || '',
            population: region.population || 0,
            dangerLevel: region.dangerLevel || 1,
            connectedTo: region.connectedTo || [],
            tags: region.tags || [],
            createdAt: new Date().toISOString()
        };
        this.currentWorld.geography.regions.push(newRegion);
        this.save();
        this._notifyChange('region:added', newRegion);
        return newRegion;
    }

    updateRegion(regionId, fields) {
        const regions = this.currentWorld?.geography?.regions || [];
        const idx = regions.findIndex(r => r.id === regionId);
        if (idx < 0) return null;
        Object.assign(regions[idx], fields);
        this.save();
        this._notifyChange('region:updated', regions[idx]);
        return regions[idx];
    }

    removeRegion(regionId) {
        if (!this.currentWorld?.geography) return;
        this.currentWorld.geography.regions = this.currentWorld.geography.regions.filter(r => r.id !== regionId);
        this.save();
        this._notifyChange('region:removed', regionId);
    }

    // ==================== 势力关系引擎 ====================

    _buildFactionRelations() {
        const factions = this.currentWorld?.factions || [];
        factions.forEach(a => {
            factions.forEach(b => {
                if (a.id !== b.id) {
                    const key = this._relationKey(a.id, b.id);
                    if (!this.factionRelations.has(key)) {
                        this.factionRelations.set(key, {
                            fromId: a.id,
                            toId: b.id,
                            status: 'neutral',
                            value: 50,
                            history: []
                        });
                    }
                }
            });
        });
        (this.currentWorld?.factionRelations || []).forEach(r => {
            const key = this._relationKey(r.fromId, r.toId);
            this.factionRelations.set(key, r);
        });
    }

    _relationKey(a, b) {
        return [a, b].sort().join('::');
    }

    getFactionRelations() {
        return Array.from(this.factionRelations.values());
    }

    setFactionRelation(fromId, toId, status, value) {
        const key = this._relationKey(fromId, toId);
        const rel = this.factionRelations.get(key) || {
            fromId, toId, status: 'neutral', value: 50, history: []
        };
        rel.status = status;
        rel.value = Math.max(0, Math.min(100, value));
        rel.history.push({
            time: new Date().toISOString(),
            fromStatus: rel.status,
            toStatus: status,
            fromValue: rel.value,
            toValue: value
        });
        if (rel.history.length > 50) rel.history = rel.history.slice(-50);
        this.factionRelations.set(key, rel);
        this.save();
        this._notifyChange('faction:relationChanged', rel);
        return rel;
    }

    // ==================== 剧情节点 ====================

    getStoryNodes() {
        return Array.from(this.storyNodes.values());
    }

    getStoryNode(nodeId) {
        return this.storyNodes.get(nodeId);
    }

    addStoryNode(node) {
        const newNode = {
            id: `node_${Date.now()}`,
            name: node.name || '新节点',
            description: node.description || '',
            type: node.type || 'video',
            chapter: node.chapter || 1,
            order: this.storyNodes.size + 1,
            options: node.options || [],
            conditions: node.conditions || {},
            effects: node.effects || {},
            videoParams: node.videoParams || {},
            videoStatus: node.videoStatus || 'pending',
            videoUrl: node.videoUrl || null,
            parentId: node.parentId || null,
            isStart: node.isStart || false,
            isEnding: node.isEnding || false,
            endingType: node.endingType || null,
            createdAt: new Date().toISOString()
        };
        this.storyNodes.set(newNode.id, newNode);
        this.save();
        this._notifyChange('node:added', newNode);
        return newNode;
    }

    updateStoryNode(nodeId, fields) {
        const node = this.storyNodes.get(nodeId);
        if (!node) return null;
        Object.assign(node, fields);
        this.storyNodes.set(nodeId, node);
        this.save();
        this._notifyChange('node:updated', node);
        return node;
    }

    removeStoryNode(nodeId) {
        const removed = this.storyNodes.get(nodeId);
        this.storyNodes.delete(nodeId);
        this.storyNodes.forEach(node => {
            node.options = (node.options || []).filter(opt => opt.targetNodeId !== nodeId);
        });
        this.save();
        this._notifyChange('node:removed', removed);
        return removed;
    }

    addNodeOption(nodeId, option) {
        const node = this.storyNodes.get(nodeId);
        if (!node) return null;
        if (!node.options) node.options = [];
        const newOption = {
            id: `opt_${Date.now()}`,
            text: option.text || '',
            targetNodeId: option.targetNodeId || '',
            hint: option.hint || '',
            conditions: option.conditions || {},
            effects: option.effects || {},
            order: node.options.length
        };
        node.options.push(newOption);
        this.storyNodes.set(nodeId, node);
        this.save();
        this._notifyChange('node:optionAdded', { nodeId, option: newOption });
        return newOption;
    }

    removeNodeOption(nodeId, optionId) {
        const node = this.storyNodes.get(nodeId);
        if (!node) return;
        node.options = (node.options || []).filter(opt => opt.id !== optionId);
        this.storyNodes.set(nodeId, node);
        this.save();
        this._notifyChange('node:optionRemoved', { nodeId, optionId });
    }

    // ==================== 视频生成 ====================

    setNodeVideoStatus(nodeId, status, videoUrl = null) {
        const node = this.storyNodes.get(nodeId);
        if (!node) return;
        node.videoStatus = status;
        if (videoUrl) node.videoUrl = videoUrl;
        this.storyNodes.set(nodeId, node);
        this.save();
        this._notifyChange('node:videoUpdated', { nodeId, status, videoUrl });
    }

    // ==================== 创建默认世界 ====================

    createDefaultWorld(name) {
        const world = {
            id: `world_${Date.now()}`,
            name: name || '新世界',
            description: '',
            type: 'scifi',
            era: '未来',
            difficulty: 'normal',
            tags: [],
            rules: this.ruleEngine.getDefaults(),
            geography: { regions: [], climate: '', landmarks: [] },
            economy: this.economyEngine.getDefaults(),
            factions: [],
            visualStyle: {
                primaryColor: '#6366f1',
                elements: [],
                atmosphere: ''
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.store.saveWorld(world);
        this._notifyChange('world:created', world);
        return world;
    }

    validateWorld() {
        const issues = [];
        if (!this.currentWorld?.name) issues.push({ field: 'name', message: '世界名称不能为空' });
        const regions = this.getRegions();
        if (regions.length === 0) issues.push({ field: 'geography', message: '至少需要一个区域' });
        return { valid: issues.length === 0, issues };
    }
}

class RuleEngine {
    constructor() {
        this.rules = {};
    }

    getDefaults() {
        return {
            technology: '',
            society: '',
            magic: '',
            danger: '',
            custom: [],
            constraints: {
                maxLevel: 100,
                maxSkills: 20,
                maxEquipmentSlots: 8,
                respawnType: 'checkpoint',
                permadeath: false,
                pvpEnabled: false,
                fastTravel: true,
                inventoryLimit: 50
            }
        };
    }

    load(rules) {
        this.rules = { ...this.getDefaults(), ...(rules || {}) };
    }

    export() {
        return { ...this.rules };
    }

    addCustomRule(name, description) {
        if (!this.rules.custom) this.rules.custom = [];
        this.rules.custom.push({ id: `rule_${Date.now()}`, name, description });
    }

    removeCustomRule(id) {
        this.rules.custom = (this.rules.custom || []).filter(r => r.id !== id);
    }

    validate(action, context = {}) {
        const constraints = this.rules.constraints || {};
        if (action === 'levelUp' && context.currentLevel >= constraints.maxLevel) {
            return { allowed: false, reason: `已达到最大等级 ${constraints.maxLevel}` };
        }
        if (action === 'takeItem' && context.inventoryCount >= constraints.inventoryLimit) {
            return { allowed: false, reason: `背包已满 (${constraints.inventoryLimit})` };
        }
        return { allowed: true };
    }
}

class EconomyEngine {
    constructor() {
        this.economy = this.getDefaults();
    }

    getDefaults() {
        return {
            currency: 'credit',
            currencyName: '信用点',
            currencySymbol: '¢',
            basePrices: {
                commonItem: 100,
                rareItem: 500,
                epicItem: 2000,
                legendaryItem: 10000
            },
            tradeTaxRate: 0.05,
            creatorRevenueShare: 0.70,
            platformRevenueShare: 0.25,
            affiliateRevenueShare: 0.05,
            dailyLoginBonus: 50,
            questRewardBase: 100
        };
    }

    load(economy) {
        this.economy = { ...this.getDefaults(), ...(economy || {}) };
    }

    export() {
        return { ...this.economy };
    }

    calculatePrice(baseType, rarity = 1, supplyDemand = 1.0) {
        const rarityMultiplier = { common: 1, rare: 5, epic: 20, legendary: 100 };
        const multiplier = rarityMultiplier[rarity] || 1;
        const base = this.economy.basePrices[`${rarity}Item`] || 100;
        return Math.round(base * multiplier * supplyDemand);
    }

    calculateTradeFee(amount) {
        return Math.round(amount * this.economy.tradeTaxRate);
    }

    calculateCreatorRevenue(amount) {
        return Math.round(amount * this.economy.creatorRevenueShare);
    }

    calculatePlatformRevenue(amount) {
        return Math.round(amount * this.economy.platformRevenueShare);
    }

    calculateAffiliateRevenue(amount) {
        return Math.round(amount * this.economy.affiliateRevenueShare);
    }
}

window.WorldBookSystem = WorldBookSystem;
window.RuleEngine = RuleEngine;
window.EconomyEngine = EconomyEngine;
