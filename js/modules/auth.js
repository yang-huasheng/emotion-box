const AuthModule = {
    currentUser: null,
    isLoggedIn: false,

    init() {
        this.checkLoginStatus();
        this.bindEvents();
    },

    checkLoginStatus() {
        const userConfig = Storage.getUserConfig();
        if (userConfig && userConfig.hasAccount) {
            this.currentUser = userConfig;
            this.isLoggedIn = true;
        }
    },

    bindEvents() {
        const loginBtn = $('#loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        const registerBtn = $('#registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        const logoutBtn = $('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    showLoginModal() {
        App.showModal('登录账号', `
            <div style="margin-bottom: 16px;">
                <input type="text" id="loginUsername" class="text-input" placeholder="用户名" style="margin-bottom: 12px;">
                <input type="password" id="loginPassword" class="text-input" placeholder="密码">
            </div>
            <p style="text-align: center; color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                还没有账号？<a href="#" onclick="AuthModule.showRegisterModal(); return false;" style="color: var(--primary);">立即注册</a>
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '登录', class: 'primary-btn', action: () => this.login() }
        ]);
    },

    showRegisterModal() {
        App.closeModal();
        setTimeout(() => {
            App.showModal('注册账号', `
                <div style="margin-bottom: 16px;">
                    <input type="text" id="registerUsername" class="text-input" placeholder="设置用户名" style="margin-bottom: 12px;">
                    <input type="password" id="registerPassword" class="text-input" placeholder="设置密码（至少6位）" style="margin-bottom: 12px;">
                    <input type="password" id="registerConfirmPassword" class="text-input" placeholder="确认密码">
                </div>
                <p style="text-align: center; color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                    登录即表示同意我们的<a href="#" style="color: var(--primary);">隐私政策</a>
                </p>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '注册', class: 'primary-btn', action: () => this.register() }
            ]);
        }, 100);
    },

    async login() {
        const username = $('#loginUsername')?.value.trim();
        const password = $('#loginPassword')?.value;

        if (!username || !password) {
            Helpers.showToast('请输入用户名和密码', 'warning');
            return;
        }

        const userConfig = Storage.getUserConfig();

        if (!userConfig.hasAccount) {
            Helpers.showToast('账号不存在，请先注册', 'warning');
            return;
        }

        if (userConfig.username !== username) {
            Helpers.showToast('用户名错误', 'error');
            return;
        }

        const isValid = await Crypto.verifyPassword(password, userConfig.passwordHash);
        if (!isValid) {
            Helpers.showToast('密码错误', 'error');
            return;
        }

        this.currentUser = userConfig;
        this.isLoggedIn = true;

        App.closeModal();
        Helpers.showToast(`欢迎回来，${username}！`, 'success');
        this.updateLoginStatus();
    },

    async register() {
        const username = $('#registerUsername')?.value.trim();
        const password = $('#registerPassword')?.value;
        const confirmPassword = $('#registerConfirmPassword')?.value;

        if (!username || !password) {
            Helpers.showToast('请填写所有字段', 'warning');
            return;
        }

        if (username.length < 2) {
            Helpers.showToast('用户名至少2个字符', 'warning');
            return;
        }

        if (password.length < 6) {
            Helpers.showToast('密码至少6位', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Helpers.showToast('两次密码不一致', 'warning');
            return;
        }

        const userConfig = Storage.getUserConfig();

        if (userConfig.hasAccount) {
            Helpers.showToast('账号已存在，请直接登录', 'warning');
            return;
        }

        const passwordHash = await Crypto.hashPassword(password);

        userConfig.username = username;
        userConfig.passwordHash = passwordHash;
        userConfig.hasAccount = true;
        userConfig.createdAt = Date.now();

        Storage.setUserConfig(userConfig);

        this.currentUser = userConfig;
        this.isLoggedIn = true;

        App.closeModal();
        Helpers.showToast('注册成功！', 'success');

        setTimeout(() => {
            this.showPrivacySetupModal();
        }, 500);
    },

    showPrivacySetupModal() {
        App.showModal('设置隐私密码', `
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                <h4>保护你的情绪日记</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin-top: 8px;">
                    设置一个隐私密码，用于加密你的日记内容和个人档案
                </p>
            </div>
            <div style="margin-bottom: 16px;">
                <input type="password" id="privacyPassword" class="text-input" placeholder="设置隐私密码（至少4位）" style="margin-bottom: 12px;">
                <input type="password" id="privacyConfirmPassword" class="text-input" placeholder="确认隐私密码">
            </div>
            <p style="text-align: center; color: var(--text-secondary); font-size: 12px;">
                隐私密码将加密你的日记内容，请牢记此密码
            </p>
        `, [
            { text: '跳过', class: 'ghost-btn', action: () => {
                App.closeModal();
                Helpers.showToast('你可以随时在设置中设置隐私密码', 'info');
                this.updateLoginStatus();
            }},
            { text: '设置', class: 'primary-btn', action: () => this.setupPrivacyPassword() }
        ]);
    },

    async setupPrivacyPassword() {
        const password = $('#privacyPassword')?.value;
        const confirmPassword = $('#privacyConfirmPassword')?.value;

        if (!password || password.length < 4) {
            Helpers.showToast('隐私密码至少4位', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            Helpers.showToast('两次密码不一致', 'warning');
            return;
        }

        const userConfig = Storage.getUserConfig();
        userConfig.privacyPassword = await Crypto.hashPassword(password);
        userConfig.privacyPasswordSet = true;
        Storage.setUserConfig(userConfig);

        App.closeModal();
        Helpers.showToast('隐私密码设置成功！', 'success');
        this.updateLoginStatus();
    },

    async verifyPrivacyPassword() {
        const userConfig = Storage.getUserConfig();
        if (!userConfig.privacyPasswordSet) {
            return true;
        }

        return new Promise((resolve) => {
            App.showModal('验证隐私密码', `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                    <p style="color: var(--text-secondary);">请输入隐私密码以访问日记内容</p>
                </div>
                <input type="password" id="verifyPrivacyPassword" class="text-input" placeholder="请输入隐私密码" style="width: 100%;">
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '验证', class: 'primary-btn', action: async () => {
                    const input = $('#verifyPrivacyPassword')?.value;
                    const isValid = await Crypto.verifyPassword(input, userConfig.privacyPassword);
                    if (isValid) {
                        App.closeModal();
                        resolve(true);
                    } else {
                        Helpers.showToast('密码错误', 'error');
                        resolve(false);
                    }
                }}
            ]);
        });
    },

    logout() {
        App.showModal('确认退出', `
            <p style="text-align: center;">确定要退出当前账号吗？</p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '退出', class: 'primary-btn', action: () => {
                this.currentUser = null;
                this.isLoggedIn = false;
                App.closeModal();
                Helpers.showToast('已退出登录', 'success');
                this.updateLoginStatus();
            }}
        ]);
    },

    updateLoginStatus() {
        const loginBtn = $('#loginBtn');
        const registerBtn = $('#registerBtn');
        const logoutBtn = $('#logoutBtn');
        const userGreeting = $('#userGreeting');

        if (this.isLoggedIn && this.currentUser) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (userGreeting) {
                userGreeting.textContent = `欢迎，${this.currentUser.username}`;
                userGreeting.classList.remove('hidden');
            }
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (userGreeting) userGreeting.classList.add('hidden');
        }
    },

    async encryptUserData(data, password) {
        if (!password) return data;
        return await Crypto.encrypt(JSON.stringify(data), password);
    },

    async decryptUserData(encryptedData, password) {
        if (!password) {
            try {
                return JSON.parse(encryptedData);
            } catch {
                return null;
            }
        }
        const decrypted = await Crypto.decrypt(encryptedData, password);
        if (decrypted) {
            try {
                return JSON.parse(decrypted);
            } catch {
                return null;
            }
        }
        return null;
    }
};
