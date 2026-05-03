/**
 * 绘境Online - 游戏选项系统
 * 差异化特性：蝴蝶效应标记、关系追踪、世界状态变化、多重结局计算
 */
class GameOptionsSystem {
    constructor() {
        this.flags = new Map();
        this.relationships = new Map();
        this.worldState = new Map();
        this.optionsConfig = {
            style: 'bottom',
            timing: 'end',
            timeLimit: 15,
            animation: 'slide',
            maxOptionsPerNode: 5
        };
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

    // ==================== 蝴蝶效应标记 ====================

    setFlag(key, value) {
        const oldValue = this.flags.get(key);
        this.flags.set(key, value);
        this._notifyChange('flag:set', { key, oldValue, newValue: value });
        this._checkFlagConsequences(key, oldValue, value);
    }

    getFlag(key) {
        return this.flags.get(key);
    }

    hasFlag(key) {
        return this.flags.has(key);
    }

    toggleFlag(key) {
        this.setFlag(key, !this.flags.get(key));
    }

    incrementFlag(key, amount = 1) {
        const current = this.flags.get(key) || 0;
        this.setFlag(key, current + amount);
    }

    getAllFlags() {
        const result = {};
        this.flags.forEach((v, k) => { result[k] = v; });
        return result;
    }

    _checkFlagConsequences(key, oldValue, newValue) {
        const consequences = this._getFlagConsequences(key);
        consequences.forEach(rule => {
            if (rule.condition(oldValue, newValue)) {
                rule.effects.forEach(effect => {
                    this.setFlag(effect.key, effect.compute(newValue));
                });
            }
        });
    }

    _getFlagConsequences(key) {
        const rules = {
            'killedBoss': [{
                condition: (old, val) => val === true,
                effects: [{ key: 'heroReputation', compute: () => (this.flags.get('heroReputation') || 0) + 50 }]
            }],
            'helpedNPC': [{
                condition: (old, val) => val === true,
                effects: [{ key: 'kindnessPoints', compute: () => (this.flags.get('kindnessPoints') || 0) + 1 }]
            }]
        };
        return rules[key] || [];
    }

    // ==================== 角色关系 ====================

    setRelationship(characterId, value) {
        const clamped = Math.max(-100, Math.min(100, value));
        const oldValue = this.relationships.get(characterId) || 0;
        this.relationships.set(characterId, clamped);
        this._notifyChange('relationship:changed', { characterId, oldValue, newValue: clamped });
        if (clamped >= 80) this.setFlag(`friendship_${characterId}`, true);
        if (clamped <= -50) this.setFlag(`enmity_${characterId}`, true);
    }

    adjustRelationship(characterId, delta) {
        const current = this.relationships.get(characterId) || 0;
        this.setRelationship(characterId, current + delta);
    }

    getRelationship(characterId) {
        return this.relationships.get(characterId) || 0;
    }

    getRelationshipLabel(value) {
        if (value >= 90) return '挚友';
        if (value >= 70) return '好友';
        if (value >= 40) return '友好';
        if (value >= 10) return '认识';
        if (value >= -10) return '中立';
        if (value >= -40) return '冷淡';
        if (value >= -70) return '敌对';
        return '死敌';
    }

    getAllRelationships() {
        const result = {};
        this.relationships.forEach((v, k) => { result[k] = v; });
        return result;
    }

    // ==================== 世界状态 ====================

    setWorldState(key, value) {
        this.worldState.set(key, value);
        this._notifyChange('worldState:changed', { key, value });
    }

    getWorldState(key) {
        return this.worldState.get(key);
    }

    getAllWorldState() {
        const result = {};
        this.worldState.forEach((v, k) => { result[k] = v; });
        return result;
    }

    // ==================== 选项配置 ====================

    setOptionsConfig(config) {
        Object.assign(this.optionsConfig, config);
        this._notifyChange('config:changed', this.optionsConfig);
    }

    getOptionsConfig() {
        return { ...this.optionsConfig };
    }

    // ==================== 选项评估 ====================

    evaluateOption(option) {
        if (!option.conditions || Object.keys(option.conditions).length === 0) {
            return { available: true };
        }
        const checks = [];
        if (option.conditions.flags) {
            Object.entries(option.conditions.flags).forEach(([key, expected]) => {
                const actual = this.flags.get(key);
                checks.push({
                    type: 'flag',
                    key,
                    expected,
                    actual,
                    passed: actual === expected
                });
            });
        }
        if (option.conditions.relationships) {
            Object.entries(option.conditions.relationships).forEach(([charId, op]) => {
                const value = this.relationships.get(charId) || 0;
                let passed = false;
                if (typeof op === 'number') {
                    passed = value >= op;
                } else if (typeof op === 'object') {
                    const min = op.min ?? -Infinity;
                    const max = op.max ?? Infinity;
                    passed = value >= min && value <= max;
                }
                checks.push({ type: 'relationship', key: charId, actual: value, passed });
            });
        }
        if (option.conditions.worldState) {
            Object.entries(option.conditions.worldState).forEach(([key, expected]) => {
                const actual = this.worldState.get(key);
                checks.push({
                    type: 'worldState', key, expected, actual,
                    passed: actual === expected
                });
            });
        }
        if (option.conditions.attributes) {
            Object.entries(option.conditions.attributes).forEach(([attr, min]) => {
                checks.push({
                    type: 'attribute', key: attr, min,
                    passed: true
                });
            });
        }
        const allPassed = checks.every(c => c.passed);
        const failedChecks = checks.filter(c => !c.passed);
        return {
            available: allPassed,
            checks,
            failedChecks,
            hint: allPassed ? null : this._generateFailHint(failedChecks)
        };
    }

    _generateFailHint(failedChecks) {
        return failedChecks.map(c => {
            switch (c.type) {
                case 'flag': return `需要达到条件: ${c.key}`;
                case 'relationship': return `关系值不足`;
                case 'worldState': return `世界状态不符`;
                case 'attribute': return `属性 ${c.key} >= ${c.min}`;
                default: return '条件不足';
            }
        }).join('; ');
    }

    // ==================== 选项选择 ====================

    selectOption(option) {
        if (option.effects) {
            if (option.effects.flags) {
                Object.entries(option.effects.flags).forEach(([key, value]) => {
                    this.setFlag(key, value);
                });
            }
            if (option.effects.relationships) {
                Object.entries(option.effects.relationships).forEach(([charId, delta]) => {
                    this.adjustRelationship(charId, delta);
                });
            }
            if (option.effects.worldState) {
                Object.entries(option.effects.worldState).forEach(([key, value]) => {
                    this.setWorldState(key, value);
                });
            }
        }
        this._notifyChange('option:selected', option);
        return option.targetNodeId;
    }

    // ==================== 结局计算 ====================

    calculateEnding(endings, flagRules = {}) {
        const scores = endings.map(ending => {
            let score = 0;
            const rules = flagRules[ending.id] || {};
            Object.entries(rules).forEach(([flag, weight]) => {
                const value = this.flags.get(flag);
                if (value !== undefined) {
                    score += (value ? weight : 0);
                }
            });
            score += this._calculateRelationshipScore(ending.relationshipWeights);
            return { ...ending, score };
        });
        scores.sort((a, b) => b.score - a.score);
        return scores;
    }

    _calculateRelationshipScore(weights = {}) {
        let score = 0;
        Object.entries(weights).forEach(([charId, weight]) => {
            score += (this.relationships.get(charId) || 0) * weight;
        });
        return score;
    }

    // ==================== 导出/导入状态 ====================

    exportState() {
        return {
            flags: this.getAllFlags(),
            relationships: this.getAllRelationships(),
            worldState: this.getAllWorldState(),
            config: this.getOptionsConfig(),
            exportedAt: new Date().toISOString()
        };
    }

    importState(state) {
        Object.entries(state.flags || {}).forEach(([k, v]) => this.flags.set(k, v));
        Object.entries(state.relationships || {}).forEach(([k, v]) => this.relationships.set(k, v));
        Object.entries(state.worldState || {}).forEach(([k, v]) => this.worldState.set(k, v));
        if (state.config) this.setOptionsConfig(state.config);
        this._notifyChange('state:imported', state);
    }

    reset() {
        this.flags.clear();
        this.relationships.clear();
        this.worldState.clear();
        this._notifyChange('state:reset', null);
    }
}

window.GameOptionsSystem = GameOptionsSystem;
