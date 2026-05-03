/* ============================================================
   妄想商铺 音效管理器
   Audio Engine v2.0
   ============================================================ */
(function(global) {
    'use strict';

    class AudioManager {
        constructor() {
            this.context = null;
            this.masterGain = null;
            this.musicGain = null;
            this.sfxGain = null;
            this.muted = false;
            this.musicVolume = 0.4;
            this.sfxVolume = 0.6;
            this.buffers = {};
            this.activeSources = {};
            this.currentMusic = null;
            this.isInitialized = false;
        }

        async init() {
            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);
                this.masterGain.gain.value = 1;

                this.musicGain = this.context.createGain();
                this.musicGain.connect(this.masterGain);
                this.musicGain.gain.value = this.musicVolume;

                this.sfxGain = this.context.createGain();
                this.sfxGain.connect(this.masterGain);
                this.sfxGain.gain.value = this.sfxVolume;

                await this._generateDefaultSounds();
                this.isInitialized = true;
                console.log('%c[妄想商舗 音效] %c就緒',
                    'color:#c084fc;font-weight:bold;', 'color:#06b6d4;');
            } catch (e) {
                console.warn('[Audio] Failed to init:', e.message);
            }
        }

        async _generateDefaultSounds() {
            const sounds = {
                'click': this._createClickSound(),
                'hover': this._createHoverSound(),
                'success': this._createSuccessSound(),
                'error': this._createErrorSound(),
                'open': this._createOpenSound(),
                'close': this._createCloseSound(),
                'transition': this._createTransitionSound(),
                'unlock': this._createUnlockSound(),
                'branch': this._createBranchSound(),
                'levelup': this._createLevelUpSound(),
                'atmosphere': this._createAtmosphereLoop(),
            };

            for (const [name, config] of Object.entries(sounds)) {
                try {
                    if (config.loop) {
                        this.buffers[name] = config;
                    } else {
                        const buffer = await this._generateBuffer(config);
                        this.buffers[name] = buffer;
                    }
                } catch (e) { /* skip */ }
            }
        }

        async _generateBuffer(config) {
            const sampleRate = this.context.sampleRate;
            const duration = config.duration || 0.15;
            const length = Math.floor(sampleRate * duration);
            const buffer = this.context.createBuffer(1, length, sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                const envelope = Math.max(0, 1 - t / duration) * Math.min(1, t * 60);
                data[i] = this._generateTone(t, config) * envelope * (config.volume || 0.3);
            }
            return buffer;
        }

        _generateTone(t, config) {
            let sample = 0;
            const freq = config.freq || 800;
            const type = config.type || 'sine';

            if (type === 'sine') sample = Math.sin(2 * Math.PI * freq * t);
            else if (type === 'square') sample = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
            else if (type === 'triangle') sample = 2 * Math.abs(2 * (t * freq % 1) - 1) - 1;
            else if (type === 'noise') sample = Math.random() * 2 - 1;
            else if (type === 'chord') {
                sample += Math.sin(2 * Math.PI * freq * t) * 0.5;
                sample += Math.sin(2 * Math.PI * freq * 1.25 * t) * 0.3;
                sample += Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.2;
            } else if (type === 'sweep') {
                const sweepFreq = freq * (1 + t * (config.sweepRate || 4));
                sample = Math.sin(2 * Math.PI * sweepFreq * t);
            } else if (type === 'drop') {
                const dropFreq = freq * Math.max(0.1, 1 - t * 3);
                sample = Math.sin(2 * Math.PI * dropFreq * t);
            } else if (type === 'rise') {
                const riseFreq = freq * (0.3 + t * 3);
                sample = Math.sin(2 * Math.PI * riseFreq * t);
            }

            return sample;
        }

        _createClickSound() { return { type: 'sweep', freq: 1200, sweepRate: 2, duration: 0.08, volume: 0.2 }; }
        _createHoverSound() { return { type: 'sine', freq: 1800, duration: 0.04, volume: 0.1 }; }
        _createSuccessSound() { return { type: 'chord', freq: 523, duration: 0.4, volume: 0.25 }; }
        _createErrorSound() { return { type: 'drop', freq: 400, duration: 0.3, volume: 0.2 }; }
        _createOpenSound() { return { type: 'rise', freq: 600, duration: 0.3, volume: 0.2 }; }
        _createCloseSound() { return { type: 'drop', freq: 600, duration: 0.2, volume: 0.15 }; }
        _createTransitionSound() { return { type: 'sweep', freq: 400, sweepRate: 3, duration: 0.5, volume: 0.15 }; }
        _createUnlockSound() { return { type: 'chord', freq: 660, duration: 0.5, volume: 0.3 }; }
        _createBranchSound() { return { type: 'rise', freq: 800, duration: 0.25, volume: 0.2 }; }
        _createLevelUpSound() { return { type: 'sweep', freq: 440, sweepRate: 2, duration: 0.6, volume: 0.3 }; }
        _createAtmosphereLoop() {
            return {
                type: 'chord', freq: 55, duration: 4, volume: 0.04,
                loop: true, sustainedNote: true
            };
        }

        play(name, options = {}) {
            if (!this.isInitialized || this.muted) return;
            if (options.sfx === false && options.music === false) return;
            if (!this.buffers[name]) return;

            const useSfxGain = name !== 'atmosphere';
            const buffer = this.buffers[name];

            if (buffer.loop) {
                this._playLoop(name, buffer, options);
                return;
            }

            if (this.context.state === 'suspended') this.context.resume();

            const source = this.context.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.context.createGain();
            source.connect(gainNode);
            gainNode.connect(useSfxGain ? this.sfxGain : this.musicGain);
            gainNode.gain.value = options.volume || 1;

            const id = `${name}_${Date.now()}`;
            this.activeSources[id] = { source, gainNode };
            source.onended = () => { delete this.activeSources[id]; };

            source.start(0);
            return id;
        }

        _playLoop(name, config, options) {
            if (this.currentMusic === name) return;
            this.stopMusic();

            if (this.context.state === 'suspended') this.context.resume();

            const duration = config.duration || 4;
            const buffer = this.context.createBuffer(1, Math.floor(this.context.sampleRate * duration), this.context.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < buffer.length; i++) {
                const t = i / this.context.sampleRate;
                data[i] = this._generateTone(t % 2, config) * config.volume;
            }

            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(this.musicGain);
            source.start(0);
            this.currentMusic = name;
            this.activeSources[name] = { source, gainNode: this.musicGain };
        }

        stopAll(name) {
            if (name && this.activeSources[name]) {
                try { this.activeSources[name].source.stop(); } catch (e) {}
                delete this.activeSources[name];
            } else if (!name) {
                for (const [key, val] of Object.entries(this.activeSources)) {
                    try { val.source.stop(); } catch (e) {}
                    delete this.activeSources[key];
                }
            }
        }

        stopMusic() {
            if (this.currentMusic && this.activeSources[this.currentMusic]) {
                try { this.activeSources[this.currentMusic].source.stop(); } catch (e) {}
                delete this.activeSources[this.currentMusic];
            }
            this.currentMusic = null;
        }

        setMusicVolume(v) { this.musicVolume = Math.max(0, Math.min(1, v)); if (this.musicGain) this.musicGain.gain.value = this.musicVolume; }
        setSfxVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, v)); if (this.sfxGain) this.sfxGain.gain.value = this.sfxVolume; }

        toggleMute() {
            this.muted = !this.muted;
            if (this.masterGain) this.masterGain.gain.value = this.muted ? 0 : 1;
            return this.muted;
        }

        async destroy() {
            this.stopAll();
            this.stopMusic();
            if (this.context && this.context.state !== 'closed') await this.context.close();
            this.buffers = {};
            this.activeSources = {};
            this.isInitialized = false;
        }
    }

    global.Drawrealm = global.Drawrealm || {};
    global.Drawrealm.Audio = new AudioManager();

})(window);
