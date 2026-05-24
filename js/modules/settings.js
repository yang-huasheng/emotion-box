const SettingsModule = {
    init() {
        this.bindEvents();
        this.renderThemeOptions();
        this.updateSettingsDisplay();
    },

    bindEvents() {
        const settingsBtn = $('#settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => App.showPage('settings'));
        }

        const backFromSettings = $('#backFromSettings');
        if (backFromSettings) {
            backFromSettings.addEventListener('click', () => App.navigateTo('home'));
        }

        const mbtiSettingItem = $('#mbtiSettingItem');
        if (mbtiSettingItem) {
            mbtiSettingItem.addEventListener('click', () => this.showMBTISelector());
        }

        const hollandSettingItem = $('#hollandSettingItem');
        if (hollandSettingItem) {
            hollandSettingItem.addEventListener('click', () => this.showHollandSelector());
        }

        const hogwartsSettingItem = $('#hogwartsSettingItem');
        if (hogwartsSettingItem) {
            hogwartsSettingItem.addEventListener('click', () => PersonalityModule.startHogwartsTest());
        }

        const profileSettingItem = $('#profileSettingItem');
        if (profileSettingItem) {
            profileSettingItem.addEventListener('click', () => PersonalityModule.showProfile());
        }

        const themeSettingItem = $('#themeSettingItem');
        if (themeSettingItem) {
            themeSettingItem.addEventListener('click', () => {
                this.showThemeSelector();
            });
        }

        const privacyPasswordItem = $('#privacyPasswordItem');
        if (privacyPasswordItem) {
            privacyPasswordItem.addEventListener('click', () => {
                this.showPrivacyPasswordSettings();
            });
        }

        const passwordSettingItem = $('#passwordSettingItem');
        if (passwordSettingItem) {
            passwordSettingItem.addEventListener('click', () => {
                this.showPasswordSettings();
            });
        }

        const exportSettingItem = $('#exportSettingItem');
        if (exportSettingItem) {
            exportSettingItem.addEventListener('click', () => {
                this.exportData();
            });
        }

        const demoDataItem = $('#demoDataItem');
        if (demoDataItem) {
            demoDataItem.addEventListener('click', () => {
                this.showDemoDataOptions();
            });
        }
    },

    renderThemeOptions() {
        const container = $('#themeOptions');
        if (!container) return;

        const themes = [
            { id: 'calm', color: '#6EC6FF', name: '平静蓝' },
            { id: 'heal', color: '#98D4BB', name: '治愈绿' },
            { id: 'happy', color: '#FFD93D', name: '快乐黄' },
            { id: 'energy', color: '#FFB366', name: '能量橙' },
            { id: 'romantic', color: '#FFB5C2', name: '浪漫粉' },
            { id: 'contemplative', color: '#C4A2D4', name: '沉思紫' }
        ];

        const userConfig = Storage.getUserConfig();
        const currentTheme = userConfig.theme || 'calm';

        container.innerHTML = themes.map(theme => `
            <div class="theme-option ${theme.id === currentTheme ? 'active' : ''}"
                 data-theme="${theme.id}"
                 style="background: ${theme.color};"
                 title="${theme.name}">
            </div>
        `).join('');

        container.addEventListener('click', (e) => {
            const themeOption = e.target.closest('.theme-option');
            if (themeOption) {
                const themeId = themeOption.dataset.theme;
                const theme = themes.find(t => t.id === themeId);
                if (theme) {
                    const userConfig = Storage.getUserConfig();
                    userConfig.theme = themeId;
                    Storage.setUserConfig(userConfig);

                    document.documentElement.style.setProperty('--current-emotion', theme.color);
                    document.documentElement.setAttribute('data-theme', themeId);

                    Helpers.showToast(`主题已切换为${theme.name}`, 'success');
                    this.renderThemeOptions();
                }
            }
        });
    },

    showThemeSelector() {
        const themes = [
            { id: 'calm', color: '#6EC6FF', name: '平静蓝', desc: '带来宁静与平和' },
            { id: 'heal', color: '#98D4BB', name: '治愈绿', desc: '感受自然疗愈力' },
            { id: 'happy', color: '#FFD93D', name: '快乐黄', desc: '充满阳光能量' },
            { id: 'energy', color: '#FFB366', name: '能量橙', desc: '激发热情活力' },
            { id: 'romantic', color: '#FFB5C2', name: '浪漫粉', desc: '温柔甜蜜氛围' },
            { id: 'contemplative', color: '#C4A2D4', name: '沉思紫', desc: '神秘优雅气质' }
        ];

        const userConfig = Storage.getUserConfig();
        const currentTheme = userConfig.theme || 'calm';

        App.showModal('选择主题颜色', `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                ${themes.map(theme => `
                    <div class="theme-card ${theme.id === currentTheme ? 'active' : ''}"
                         data-theme="${theme.id}"
                         style="border-color: ${theme.id === currentTheme ? theme.color : 'var(--border)'};">
                        <div class="theme-preview" style="background: ${theme.color};"></div>
                        <div class="theme-info">
                            <h4>${theme.name}</h4>
                            <p>${theme.desc}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' }
        ]);

        setTimeout(() => {
            const themeCards = Helpers.$$('.theme-card');
            themeCards.forEach(card => {
                card.addEventListener('click', () => {
                    const themeId = card.dataset.theme;
                    const theme = themes.find(t => t.id === themeId);
                    if (theme) {
                        const userConfig = Storage.getUserConfig();
                        userConfig.theme = themeId;
                        Storage.setUserConfig(userConfig);

                        document.documentElement.style.setProperty('--current-emotion', theme.color);
                        document.documentElement.setAttribute('data-theme', themeId);

                        this.renderThemeOptions();
                        App.closeModal();
                        Helpers.showToast(`主题已切换为${theme.name}`, 'success');
                    }
                });
            });
        }, 100);
    },

    showPrivacyPasswordSettings() {
        const userConfig = Storage.getUserConfig();
        const hasPrivacyPassword = userConfig.privacyPasswordSet;

        if (hasPrivacyPassword) {
            App.showModal('隐私密码设置', `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                    <p style="color: var(--text-secondary);">隐私密码用于加密你的日记内容</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="secondary-btn" id="changePrivacyBtn" style="width: 100%;">
                        修改隐私密码
                    </button>
                    <button class="ghost-btn" id="removePrivacyBtn" style="width: 100%; color: var(--error);">
                        移除隐私密码
                    </button>
                </div>
            `, [
                { text: '关闭', class: 'ghost-btn', action: 'close' }
            ]);

            setTimeout(() => {
                const changeBtn = $('#changePrivacyBtn');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => this.changePrivacyPassword());
                }

                const removeBtn = $('#removePrivacyBtn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => this.removePrivacyPassword());
                }
            }, 100);
        } else {
            App.showModal('设置隐私密码', `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
                    <p style="color: var(--text-secondary);">设置一个隐私密码来加密保护你的日记内容</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <input type="password" id="newPrivacyPassword" class="text-input" placeholder="设置隐私密码（至少4位）" style="margin-bottom: 12px;">
                    <input type="password" id="confirmPrivacyPassword" class="text-input" placeholder="确认隐私密码">
                </div>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '设置', class: 'primary-btn', action: () => this.setPrivacyPassword() }
            ]);
        }
    },

    async setPrivacyPassword() {
        const newPassword = $('#newPrivacyPassword')?.value;
        const confirmPassword = $('#confirmPrivacyPassword')?.value;

        if (!newPassword || newPassword.length < 4) {
            Helpers.showToast('隐私密码至少4位', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            Helpers.showToast('两次密码不一致', 'warning');
            return;
        }

        const userConfig = Storage.getUserConfig();
        userConfig.privacyPassword = await Crypto.hashPassword(newPassword);
        userConfig.privacyPasswordSet = true;
        Storage.setUserConfig(userConfig);

        App.closeModal();
        Helpers.showToast('隐私密码设置成功！', 'success');
        this.updateSettingsDisplay();
    },

    async changePrivacyPassword() {
        App.closeModal();
        setTimeout(() => {
            App.showModal('修改隐私密码', `
                <div style="margin-bottom: 16px;">
                    <input type="password" id="currentPrivacyPassword" class="text-input" placeholder="当前隐私密码" style="margin-bottom: 12px;">
                    <input type="password" id="newPrivacyPassword2" class="text-input" placeholder="新隐私密码（至少4位）" style="margin-bottom: 12px;">
                    <input type="password" id="confirmPrivacyPassword2" class="text-input" placeholder="确认新隐私密码">
                </div>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '确认修改', class: 'primary-btn', action: async () => {
                    const userConfig = Storage.getUserConfig();
                    const currentPass = $('#currentPrivacyPassword')?.value;
                    const newPass = $('#newPrivacyPassword2')?.value;
                    const confirmPass = $('#confirmPrivacyPassword2')?.value;

                    if (!currentPass || !newPass || !confirmPass) {
                        Helpers.showToast('请填写所有字段', 'warning');
                        return;
                    }

                    const isValid = await Crypto.verifyPassword(currentPass, userConfig.privacyPassword);
                    if (!isValid) {
                        Helpers.showToast('当前密码错误', 'error');
                        return;
                    }

                    if (newPass.length < 4) {
                        Helpers.showToast('新密码至少4位', 'warning');
                        return;
                    }

                    if (newPass !== confirmPass) {
                        Helpers.showToast('两次密码不一致', 'warning');
                        return;
                    }

                    userConfig.privacyPassword = await Crypto.hashPassword(newPass);
                    Storage.setUserConfig(userConfig);

                    App.closeModal();
                    Helpers.showToast('隐私密码修改成功！', 'success');
                    this.updateSettingsDisplay();
                }}
            ]);
        }, 100);
    },

    async removePrivacyPassword() {
        App.closeModal();
        setTimeout(() => {
            App.showModal('确认移除', `
                <p style="text-align: center;">确定要移除隐私密码吗？</p>
                <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                    移除后，你的日记将不再加密保护
                </p>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '确认移除', class: 'danger-btn', action: () => {
                    const userConfig = Storage.getUserConfig();
                    userConfig.privacyPassword = null;
                    userConfig.privacyPasswordSet = false;
                    Storage.setUserConfig(userConfig);

                    App.closeModal();
                    Helpers.showToast('隐私密码已移除', 'success');
                    this.updateSettingsDisplay();
                }}
            ]);
        }, 100);
    },

    showPasswordSettings() {
        const userConfig = Storage.getUserConfig();
        const hasPassword = !!userConfig.password;

        if (hasPassword) {
            App.showModal('日记密码锁', `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <p style="color: var(--text-secondary);">日记密码锁用于保护特定日记内容</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button class="secondary-btn" id="changePasswordBtn" style="width: 100%;">
                        修改密码
                    </button>
                    <button class="ghost-btn" id="removePasswordBtn" style="width: 100%; color: var(--error);">
                        移除密码锁
                    </button>
                </div>
            `, [
                { text: '关闭', class: 'ghost-btn', action: 'close' }
            ]);

            setTimeout(() => {
                const changeBtn = $('#changePasswordBtn');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => this.showChangePasswordModal());
                }

                const removeBtn = $('#removePasswordBtn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => this.showRemovePasswordModal());
                }
            }, 100);
        } else {
            App.showModal('设置日记密码锁', `
                <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <p style="color: var(--text-secondary);">设置日记密码锁来保护你的隐私</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <input type="password" id="setPasswordInput" class="text-input" placeholder="设置密码（至少4位）" style="margin-bottom: 12px;">
                    <input type="password" id="confirmSetPasswordInput" class="text-input" placeholder="确认密码">
                </div>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '设置', class: 'primary-btn', action: () => this.setPassword() }
            ]);
        }
    },

    showChangePasswordModal() {
        App.closeModal();
        setTimeout(() => {
            App.showModal('修改密码', `
                <div style="margin-bottom: 16px;">
                    <input type="password" id="currentPasswordInput" class="text-input" placeholder="当前密码" style="margin-bottom: 12px;">
                    <input type="password" id="newPasswordInput2" class="text-input" placeholder="新密码" style="margin-bottom: 12px;">
                    <input type="password" id="confirmPasswordInput2" class="text-input" placeholder="确认新密码">
                </div>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '确认修改', class: 'primary-btn', action: async () => {
                    const userConfig = Storage.getUserConfig();
                    const currentPass = $('#currentPasswordInput')?.value;
                    const newPass = $('#newPasswordInput2')?.value;
                    const confirmPass = $('#confirmPasswordInput2')?.value;

                    if (!currentPass || !newPass || !confirmPass) {
                        Helpers.showToast('请填写所有字段', 'warning');
                        return;
                    }

                    if (!userConfig.password) {
                        Helpers.showToast('未设置密码', 'error');
                        return;
                    }

                    const isValid = await Crypto.verifyPassword(currentPass, userConfig.password);
                    if (!isValid) {
                        Helpers.showToast('当前密码错误', 'error');
                        return;
                    }

                    if (newPass.length < 4) {
                        Helpers.showToast('新密码至少4位', 'warning');
                        return;
                    }

                    if (newPass !== confirmPass) {
                        Helpers.showToast('两次密码不一致', 'warning');
                        return;
                    }

                    const hash = await Crypto.hashPassword(newPass);
                    userConfig.password = hash;
                    Storage.setUserConfig(userConfig);

                    App.closeModal();
                    Helpers.showToast('密码修改成功', 'success');
                    this.updateSettingsDisplay();
                }}
            ]);
        }, 100);
    },

    showRemovePasswordModal() {
        App.closeModal();
        setTimeout(() => {
            App.showModal('确认移除', `
                <p style="text-align: center;">确定要移除密码锁吗？</p>
                <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                    移除后，你的日记将不再需要密码访问
                </p>
            `, [
                { text: '取消', class: 'ghost-btn', action: 'close' },
                { text: '确认移除', class: 'primary-btn', action: () => {
                    const userConfig = Storage.getUserConfig();
                    userConfig.password = null;
                    Storage.setUserConfig(userConfig);
                    Helpers.showToast('密码锁已移除', 'success');
                    this.updateSettingsDisplay();
                    App.closeModal();
                }}
            ]);
        }, 100);
    },

    async setPassword() {
        const newPass = $('#setPasswordInput')?.value;
        const confirmPass = $('#confirmSetPasswordInput')?.value;

        if (!newPass) {
            Helpers.showToast('请输入密码', 'warning');
            return;
        }

        if (newPass.length < 4) {
            Helpers.showToast('密码至少4位', 'warning');
            return;
        }

        if (newPass !== confirmPass) {
            Helpers.showToast('两次密码不一致', 'warning');
            return;
        }

        const hash = await Crypto.hashPassword(newPass);
        const userConfig = Storage.getUserConfig();
        userConfig.password = hash;
        Storage.setUserConfig(userConfig);

        Helpers.showToast('密码已设置', 'success');
        this.updateSettingsDisplay();
        App.closeModal();
    },

    exportData() {
        const data = Storage.exportData();
        const jsonStr = JSON.stringify(data, null, 2);
        const filename = `情绪盒子备份_${Helpers.formatDate(new Date(), 'date')}.json`;

        Helpers.downloadFile(jsonStr, filename, 'application/json');
        Helpers.showToast('数据已导出', 'success');
    },

    updateSettingsDisplay() {
        const userConfig = Storage.getUserConfig();

        const mbtiStatusText = $('#mbtiStatusText');
        if (mbtiStatusText) {
            mbtiStatusText.textContent = userConfig.mbti
                ? `${userConfig.mbti} - ${MBTI_TYPES[userConfig.mbti]?.name || ''}`
                : '未设置';
        }

        const hollandStatusText = $('#hollandStatusText');
        if (hollandStatusText) {
            const hollandInfo = getHollandType(userConfig.holland);
            hollandStatusText.textContent = userConfig.holland && hollandInfo
                ? `${userConfig.holland} - ${hollandInfo.name}`
                : '未设置';
        }

        const hogwartsStatusText = $('#hogwartsStatusText');
        if (hogwartsStatusText) {
            hogwartsStatusText.textContent = userConfig.hogwartsHouse
                ? `${HOGWARTS_HOUSES[userConfig.hogwartsHouse]?.emoji} ${HOGWARTS_HOUSES[userConfig.hogwartsHouse]?.name || ''}`
                : '未设置';
        }

        const privacyStatusText = $('#privacyStatusText');
        if (privacyStatusText) {
            privacyStatusText.textContent = userConfig.privacyPasswordSet ? '已设置' : '未设置';
        }

        const passwordStatusText = $('#passwordStatusText');
        if (passwordStatusText) {
            passwordStatusText.textContent = userConfig.password ? '已设置' : '未设置';
        }

        this.renderThemeOptions();
    },

    showMBTISelector() {
        const userConfig = Storage.getUserConfig();
        const currentMBTI = userConfig.mbti || '';

        App.showModal('设置MBTI类型', `
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 14px;">选择你的MBTI类型</label>
                <select id="mbtiTypeSelect" class="type-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <option value="">请选择...</option>
                    <optgroup label="分析型">
                        <option value="INTJ" ${currentMBTI === 'INTJ' ? 'selected' : ''}>INTJ - 建筑师</option>
                        <option value="INTP" ${currentMBTI === 'INTP' ? 'selected' : ''}>INTP - 逻辑学家</option>
                        <option value="ENTJ" ${currentMBTI === 'ENTJ' ? 'selected' : ''}>ENTJ - 指挥官</option>
                        <option value="ENTP" ${currentMBTI === 'ENTP' ? 'selected' : ''}>ENTP - 辩论家</option>
                    </optgroup>
                    <optgroup label="外交型">
                        <option value="INFJ" ${currentMBTI === 'INFJ' ? 'selected' : ''}>INFJ - 提倡者</option>
                        <option value="INFP" ${currentMBTI === 'INFP' ? 'selected' : ''}>INFP - 调停者</option>
                        <option value="ENFJ" ${currentMBTI === 'ENFJ' ? 'selected' : ''}>ENFJ - 主人公</option>
                        <option value="ENFP" ${currentMBTI === 'ENFP' ? 'selected' : ''}>ENFP - 竞选者</option>
                    </optgroup>
                    <optgroup label="守护型">
                        <option value="ISTJ" ${currentMBTI === 'ISTJ' ? 'selected' : ''}>ISTJ - 物流师</option>
                        <option value="ISFJ" ${currentMBTI === 'ISFJ' ? 'selected' : ''}>ISFJ - 守卫者</option>
                        <option value="ESTJ" ${currentMBTI === 'ESTJ' ? 'selected' : ''}>ESTJ - 总经理</option>
                        <option value="ESFJ" ${currentMBTI === 'ESFJ' ? 'selected' : ''}>ESFJ - 执政官</option>
                    </optgroup>
                    <optgroup label="探险型">
                        <option value="ISTP" ${currentMBTI === 'ISTP' ? 'selected' : ''}>ISTP - 鉴赏家</option>
                        <option value="ISFP" ${currentMBTI === 'ISFP' ? 'selected' : ''}>ISFP - 探险家</option>
                        <option value="ESTP" ${currentMBTI === 'ESTP' ? 'selected' : ''}>ESTP - 企业家</option>
                        <option value="ESFP" ${currentMBTI === 'ESFP' ? 'selected' : ''}>ESFP - 表演者</option>
                    </optgroup>
                </select>
            </div>
            <p style="text-align: center; color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                或者 <a href="#" onclick="App.closeModal(); setTimeout(() => TestModule.startMBTITest(), 100); return false;" style="color: var(--primary);">参加测试</a> 获取准确结果
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '保存', class: 'primary-btn', action: () => {
                const select = $('#mbtiTypeSelect');
                const value = select?.value;
                if (value) {
                    const userConfig = Storage.getUserConfig();
                    userConfig.mbti = value;
                    userConfig.mbtiCompleted = true;
                    Storage.setUserConfig(userConfig);
                    App.closeModal();
                    this.updateSettingsDisplay();
                    Helpers.showToast('MBTI已保存', 'success');
                }
            }}
        ]);
    },

    showHollandSelector() {
        const userConfig = Storage.getUserConfig();
        const currentHolland = userConfig.holland || '';

        App.showModal('设置霍兰德类型', `
            <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 8px; color: var(--text-secondary); font-size: 14px;">选择你的霍兰德类型</label>
                <select id="hollandTypeSelect" class="type-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                    <option value="">请选择...</option>
                    <option value="R" ${currentHolland.startsWith('R') ? 'selected' : ''}>R - 现实型</option>
                    <option value="I" ${currentHolland.startsWith('I') ? 'selected' : ''}>I - 研究型</option>
                    <option value="A" ${currentHolland.startsWith('A') ? 'selected' : ''}>A - 艺术型</option>
                    <option value="S" ${currentHolland.startsWith('S') ? 'selected' : ''}>S - 社会型</option>
                    <option value="E" ${currentHolland.startsWith('E') ? 'selected' : ''}>E - 企业型</option>
                    <option value="C" ${currentHolland.startsWith('C') ? 'selected' : ''}>C - 常规型</option>
                </select>
            </div>
            <p style="text-align: center; color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
                或者 <a href="#" onclick="App.closeModal(); setTimeout(() => TestModule.startHollandTest(), 100); return false;" style="color: var(--primary);">参加测试</a> 获取准确结果
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '保存', class: 'primary-btn', action: () => {
                const select = $('#hollandTypeSelect');
                const value = select?.value;
                if (value) {
                    const userConfig = Storage.getUserConfig();
                    userConfig.holland = value;
                    userConfig.hollandCompleted = true;
                    Storage.setUserConfig(userConfig);
                    App.closeModal();
                    this.updateSettingsDisplay();
                    Helpers.showToast('霍兰德类型已保存', 'success');
                }
            }}
        ]);
    },

    showDemoDataOptions() {
        App.showModal('演示数据', `
            <div style="text-align: center; margin-bottom: 24px;">
                <div style="font-size: 48px; margin-bottom: 16px;">📊</div>
                <p style="color: var(--text-secondary);">加载演示数据可以查看所有图表的效果</p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button class="primary-btn" id="loadDemoBtn" style="width: 100%;">
                    加载演示数据
                </button>
                <button class="secondary-btn" id="clearDemoBtn" style="width: 100%;">
                    清除演示数据
                </button>
            </div>
        `, [
            { text: '关闭', class: 'ghost-btn', action: 'close' }
        ]);

        setTimeout(() => {
            const loadBtn = $('#loadDemoBtn');
            const clearBtn = $('#clearDemoBtn');

            if (loadBtn) {
                loadBtn.addEventListener('click', () => this.loadDemoData());
            }

            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearDemoData());
            }
        }, 100);
    },

    loadDemoData() {
        App.showModal('确认加载', `
            <p style="text-align: center;">加载演示数据会覆盖现有数据，确定要继续吗？</p>
            <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                将生成过去90天的心情记录和日记
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '确认加载', class: 'primary-btn', action: () => {
                App.closeModal();
                const result = Storage.generateDemoData();
                Helpers.showToast(`演示数据加载成功！${result.moodCount}条心情记录，${result.diaryCount}篇日记`, 'success');
                MoodModule.renderRecentMoods();
            }}
        ]);
    },

    clearDemoData() {
        App.showModal('确认清除', `
            <p style="text-align: center;">确定要清除所有数据吗？</p>
            <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                此操作无法撤销
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '确认清除', class: 'danger-btn', action: () => {
                App.closeModal();
                Storage.clearDemoData();
                const config = Storage.getUserConfig();
                config.mbti = null;
                config.hogwartsHouse = null;
                Storage.setUserConfig(config);
                Helpers.showToast('数据已清除', 'success');
                MoodModule.renderRecentMoods();
            }}
        ]);
    }
};
