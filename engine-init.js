/* ============================================================
   妄想商铺 引擎初始化桥接
   Engine Init Bridge - Connects existing app.js with engine modules
   ============================================================ */
(function(global) {
    'use strict';

    if (!global.Drawrealm || !global.Drawrealm.Engine) {
        console.error('[EngineInit] Engine core not found!');
        return;
    }

    const E = global.Drawrealm.Engine;
    const Audio = global.Drawrealm.Audio;
    const UI = global.Drawrealm.UI;
    const Branch = global.Drawrealm.Branch;

    E.init();
    E.loadFromStorage();
    E.navigateTo('title');

    Audio.init().then(() => {
        Audio.play('atmosphere', { music: true });
    });

    Branch.init();
    UI.init();

    global.createRipple = function(event) {
        UI.createRipple(event, event.currentTarget);
    };

    global.playClick = function() {
        if (Audio) Audio.play('click');
    };

    global.playHover = function() {
        if (Audio) Audio.play('hover');
    };

    global.playSuccess = function() {
        if (Audio) Audio.play('success');
    };

    global.playError = function() {
        if (Audio) Audio.play('error');
    };

    global.showToast = function(msg, type) {
        if (UI) UI.showToast(msg, { type: type || 'info' });
    };

    global.showModalDialog = function(content, options) {
        if (UI) return UI.showModal(content, options);
        return null;
    };

    global.showLoading = function(element, text) {
        if (UI) UI.showLoading(element, text);
    };

    global.hideLoading = function(element) {
        if (UI) UI.hideLoading(element);
    };

    global.animateStagger = function(container, selector, animName) {
        if (UI) UI.staggerChildren(container, selector, animName);
    };

    global.createBranch = async function(worldId, parentBranchId, forkPointNodeId, diffData) {
        if (!Branch) {
            UI.showToast('分支系统尚未就緒', 'warning');
            return null;
        }
        try {
            const branch = await Branch.createBranch(worldId, parentBranchId, forkPointNodeId, diffData);
            UI.showToast('新分支已創建！其他人將能探索你的故事線', 'success');
            UI.createTransitionParticles(20);
            return branch;
        } catch (e) {
            UI.showToast('創建分支失敗：' + e.message, 'error');
            return null;
        }
    };

    global.getBranchTree = function(worldId) {
        return Branch ? Branch.getBranchTree(worldId) : [];
    };

    global.getBranchesAtNode = function(worldId, nodeId) {
        return Branch ? Branch.getBranchesAtNode(worldId, nodeId) : [];
    };

    global.getHotBranches = function(worldId, limit) {
        return Branch ? Branch.getHotBranches(worldId, limit) : [];
    };

    E.on('state:user.isLoggedIn', (isLoggedIn) => {
        if (isLoggedIn) {
            E.saveToStorage();
        }
    });

    E.on('branch:created', (branch) => {
        E.saveToStorage();
        console.log('[EngineInit] Branch created:', branch.id);
    });

    window.addEventListener('beforeunload', () => {
        E.saveToStorage();
    });

    global.Engine = E;
    global.Drawrealm = global.Drawrealm;

    console.log('%c[妄想商舗] %c全模塊初始化完成 %c✦',
        'color:#c084fc;font-weight:bold;',
        'color:#06b6d4;',
        'color:#a855f7;');

})(window);
