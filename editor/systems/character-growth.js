/**
 * 绘境Online - 角色成长系统
 * 差异化特性：100级成长、技能树、装备稀有度、属性成长曲线
 */
class CharacterGrowthSystem {
    constructor() {
        this.levelCurve = this._buildLevelCurve(100);
        this.skillTree = new SkillTreeManager();
        this.equipmentSystem = new EquipmentSystem();
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

    // ==================== 等级曲线 ====================

    _buildLevelCurve(maxLevel) {
        const curve = [];
        for (let i = 0; i <= maxLevel; i++) {
            curve.push(Math.floor(100 * Math.pow(1.15, i)));
        }
        return curve;
    }

    getExperienceForLevel(level) {
        if (level <= 0) return 0;
        if (level >= this.levelCurve.length) return this.levelCurve[this.levelCurve.length - 1];
        return this.levelCurve[level];
    }

    getTotalExperienceForLevel(level) {
        let total = 0;
        for (let i = 1; i < level; i++) {
            total += this.getExperienceForLevel(i);
        }
        return total;
    }

    // ==================== 经验管理 ====================

    addExperience(character, amount) {
        if (!character.growth) {
            character.growth = { level: 1, experience: 0, experienceToNext: 100, totalExperience: 0, skillPoints: 0, attributePoints: 0 };
        }
        character.growth.totalExperience += amount;
        character.growth.experience += amount;
        let leveledUp = false;
        while (character.growth.experience >= character.growth.experienceToNext && character.growth.level < 100) {
            character.growth.experience -= character.growth.experienceToNext;
            character.growth.level++;
            character.growth.experienceToNext = this.getExperienceForLevel(character.growth.level + 1);
            character.growth.skillPoints += 1;
            character.growth.attributePoints += this._getAttributePointsForLevel(character.growth.level);
            leveledUp = true;
            this._notifyChange('levelUp', { characterId: character.id, level: character.growth.level });
        }
        this._notifyChange('experienceGained', { characterId: character.id, amount, leveledUp });
        return { leveledUp, level: character.growth.level };
    }

    _getAttributePointsForLevel(level) {
        if (level % 10 === 0) return 5;
        if (level % 5 === 0) return 3;
        return 1;
    }

    getLevelProgress(character) {
        const g = character.growth || { level: 1, experience: 0, experienceToNext: 100 };
        return {
            level: g.level,
            experience: g.experience,
            experienceToNext: g.experienceToNext,
            progress: Math.round((g.experience / g.experienceToNext) * 100),
            totalExperience: g.totalExperience || 0
        };
    }

    // ==================== 属性分配 ====================

    allocateAttributePoint(character, attribute, amount = 1) {
        if (!character.growth || character.growth.attributePoints < amount) {
            return { success: false, reason: '属性点不足' };
        }
        if (!character.attributes) character.attributes = {};
        character.attributes[attribute] = (character.attributes[attribute] || 0) + amount;
        character.growth.attributePoints -= amount;
        this._notifyChange('attributeAllocated', { characterId: character.id, attribute, amount });
        return { success: true, remaining: character.growth.attributePoints };
    }

    // ==================== 技能树 ====================

    getSkillTreeForCharacter(character) {
        return this.skillTree.getTree(character);
    }

    learnSkill(character, category, skillId) {
        if (!character.growth || character.growth.skillPoints <= 0) {
            return { success: false, reason: '技能点不足' };
        }
        const result = this.skillTree.learnSkill(character, category, skillId);
        if (result.success) {
            character.growth.skillPoints--;
            this._notifyChange('skillLearned', { characterId: character.id, category, skillId });
        }
        return result;
    }

    upgradeSkill(character, category, skillId) {
        const result = this.skillTree.upgradeSkill(character, category, skillId);
        if (result.success) {
            this._notifyChange('skillUpgraded', { characterId: character.id, category, skillId, level: result.level });
        }
        return result;
    }

    // ==================== 装备系统 ====================

    equipItem(character, item) {
        const result = this.equipmentSystem.equip(character, item);
        if (result.success) {
            this._notifyChange('equipmentChanged', { characterId: character.id, item, action: 'equip' });
        }
        return result;
    }

    unequipItem(character, slot) {
        const result = this.equipmentSystem.unequip(character, slot);
        if (result.success) {
            this._notifyChange('equipmentChanged', { characterId: character.id, slot, action: 'unequip' });
        }
        return result;
    }

    getEquipment(character) {
        return this.equipmentSystem.getEquipment(character);
    }

    // ==================== 属性计算 ====================

    calculateTotalStats(character) {
        const base = { ...(character.attributes || {}) };
        const equipment = character.equipment || [];
        const totals = { ...base };
        equipment.forEach(eq => {
            Object.entries(eq.stats || {}).forEach(([stat, value]) => {
                totals[stat] = (totals[stat] || 0) + value;
            });
        });
        const g = character.growth || { level: 1 };
        Object.keys(totals).forEach(stat => {
            totals[stat] = Math.floor(totals[stat] * (1 + (g.level - 1) * 0.02));
        });
        return totals;
    }
}

class SkillTreeManager {
    constructor() {
        this.trees = this._defaultTrees();
    }

