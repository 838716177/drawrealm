/**
 * 绘境Online - 角色卡系统
 * 差异化特性：跨世界兼容、属性转换、交易元数据、AI生成形象
 */
class CharacterCardSystem {
    constructor(store) {
        this.store = store || dataStore;
        this.characters = new Map();
        this.attributeConverter = new AttributeConverter();
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

    load() {
        const chars = this.store.getCharacters();
        this.characters.clear();
        chars.forEach(c => this.characters.set(c.id, c));
        return this.getAll();
    }

    getAll() {
        return Array.from(this.characters.values());
    }

    get(id) {
        return this.characters.get(id);
    }

    getByWorld(worldId) {
        return this.getAll().filter(c => c.worldId === worldId);
    }

    save(character) {
        const saved = this.store.saveCharacter(character);
        this.characters.set(saved.id, saved);
        this._notifyChange('character:saved', saved);
        return saved;
    }

    delete(id) {
        this.store.deleteCharacter(id);
        this.characters.delete(id);
        this._notifyChange('character:deleted', id);
    }

    create(data) {
        const character = {
            id: `char_${Date.now()}`,
            name: data.name || '',
            alias: data.alias || '',
            avatar: data.avatar || null,
            avatarGradient: data.avatarGradient || this._randomGradient(),
            description: data.description || '',
            personality: data.personality || '',
            background: data.background || '',
            appearance: data.appearance || '',
            abilities: data.abilities || [],
            voice: data.voice || '',
            tags: data.tags || [],
            role: data.role || 'npc',
            worldId: data.worldId || '',
            worldName: data.worldName || '',
            scenes: data.scenes || [],
            attributes: data.attributes || this._defaultAttributes(),
            skillTree: data.skillTree || this._defaultSkillTree(),
            equipment: data.equipment || [],
            growth: {
                level: 1,
                experience: 0,
                experienceToNext: 100,
                totalExperience: 0,
                skillPoints: 0,
                attributePoints: 0
            },
            trading: {
                listed: false,
                price: 0,
                currency: 'credit',
                rarity: 'common',
                serialNumber: `HCC-${Date.now().toString(36).toUpperCase()}`,
                edition: 'standard',
                signatureAvailable: false
            },
            crossWorld: {
                compatibleWorlds: [],
                attributeMappings: {},
                restrictions: []
            },
            social: {
                reputation: 0,
                followers: 0,
                rating: 5.0,
                ratingCount: 0
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const saved = this.save(character);
        this._notifyChange('character:created', saved);
        return saved;
    }

    update(id, fields) {
        const character = this.characters.get(id);
        if (!character) return null;
        Object.assign(character, fields);
        character.updatedAt = new Date().toISOString();
        return this.save(character);
    }

    // ==================== 跨世界兼容 ====================

    addCrossWorldCompatibility(characterId, worldId, attributeMapping = {}) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        if (!character.crossWorld.compatibleWorlds.includes(worldId)) {
            character.crossWorld.compatibleWorlds.push(worldId);
        }
        Object.assign(character.crossWorld.attributeMappings, {
            [worldId]: { ...(character.crossWorld.attributeMappings[worldId] || {}), ...attributeMapping }
        });
        return this.save(character);
    }

    getCompatibleCharacters(worldId) {
        return this.getAll().filter(c =>
            c.worldId === worldId || c.crossWorld.compatibleWorlds.includes(worldId)
        );
    }

    // ==================== 属性转换 ====================

    convertAttributes(characterId, targetWorldId) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        const mapping = character.crossWorld.attributeMappings[targetWorldId];
        if (!mapping) return character.attributes;
        return this.attributeConverter.convert(character.attributes, mapping);
    }

    // ==================== 交易元数据 ====================

    setTradingInfo(characterId, info) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        Object.assign(character.trading, info);
        character.updatedAt = new Date().toISOString();
        return this.save(character);
    }

    listForTrading(characterId, price, rarity = 'common') {
        return this.setTradingInfo(characterId, {
            listed: true,
            price,
            rarity,
            listedAt: new Date().toISOString()
        });
    }

    unlistFromTrading(characterId) {
        return this.setTradingInfo(characterId, { listed: false });
    }

    getTradableCharacters() {
        return this.getAll().filter(c => c.trading.listed);
    }

    // ==================== AI形象生成 ====================

    async generateAvatar(characterId) {
        const character = this.characters.get(characterId);
        if (!character) return null;
        const gradient = this._randomGradient();
        character.avatarGradient = gradient;
        character.avatar = `avatar_${Date.now()}`;
        character.updatedAt = new Date().toISOString();
        this.save(character);
        this._notifyChange('character:avatarGenerated', { characterId, gradient });
        return character;
    }

    // ==================== 搜索筛选 ====================

    search(keyword) {
        const lower = keyword.toLowerCase();
        return this.getAll().filter(c =>
            c.name.toLowerCase().includes(lower) ||
            c.alias.toLowerCase().includes(lower) ||
            (c.tags || []).some(t => t.toLowerCase().includes(lower)) ||
            c.personality.toLowerCase().includes(lower) ||
            c.background.toLowerCase().includes(lower)
        );
    }

    filterByRarity(rarity) {
        return this.getAll().filter(c => c.trading.rarity === rarity);
    }

    filterByRole(role) {
        return this.getAll().filter(c => c.role === role);
    }

    // ==================== 工具方法 ====================

    _defaultAttributes() {
        return { hp: 100, attack: 10, defense: 10, speed: 10, intelligence: 10, charisma: 10, luck: 5 };
    }

    _defaultSkillTree() {
        return {
            combat: { level: 1, skills: [] },
            magic: { level: 1, skills: [] },
            stealth: { level: 1, skills: [] },
            social: { level: 1, skills: [] },
            crafting: { level: 1, skills: [] }
        };
    }

    _randomGradient() {
        const gradients = [
            'linear-gradient(135deg, #6366f1, #8b5cf6)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
            'linear-gradient(135deg, #10b981, #3b82f6)',
            'linear-gradient(135deg, #ec4899, #8b5cf6)',
            'linear-gradient(135deg, #06b6d4, #6366f1)',
            'linear-gradient(135deg, #f97316, #ef4444)',
            'linear-gradient(135deg, #8b5cf6, #ec4899)',
            'linear-gradient(135deg, #14b8a6, #06b6d4)'
        ];
        return gradients[Math.floor(Math.random() * gradients.length)];
    }
}

class AttributeConverter {
    convert(sourceAttrs, mapping) {
        const result = {};
        Object.entries(mapping).forEach(([sourceKey, targetKey]) => {
            if (sourceAttrs[sourceKey] !== undefined) {
                result[targetKey] = sourceAttrs[sourceKey];
            }
        });
        Object.entries(sourceAttrs).forEach(([key, value]) => {
            if (!(key in mapping)) {
                result[key] = value;
            }
        });
        return result;
    }

    createConversionRule(sourceWorld, targetWorld) {
        return {
            name: `${sourceWorld.name} → ${targetWorld.name}`,
            mappings: {},
            description: ''
        };
    }
}

window.CharacterCardSystem = CharacterCardSystem;
window.AttributeConverter = AttributeConverter;
