/* ============================================================
   妄想商铺 UI增强引擎
   UI Engine v2.0 - Particles | Transitions | Modals | Toasts | Ripples
   ============================================================ */
(function(global) {
    'use strict';

    class UIEngine {
        constructor(engine) {
            this.engine = engine || global.Engine;
            this._particleContainer = null;
            this._particleInterval = null;
            this._toastQueue = [];
            this._activeToasts = [];
        }

        init() {
            this.engine.on('navigation:change', (data) => {
                this._onNavigation(data.from, data.to);
            });
            return this;
        }

        _onNavigation(from, to) {
            if (from === 'title' && to === 'main-menu') {
                if (this.engine.getState('ui.transitionsEnabled')) {
                    this.createTransitionParticles();
                }
            }
        }

        initParticles(containerSelector = '.particle-container') {
            let container = document.querySelector(containerSelector);
            if (!container) {
                container = document.createElement('div');
                container.className = 'particle-container';
                container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;';
                document.body.appendChild(container);
            }
            this._particleContainer = container;

            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'loading-particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 5 + 's';
                particle.style.animationDuration = (2 + Math.random() * 4) + 's';
                particle.style.width = (2 + Math.random() * 3) + 'px';
                particle.style.height = particle.style.width;
                if (Math.random() > 0.5) {
                    particle.style.background = 'var(--color-cyan)';
                    particle.style.boxShadow = '0 0 6px var(--color-cyan)';
                }
                container.appendChild(particle);
            }
        }

        createTransitionParticles(count = 30) {
            if (!this.engine.getState('ui.particlesEnabled')) return;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const p = document.createElement('div');
                    p.style.cssText = `
                        position:fixed;width:6px;height:6px;border-radius:50%;
                        background:linear-gradient(135deg,#a855f7,#06b6d4);
                        box-shadow:0 0 20px 4px rgba(168,85,247,0.6),0 0 40px 8px rgba(6,182,212,0.3);
                        left:${Math.random() * 100}%;top:${Math.random() * 100}%;
                        animation:transitionBurst ${0.5 + Math.random()}s ease-out forwards;
                        pointer-events:none;z-index:999;
                    `;
                    document.body.appendChild(p);
                    setTimeout(() => p.remove(), 1500);
                }, i * 20);
            }
        }

        showToast(message, options = {}) {
            const config = {
                type: options.type || 'info',
                duration: options.duration || 3000,
                position: options.position || 'top-center',
                icon: options.icon || this._getToastIcon(options.type),
            };

            const toast = document.createElement('div');
            toast.className = `toast toast-${config.type}`;
            toast.innerHTML = `<span class="toast-icon">${config.icon}</span><span class="toast-msg">${message}</span>`;
            toast.style.cssText = `
                position:fixed;z-index:400;padding:12px 20px;
                background:rgba(15,12,30,0.9);border:1px solid rgba(168,85,247,0.3);
                border-radius:14px;color:#fff;font-size:0.9rem;font-family:inherit;
                backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
                display:flex;align-items:center;gap:8px;
                box-shadow:0 8px 32px rgba(0,0,0,0.4);
                animation:toastSlideIn 0.4s cubic-bezier(0.4,0,0.2,1);
                opacity:1;transform:translateY(0);
            `;

            switch (config.position) {
                case 'top-center': toast.style.top = '24px'; toast.style.left = '50%'; toast.style.transform = 'translateX(-50%)'; break;
                case 'bottom-center': toast.style.bottom = '24px'; toast.style.left = '50%'; toast.style.transform = 'translateX(-50%)'; break;
                case 'top-right': toast.style.top = '24px'; toast.style.right = '24px'; break;
                default: toast.style.top = '24px'; toast.style.left = '50%'; toast.style.transform = 'translateX(-50%)';
            }

            document.body.appendChild(toast);
            this._activeToasts.push(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = config.position.includes('center')
                    ? 'translate(-50%, -20px)'
                    : 'translateY(-20px)';
                toast.style.transition = 'all 0.35s ease';
                setTimeout(() => {
                    toast.remove();
                    this._activeToasts = this._activeToasts.filter(t => t !== toast);
                }, 400);
            }, config.duration);

            if (config.type === 'success' && global.Drawrealm?.Audio) {
                global.Drawrealm.Audio.play('success');
            } else if (config.type === 'error' && global.Drawrealm?.Audio) {
                global.Drawrealm.Audio.play('error');
            }
        }

        _getToastIcon(type) {
            switch (type) {
                case 'success': return '✓';
                case 'error': return '✕';
                case 'warning': return '⚠';
                case 'info':
                default: return '✦';
            }
        }

        createRipple(event, element) {
            if (!this.engine.getState('ui.rippleEnabled')) return;

            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;

            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = size + 'px';
            ripple.style.height = size + 'px';

            element.appendChild(ripple);
            setTimeout(() => ripple.remove(), 900);
        }

        showModal(content, options = {}) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            const modal = document.createElement('div');
            modal.className = 'modal-content';

            if (options.title) {
                const header = document.createElement('div');
                header.className = 'modal-header';
                header.innerHTML = `<h3>${options.title}</h3>`;
                const closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close';
                closeBtn.innerHTML = '✕';
                closeBtn.onclick = () => overlay.remove();
                header.appendChild(closeBtn);
                modal.appendChild(header);
            }

            const body = document.createElement('div');
            body.className = 'modal-body';
            if (typeof content === 'string') body.innerHTML = content;
            else if (content instanceof HTMLElement) body.appendChild(content);
            modal.appendChild(body);

            if (options.footer) {
                const footer = document.createElement('div');
                footer.className = 'modal-footer';
                if (typeof options.footer === 'string') footer.innerHTML = options.footer;
                else if (options.footer instanceof HTMLElement) footer.appendChild(options.footer);
                modal.appendChild(footer);
            }

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay && options.closeOnOverlayClick !== false) {
                    overlay.remove();
                }
            });

            if (global.Drawrealm?.Audio) {
                global.Drawrealm.Audio.play('open');
            }

            return { overlay, modal, close: () => overlay.remove() };
        }

        showLoading(element, text = '加载中...') {
            const existing = element.querySelector('.loading-indicator');
            if (existing) existing.style.display = 'flex';
            else {
                const indicator = document.createElement('div');
                indicator.className = 'loading-indicator';
                indicator.innerHTML = `<div class="loading-spinner"></div><span class="loading-text">${text}</span>`;
                indicator.style.display = 'flex';
                element.appendChild(indicator);
            }
        }

        hideLoading(element) {
            const indicator = element.querySelector('.loading-indicator');
            if (indicator) indicator.style.display = 'none';
        }

        animateElement(element, animationName, duration = 400) {
            element.style.animation = `${animationName} ${duration}ms ease-out`;
            return new Promise(resolve => {
                setTimeout(() => {
                    element.style.animation = '';
                    resolve();
                }, duration);
            });
        }

        staggerChildren(container, selector, animationName = 'fadeSlideIn', staggerMs = 80) {
            const children = container.querySelectorAll(selector);
            children.forEach((child, i) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(16px)';
                setTimeout(() => {
                    child.style.transition = 'all 0.4s cubic-bezier(0.4,0,0.2,1)';
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, i * staggerMs);
            });
        }

        applyGlassEffect(element) {
            element.style.background = 'var(--bg-glass)';
            element.style.backdropFilter = 'blur(20px)';
            element.style.webkitBackdropFilter = 'blur(20px)';
            element.style.border = '1px solid var(--border-default)';
        }
    }

    global.Drawrealm = global.Drawrealm || {};
    global.Drawrealm.UI = new UIEngine(global.Engine);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes toastSlideIn { from{opacity:0;transform:translate(-50%,-20px)} to{opacity:1;transform:translate(-50%,0)} }
        @keyframes transitionBurst {
            0%{transform:scale(0);opacity:1;}
            50%{transform:scale(1.5);opacity:0.8;}
            100%{transform:scale(3);opacity:0;}
        }
        .toast-success .toast-icon{color:#06b6d4;}
        .toast-error .toast-icon{color:#ff6b6b;}
        .toast-warning .toast-icon{color:#ff9500;}
        .toast-info .toast-icon{color:#c084fc;}
    `;
    document.head.appendChild(styleSheet);

})(window);
