// ========================================
// 情绪盒子 - 应用主入口
// ========================================

const App = {
    currentPage: 'home',
    pageHistory: [],
    isInitialized: false,

    init() {
        this.initUserConfig();
        this.initModules();
        this.bindGlobalEvents();
        this.setupNavigation();
        this.checkOnboarding();
    },

    checkOnboarding() {
        try {
            // 防止重复初始化
            if (this.isInitialized) {
                console.log('App already initialized, skipping check');
                return;
            }
            
            const userConfig = Storage.getUserConfig();
            console.log('检查准入状态:', {
                onboardingCompleted: userConfig.onboardingCompleted,
                mbti: userConfig.mbti,
                holland: userConfig.holland
            });

            // 先隐藏所有页面，避免闪烁
            const pages = Helpers.$$('.page');
            pages.forEach(page => page.classList.add('hidden'));

            // 决定显示哪个页面
            if (userConfig.onboardingCompleted) {
                console.log('已完成准入，直接进入主页面');
                this.showPageImmediately('home');
            } else {
                console.log('首次进入，显示准入页面');
                this.showPageImmediately('onboarding');
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.error('检查准入状态失败:', error);
            // 出错时直接进入主页面
            this.showPageImmediately('home');
            this.isInitialized = true;
        }
    },

    initUserConfig() {
        const userConfig = Storage.getUserConfig();

        if (userConfig.theme) {
            const emotion = getEmotionById(userConfig.theme);
            if (emotion) {
                document.documentElement.style.setProperty('--current-emotion', emotion.color);
            }
            document.documentElement.setAttribute('data-theme', userConfig.theme);
        }
    },

    initModules() {
        MoodModule.init();
        DiaryModule.init();
        AIModule.init();
        StatsModule.init();
        SettingsModule.init();
        PersonalityModule.init();
        AuthModule.init();
        ReleaseModule.init();
        HappyModule.init();
        TestModule.init();
    },

    bindGlobalEvents() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');

        // 修复：使用事件委托，点击遮罩或关闭按钮都关闭
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                // 点击遮罩层或关闭按钮时关闭
                if (e.target === modalOverlay || e.target.closest('.modal-close')) {
                    this.closeModal();
                }
            });
        }

        // ESC 键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // 绑定所有返回按钮（跳过测试页面，使用test.js中的专门处理）
        const backButtons = [
            'backFromHistory', 'backFromDiary', 'backFromMoodWall',
            'backFromAI', 'backFromRelease', 'backFromHappy',
            'backFromProfile', 'backFromSettings'
        ];

        backButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.navigateTo('home');
                });
            }
        });
    },

    setupNavigation() {
        const navItems = Helpers.$$('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
    },

    navigateTo(page) {
        if (this.currentPage !== page) {
            this.pageHistory.push(this.currentPage);
        }

        this.showPage(page);
        this.updateNavigation(page);
    },

    showPageImmediately(pageId) {
        const pages = Helpers.$$('.page');
        
        // 立即隐藏所有页面
        pages.forEach(page => {
            page.classList.add('hidden');
            page.style.animation = '';
        });

        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            // 立即显示目标页面，无延迟
            targetPage.classList.remove('hidden');
            this.currentPage = pageId;
            this.updateNavigation(pageId);

            // 触发页面特定逻辑
            if (pageId === 'moodWall') {
                StatsModule.show();
            } else if (pageId === 'history') {
                DiaryModule.showDiaryList();
            } else if (pageId === 'diary') {
                DiaryModule.showEditor();
            }

            window.scrollTo({ top: 0, behavior: 'auto' });
            console.log(`页面立即切换到: ${pageId}`);
        }
    },

    showPage(pageId) {
        const pages = Helpers.$$('.page');

        // 淡出当前页面
        pages.forEach(page => {
            if (!page.classList.contains('hidden')) {
                page.style.animation = 'fadeOut 0.2s ease-out forwards';
                setTimeout(() => {
                    page.classList.add('hidden');
                    page.style.animation = '';
                }, 200);
            } else {
                page.classList.add('hidden');
            }
        });

        const targetPage = document.getElementById(`${pageId}Page`);
        if (targetPage) {
            // 延迟显示新页面并添加淡入效果
            setTimeout(() => {
                targetPage.classList.remove('hidden');
                targetPage.style.animation = 'fadeIn 0.3s ease-out';

                this.currentPage = pageId;

                if (pageId === 'moodWall') {
                    StatsModule.show();
                } else if (pageId === 'history') {
                    DiaryModule.showDiaryList();
                } else if (pageId === 'diary') {
                    DiaryModule.showEditor();
                }

                window.scrollTo({ top: 0, behavior: 'smooth' });

                // 动画结束后清除style
                setTimeout(() => {
                    targetPage.style.animation = '';
                }, 300);
            }, 220);
        }
    },

    updateNavigation(page) {
        const navItems = Helpers.$$('.nav-item');

        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
    },

    showModal(title, content, buttons = []) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const modalFooter = document.getElementById('modalFooter');

        if (!modalOverlay) return;

        // 保存按钮配置到全局变量，供事件处理使用
        this._modalButtons = buttons;

        // 设置内容
        if (modalTitle) modalTitle.textContent = title;
        if (modalBody) modalBody.innerHTML = content;

        // 设置按钮
        if (modalFooter) {
            if (buttons.length > 0) {
                modalFooter.innerHTML = buttons.map((btn, idx) => {
                    // 使用 idx 作为标识，而不是直接把 action 转为字符串
                    return `<button class="${btn.class || 'secondary-btn'}" data-btn-index="${idx}">${btn.text}</button>`;
                }).join('');

                // 延迟一点确保DOM已渲染
                setTimeout(() => {
                    const btns = modalFooter.querySelectorAll('button');
                    btns.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const idx = parseInt(btn.dataset.btnIndex);
                            const buttonConfig = this._modalButtons[idx];
                            if (buttonConfig && typeof buttonConfig.action === 'function') {
                                buttonConfig.action();
                            }
                        });
                    });
                }, 50);

                modalFooter.style.display = 'flex';
            } else {
                modalFooter.style.display = 'none';
            }
        }

        // 显示弹窗
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    },

    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');

        if (modalOverlay) {
            modalOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    },

    goBack() {
        if (this.pageHistory.length > 0) {
            const previousPage = this.pageHistory.pop();
            this.showPage(previousPage);
            this.updateNavigation(previousPage);
        }
    },

    showToast(message, type = 'default', duration = 3000) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // 触发动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自动移除
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }
};

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});