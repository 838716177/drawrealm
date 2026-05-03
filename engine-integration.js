/* ============================================================
   妄想商铺 引擎集成层
   Integration Layer - Hooks engine into existing app.js without modifications
   Uses event delegation, MutationObserver & function wrapping
   ============================================================ */
(function(global) {
    'use strict';

    const E = global.Drawrealm?.Engine;
    const Audio = global.Drawrealm?.Audio;
    const UI = global.Drawrealm?.UI;
    const Branch = global.Drawrealm?.Branch;

    if (!E) return;

    document.addEventListener('click', function(e) {
        const target = e.target.closest('button, .btn-primary, .btn-secondary, .menu-btn, .back-btn, .choice-button, .action-btn, .add-btn, .editor-entry-btn, .world-type-card, .worldbook-card, .character-card, .category-tab, .lib-card');
        if (!target) return;

        if (Audio && Audio.isInitialized) {
            Audio.play('click');
        }
        if (UI) {
            UI.createRipple(e, target);
        }
    }, true);

    document.addEventListener('mouseover', function(e) {
        const target = e.target.closest('.menu-btn, .choice-button, .back-btn, .action-btn, .world-type-card, .worldbook-card, .character-card, .category-tab, .nav-item, .lib-card');
        if (!target) return;
        if (Audio && Audio.isInitialized) {
            Audio.play('hover');
        }
    }, true);

    function hookAppJsFunctions() {
        if (typeof global.showMainMenu === 'function') {
            const origShowMainMenu = global.showMainMenu;
            global.showMainMenu = function() {
                E.navigateTo('main-menu');
                if (UI) UI.createTransitionParticles(25);
                E.saveToStorage();
                return origShowMainMenu.apply(this, arguments);
            };
        }

        if (typeof global.showStorePage === 'function') {
            const origShowStorePage = global.showStorePage;
            global.showStorePage = function() {
                E.navigateTo('store');
                return origShowStorePage.apply(this, arguments);
            };
        }

        if (typeof global.showCreateWorld === 'function') {
            const origShowCreateWorld = global.showCreateWorld;
            global.showCreateWorld = function() {
                E.navigateTo('create-world');
                return origShowCreateWorld.apply(this, arguments);
            };
        }

        if (typeof global.goBack === 'function') {
            const origGoBack = global.goBack;
            global.goBack = function() {
                E.navigateTo(E.getState('app.previousScreen') || 'main-menu');
                return origGoBack.apply(this, arguments);
            };
        }

        setTimeout(hookAppJsFunctions, 100);
    }

    hookAppJsFunctions();

    const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== 1) continue;

                if (node.matches && node.matches('.main-menu, .world-creator-background, .store-content, .character-select-content, .fullscreen-video-player')) {
                    if (UI) UI.staggerChildren(node, '.menu-btn, .worldbook-card, .character-card, .choice-button', 'fadeSlideIn', 60);
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const keyboardHandler = function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal-overlay, .lib-detail-overlay');
            modals.forEach(m => m.remove());
        }
    };
    document.addEventListener('keydown', keyboardHandler);

    document.addEventListener('DOMContentLoaded', function() {
        if (UI) UI.initParticles();
    });

    global.Drawrealm = global.Drawrealm;

})(window);