    _defaultTrees() {
        return {
            combat: {
                name: '战斗', icon: '⚔️',
                skills: {
                    powerStrike: { name: '强力打击', level: 1, maxLevel: 10, description: '增加基础攻击力', effect: { attack: 5 } },
                    whirlwind: { name: '旋风斩', level: 0, maxLevel: 5, requires: { powerStrike: 3 }, description: '范围攻击', effect: { attack: 15 } },
                    criticalHit: { name: '致命一击', level: 0, maxLevel: 5, requires: { powerStrike: 5 }, description: '高暴击率', effect: { critRate: 10 } },
                    shieldBash: { name: '盾击', level: 0, maxLevel: 10, description: '增加防御力', effect: { defense: 5 } },
                    ironWill: { name: '钢铁意志', level: 0, maxLevel: 5, requires: { shieldBash: 5 }, description: '大幅增加防御', effect: { defense: 20 } }
                }
            },
            magic: {
                name: '法术', icon: '🔮',
                skills: {
                    fireball: { name: '火球术', level: 1, maxLevel: 10, description: '基础火焰攻击', effect: { magicAttack: 5 } },
                    iceLance: { name: '冰霜之矛', level: 0, maxLevel: 10, requires: { fireball: 3 }, description: '冰冻攻击', effect: { magicAttack: 8 } },
                    chainLightning: { name: '连锁闪电', level: 0, maxLevel: 5, requires: { fireball: 5, iceLance: 3 }, description: '群体雷击', effect: { magicAttack: 20 } },
                    healingLight: { name: '治愈之光', level: 0, maxLevel: 10, description: '恢复生命', effect: { healAmount: 20 } }
                }
            },
            stealth: {
                name: '潜行', icon: '🥷',
                skills: {
                    shadowStep: { name: '暗影步', level: 1, maxLevel: 10, description: '增加潜行成功率', effect: { stealth: 5 } },
                    backstab: { name: '背刺', level: 0, maxLevel: 5, requires: { shadowStep: 5 }, description: '潜行攻击加成', effect: { attack: 25 } },
                    vanish: { name: '消失', level: 0, maxLevel: 3, requires: { shadowStep: 8 }, description: '战斗中恢复潜行', effect: { stealth: 15 } }
                }
            },
            social: {
                name: '社交', icon: '💬',
                skills: {
                    persuasion: { name: '说服', level: 1, maxLevel: 10, description: '提高对话说服力', effect: { charisma: 5 } },
                    intimidation: { name: '威吓', level: 0, maxLevel: 10, description: '逼问信息', effect: { charisma: 3 } },
                    barter: { name: '讨价还价', level: 0, maxLevel: 10, description: '降低购买价格', effect: { discount: 5 } },
                    charm: { name: '魅力', level: 0, maxLevel: 5, requires: { persuasion: 5 }, description: '增强社交效果', effect: { charisma: 10 } }
                }
            },
            crafting: {
                name: '锻造', icon: '🔨',
                skills: {
                    smithing: { name: '锻造', level: 1, maxLevel: 10, description: '制造武器和防具', effect: { craftingSpeed: 5 } },
                    alchemy: { name: '炼金术', level: 0, maxLevel: 10, description: '制造药水', effect: { potionPotency: 5 } },
                    enchanting: { name: '附魔', level: 0, maxLevel: 5, requires: { smithing: 5, alchemy: 3 }, description: '为装备附魔', effect: { enchantPower: 10 } }
                }
            }
        };
    }

    getTree(character) {
        const charTree = character.skillTree || {};
        return Object.entries(this.trees).map(([key, tree]) => ({
            ...tree,
            id: key,
            level: (charTree[key] || {}).level || 1,
            skills: Object.entries(tree.skills).map(([skillId, skill]) => ({
                ...skill,
                id: skillId,
                currentLevel: (charTree[key] || {}).skills?.find(s => s.id === skillId)?.level || skill.level
            }))
        }));
    }

    learnSkill(character, category, skillId) {
        if (!character.skillTree) character.skillTree = {};
        if (!character.skillTree[category]) character.skillTree[category] = { level: 1, skills: [] };
        const tree = this.trees[category];
        if (!tree) return { success: false, reason: '技能类别不存在' };
        const skillDef = tree.skills[skillId];
        if (!skillDef) return { success: false, reason: '技能不存在' };
        const existing = character.skillTree[category].skills.find(s => s.id === skillId);
        if (existing) return { success: false, reason: '技能已学习' };
        if (skillDef.requires) {
            Object.entries(skillDef.requires).forEach(([reqId, reqLevel]) => {
                const req = character.skillTree[category].skills.find(s => s.id === reqId);
                if (!req || req.level < reqLevel) {
                    return { success: false, reason: `前置技能 ${reqId} 等级不足` };
                }
            });
        }
        character.skillTree[category].skills.push({ id: skillId, level: 1 });
        return { success: true, level: 1 };
    }

