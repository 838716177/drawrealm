/* ============================================================
   妄想商铺 核心引擎 - 状态管理 | 事件总线 | 存储
   Engine Core v2.0
   ============================================================ */
(function(global) {
    'use strict';

    class EngineCore {
        constructor() {
            this._state = {};
            this._listeners = {};
            this._initialized = false;
            this._version = '2.0.0';
        }

        init(initialState = {}) {
            if (this._initialized) return this;
            this._state = Object.assign({
                app: {
                    phase: 'loading',
                    currentScreen: 'title',
                    previousScreen: null,
                    transitionsEnabled: true,
                    animationSpeed: 1,
                },
                user: {
                    isLoggedIn: false,
                    userId: null,
                    username: '訪客',
                    avatar: null,
                    title: '',
                    tokens: 0,
                },
                world: {
                    currentWorldId: null,
                    currentBranchId: null,
                    currentNodeId: null,
                    choiceHistory: [],
                    flags: {},
                    worldVariables: {},
                    npcRelationships: {},
                },
                character: {
                    currentCharacterId: null,
                    characterState: {
                        visual: { level: 1, equipped_title: '', outfit: 'default', weapon_skin: '', aura: '', mount: '' },
                        capability: { attributes: { str: 10, agi: 10, int: 10, vit: 10, cha: 10, luk: 10 }, skills: [], passive_skills: [], combat_power: 100 },
                        relational: { npc_relationships: {}, faction_standing: {} },
                        world_state: { flags: {}, economy: {}, weather: 'clear' },
                    },
                },
                branch: {
                    branches: [],
                    currentForkDepth: 0,
                    totalBranches: 0,
                },
                ui: {
                    modals: [],
                    toasts: [],
                    rippleEnabled: true,
                    particlesEnabled: true,
                },
            }, initialState);
            this._initialized = true;
            this.emit('core:initialized', this._state);
            return this;
        }

        getState(path) {
            if (!path) return { ...this._state };
            return path.split('.').reduce((obj, key) => obj?.[key], this._state);
        }

        setState(path, value) {
            const keys = path.split('.');
            const lastKey = keys.pop();
            let target = this._state;
            for (const key of keys) {
                if (!target[key] || typeof target[key] !== 'object') target[key] = {};
                target = target[key];
            }
            const oldValue = target[lastKey];
            target[lastKey] = value;
            this.emit('state:change', { path, oldValue, newValue: value });
            this.emit(`state:${path}`, value);
            return this;
        }

        mergeState(path, value) {
            const current = this.getState(path);
            const merged = typeof current === 'object' && !Array.isArray(current)
                ? { ...current, ...value }
                : value;
            return this.setState(path, merged);
        }

        on(event, callback) {
            if (!this._listeners[event]) this._listeners[event] = [];
            this._listeners[event].push(callback);
            return () => this.off(event, callback);
        }

        off(event, callback) {
            if (!this._listeners[event]) return;
            this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
        }

        emit(event, data) {
            if (!this._listeners[event]) return;
            for (const cb of this._listeners[event]) {
                try { cb(data); } catch (e) { console.error(`[Engine] Event "${event}" error:`, e); }
            }
        }

        once(event, callback) {
            const wrapper = (data) => {
                this.off(event, wrapper);
                callback(data);
            };
            this.on(event, wrapper);
        }

        waitFor(event, timeout = 10000) {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.off(event, handler);
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout);
                const handler = (data) => {
                    clearTimeout(timer);
                    resolve(data);
                };
                this.once(event, handler);
            });
        }

        saveToStorage() {
            try {
                localStorage.setItem('drawrealm_state', JSON.stringify(this._state));
            } catch (e) { console.warn('[Engine] Failed to save state:', e.message); }
        }

        loadFromStorage() {
            try {
                const raw = localStorage.getItem('drawrealm_state');
                if (raw) {
                    const saved = JSON.parse(raw);
                    Object.assign(this._state, saved);
                    this._initialized = true;
                    this.emit('core:restored', this._state);
                    return true;
                }
            } catch (e) { console.warn('[Engine] Failed to load state:', e.message); }
            return false;
        }

        clearStorage() {
            try { localStorage.removeItem('drawrealm_state'); } catch (e) {}
        }

        navigateTo(screen) {
            const previous = this.getState('app.currentScreen');
            this.setState('app.previousScreen', previous);
            this.setState('app.currentScreen', screen);
            this.emit('navigation:change', { from: previous, to: screen });
        }

        destroy() {
            this._listeners = {};
            this._state = {};
            this._initialized = false;
        }
    }

    const engine = new EngineCore();
    global.Engine = engine;
    global.Drawrealm = global.Drawrealm || {};
    global.Drawrealm.Engine = engine;

    console.log('%c[妄想商舗 核心引擎] %c初始化済み v' + engine._version,
        'color:#c084fc;font-weight:bold;', 'color:#06b6d4;');

})(window);