    upgradeSkill(character, category, skillId) {
        if (!character.skillTree || !character.skillTree[category]) {
            return { success: false, reason: '未学习该类别技能' };
        }
        const tree = this.trees[category];
        if (!tree) return { success: false, reason: '技能类别不存在' };
        const skillDef = tree.skills[skillId];
        if (!skillDef) return { success: false, reason: '技能不存在' };
        const skill = character.skillTree[category].skills.find(s => s.id === skillId);
        if (!skill) return { success: false, reason: '未学习该技能' };
        if (skill.level >= skillDef.maxLevel) return { success: false, reason: '已达最大等级' };
        skill.level++;
        return { success: true, level: skill.level };
    }
}

class EquipmentSystem {
    constructor() {
        this.slots = [
            { id: 'weapon', name: '武器', icon: '⚔️', maxCount: 1 },
            { id: 'head', name: '头盔', icon: '⛑️', maxCount: 1 },
            { id: 'chest', name: '上衣', icon: '👕', maxCount: 1 },
            { id: 'legs', name: '下装', icon: '👖', maxCount: 1 },
            { id: 'boots', name: '鞋子', icon: '👢', maxCount: 1 },
            { id: 'accessory1', name: '饰品1', icon: '💍', maxCount: 1 },
            { id: 'accessory2', name: '饰品2', icon: '📿', maxCount: 1 },
            { id: 'pet', name: '宠物', icon: '🐾', maxCount: 1 }
        ];
    }

    getSlots() {
        return [...this.slots];
    }

    equip(character, item) {
        if (!character.equipment) character.equipment = [];
        const slot = this.slots.find(s => s.id === item.slot);
        if (!slot) return { success: false, reason: '无效的装备槽' };
        const existing = character.equipment.find(e => e.slot === item.slot);
        if (existing) {
            Object.assign(existing, item);
        } else {
            character.equipment.push({ ...item, equippedAt: new Date().toISOString() });
        }
        return { success: true };
    }

    unequip(character, slot) {
        if (!character.equipment) return { success: false, reason: '没有装备' };
        character.equipment = character.equipment.filter(e => e.slot !== slot);
        return { success: true };
    }

    getEquipment(character) {
        return character.equipment || [];
    }

    getRarityColor(rarity) {
        const colors = {
            common: '#a1a1aa',
            rare: '#3b82f6',
            epic: '#8b5cf6',
            legendary: '#f59e0b',
            mythic: '#ef4444'
        };
        return colors[rarity] || colors.common;
    }

    getRarityLabel(rarity) {
        const labels = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说',
            mythic: '神话'
        };
        return labels[rarity] || '普通';
    }

    generateEquipment(type, level = 1, rarity = 'common') {
        const rarityMultiplier = { common: 1, rare: 3, epic: 8, legendary: 20, mythic: 50 };
        const multiplier = rarityMultiplier[rarity] || 1;
        const baseStats = this._baseStats(type, level);
        Object.keys(baseStats).forEach(key => {
            baseStats[key] = Math.floor(baseStats[key] * multiplier * (1 + level * 0.1));
        });
        return {
            id: `eq_${Date.now()}`,
            name: this._generateName(type, rarity),
            type,
            slot: this._typeToSlot(type),
            rarity,
            level,
            stats: baseStats,
            effects: [],
            durability: 100,
            maxDurability: 100,
            createdAt: new Date().toISOString()
        };
    }

    _baseStats(type, level) {
        const bases = {
            weapon: { attack: 10 + level * 5 },
            head: { defense: 3 + level * 2, intelligence: 2 },
            chest: { defense: 8 + level * 4, hp: 20 + level * 5 },
            legs: { defense: 4 + level * 2, speed: 2 },
            boots: { speed: 5 + level * 2, defense: 2 },
            accessory1: { luck: 5 + level, charisma: 3 },
            accessory2: { luck: 3 + level, intelligence: 5 },
            pet: { attack: 5 + level * 3, defense: 5 + level * 2 }
        };
        return bases[type] || {};
    }

    _typeToSlot(type) {
        const mapping = {
            weapon: 'weapon', head: 'head', chest: 'chest',
            legs: 'legs', boots: 'boots',
            ring: 'accessory1', amulet: 'accessory2',
            pet: 'pet'
        };
        return mapping[type] || 'accessory1';
    }

    _generateName(type, rarity) {
        const prefixes = { common: '铁', rare: '秘银', epic: '暗金', legendary: '龙魂', mythic: '创世' };
        const names = { weapon: '之剑', head: '之冠', chest: '之铠', legs: '护腿', boots: '之靴', ring: '之戒', amulet: '之坠', pet: '之灵' };
        return `${prefixes[rarity] || ''}${names[type] || ''}`;
    }
}

window.CharacterGrowthSystem = CharacterGrowthSystem;
window.SkillTreeManager = SkillTreeManager;
window.EquipmentSystem = EquipmentSystem;
