const PersonalityModule = {
    currentTest: null,
    currentQuestion: 0,
    answers: [],

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const profileBtn = $('#profileBtn');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => this.showProfile());
        }
    },

    startMBTITest() {
        this.currentTest = 'mbti';
        this.currentQuestion = 0;
        this.answers = [];

        App.showModal('MBTI十六型人格测试', `
            <div id="personalityTestContainer">
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">
                    回答以下问题，了解你的人格类型
                </p>
                <div id="testProgress" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
                    ${MBTI_QUESTIONS.map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--border);" data-step="${i}"></div>`).join('')}
                </div>
                <div id="testQuestion"></div>
            </div>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' }
        ]);

        this.renderMBTIQuestion();
    },

    renderMBTIQuestion() {
        const container = $('#testQuestion');
        if (!container || this.currentQuestion >= MBTI_QUESTIONS.length) {
            this.finishMBTITest();
            return;
        }

        const question = MBTI_QUESTIONS[this.currentQuestion];

        const progressDots = $$('[data-step]');
        progressDots.forEach((dot, i) => {
            dot.style.background = i <= this.currentQuestion ? 'var(--primary)' : 'var(--border)';
        });

        container.innerHTML = `
            <h4 style="text-align: center; margin-bottom: 24px;">${question.question}</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${question.options.map((opt, i) => `
                    <button class="secondary-btn" style="justify-content: flex-start; padding: 16px;" data-type="${opt.type}">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        `;

        const options = $$('button[data-type]', container);
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                this.answers.push({ type: btn.dataset.type });
                this.currentQuestion++;
                this.renderMBTIQuestion();
            });
        });
    },

    finishMBTITest() {
        const mbti = this.calculateMBTI();

        if (mbti) {
            const userConfig = Storage.getUserConfig();
            userConfig.mbti = mbti;
            Storage.setUserConfig(userConfig);

            App.closeModal();
            Helpers.showToast(`测试完成！你是 ${mbti} 类型`, 'success');

            this.showMBTIResult(mbti);
        } else {
            Helpers.showToast('测试未完成，请重试', 'warning');
        }
    },

    calculateMBTI() {
        if (this.answers.length < 4) return null;

        const typeCount = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        this.answers.forEach(a => typeCount[a.type]++);

        let result = '';
        result += typeCount.E >= typeCount.I ? 'E' : 'I';
        result += typeCount.S >= typeCount.N ? 'S' : 'N';
        result += typeCount.T >= typeCount.F ? 'T' : 'F';
        result += typeCount.J >= typeCount.P ? 'J' : 'P';

        return result;
    },

    showMBTIResult(mbti) {
        const typeInfo = MBTI_TYPES[mbti];
        if (!typeInfo) return;

        App.showModal(`你的MBTI类型：${mbti}`, `
            <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">${this.getMBTIEmoji(mbti)}</div>
                <h4 style="font-size: 20px; color: var(--primary); margin-bottom: 8px;">${typeInfo.name}</h4>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">${typeInfo.description}</p>
                <div style="text-align: left; padding: 16px; background: var(--background); border-radius: 12px;">
                    <h5 style="font-size: 14px; margin-bottom: 12px;">💡 专属建议</h5>
                    <p style="font-size: 13px; color: var(--text-secondary);">${this.getMBTIAdvice(mbti)}</p>
                </div>
            </div>
        `, [
            { text: '完成', class: 'primary-btn', action: 'close' }
        ]);
    },

    getMBTIEmoji(mbti) {
        const emojis = {
            'INTJ': '🎯', 'INTP': '💡', 'ENTJ': '⚡', 'ENTP': '🔥',
            'INFJ': '🌈', 'INFP': '🎨', 'ENFJ': '✨', 'ENFP': '🦋',
            'ISTJ': '📊', 'ISFJ': '🛡️', 'ESTJ': '🏆', 'ESFJ': '💝',
            'ISTP': '🔧', 'ISFP': '🌸', 'ESTP': '🚀', 'ESFP': '🎭'
        };
        return emojis[mbti] || '🔮';
    },

    getMBTIAdvice(mbti) {
        const advice = {
            'INTJ': '你倾向于过度思考，试着给自己一些"不完美"的许可。情绪不需要被分析才能被接受。',
            'INTP': '你习惯用逻辑处理一切，但情感同样重要。尝试记录情绪日记，不用分析，只需要感受。',
            'ENTJ': '你的果断是优势，但记得给自己情绪恢复的时间。休息不是懒惰，是高效的基础。',
            'ENTP': '你的好奇心是宝贵的财富，但当你感到焦虑时，试着专注在一个想法上而不是所有可能性。',
            'INFJ': '你的同理心让你善于理解他人，但要注意设置界限。你值得被同样的方式关怀。',
            'INFP': '你的理想主义是美好的，但现实有时需要妥协。温柔地对待自己也很重要。',
            'ENFJ': '你总是关注他人需求，别忘了定期检查自己的情绪状态。你照顾他人的能力取决于你自己的状态。',
            'ENFP': '你的热情很有感染力，但当能量低落时，允许自己休息而不是强迫自己保持积极。',
            'ISTJ': '你的责任感很强，但生活中的变化也是必要的。试着偶尔放松一下计划，享受当下。',
            'ISFJ': '你非常忠诚和付出，但要注意不要忽视自己的需求。你值得被照顾。',
            'ESTJ': '你的组织能力出色，但当你感到沮丧时，试着接受不完美，给自己一些同情。',
            'ESFJ': '你善于维护关系，当独处让你不安时，试着找到内心的平静而不是依赖他人认可。',
            'ISTP': '你需要空间和时间处理情绪，这完全正常。当准备好时再表达，而不是强迫自己。',
            'ISFP': '你活在当下的能力是天赋。通过艺术、运动或大自然来表达和处理情绪。',
            'ESTP': '你充满活力，但当情绪低落时，可能会尝试逃避。试着直面感受而不是用活动填满时间。',
            'ESFP': '你热爱生活，但有时会忽视深层情绪。给自己安静的时刻来真正连接内心。'
        };
        return advice[mbti] || '你是独一无二的个体。了解自己是一个持续的旅程。';
    },

    startHogwartsTest() {
        this.currentTest = 'hogwarts';
        this.currentQuestion = 0;
        this.answers = [];

        App.showModal('🏰 霍格沃兹分院测试', `
            <div id="personalityTestContainer">
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">
                    回答以下问题，看看你属于哪个学院
                </p>
                <div id="testProgress" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
                    ${HOGWARTS_QUESTIONS.map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--border);" data-step="${i}"></div>`).join('')}
                </div>
                <div id="testQuestion"></div>
            </div>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' }
        ]);

        this.renderHogwartsQuestion();
    },

    renderHogwartsQuestion() {
        const container = $('#testQuestion');
        if (!container || this.currentQuestion >= HOGWARTS_QUESTIONS.length) {
            this.finishHogwartsTest();
            return;
        }

        const question = HOGWARTS_QUESTIONS[this.currentQuestion];

        const progressDots = $$('[data-step]');
        progressDots.forEach((dot, i) => {
            dot.style.background = i <= this.currentQuestion ? 'var(--primary)' : 'var(--border)';
        });

        container.innerHTML = `
            <h4 style="text-align: center; margin-bottom: 24px;">${question.question}</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${question.options.map((opt, i) => `
                    <button class="secondary-btn" style="justify-content: flex-start; padding: 16px;" data-house="${opt.house}">
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        `;

        const options = $$('button[data-house]', container);
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                this.answers.push({ house: btn.dataset.house });
                this.currentQuestion++;
                this.renderHogwartsQuestion();
            });
        });
    },

    finishHogwartsTest() {
        const house = this.calculateHouse();

        if (house) {
            const userConfig = Storage.getUserConfig();
            userConfig.hogwartsHouse = house;
            Storage.setUserConfig(userConfig);

            App.closeModal();
            Helpers.showToast(`🎉 你被分到了 ${HOGWARTS_HOUSES[house].name}！`, 'success');

            this.showHogwartsResult(house);
        } else {
            Helpers.showToast('测试未完成，请重试', 'warning');
        }
    },

    calculateHouse() {
        if (this.answers.length === 0) return null;

        const houseCount = {
            GRYFFINDOR: 0,
            SLYTHERIN: 0,
            RAVENCLAW: 0,
            HUFFLEPUFF: 0
        };

        this.answers.forEach(a => {
            if (houseCount[a.house] !== undefined) {
                houseCount[a.house]++;
            }
        });

        let maxCount = 0;
        let selectedHouse = 'GRYFFINDOR';

        Object.entries(houseCount).forEach(([house, count]) => {
            if (count > maxCount) {
                maxCount = count;
                selectedHouse = house;
            }
        });

        return selectedHouse;
    },

    showHogwartsResult(house) {
        const houseInfo = HOGWARTS_HOUSES[house];
        if (!houseInfo) return;

        App.showModal(`🏰 ${houseInfo.name}`, `
            <div style="text-align: center;">
                <div style="font-size: 64px; margin-bottom: 16px;">${houseInfo.emoji}</div>
                <h4 style="font-size: 24px; color: ${houseInfo.color}; margin-bottom: 16px;">${houseInfo.name}</h4>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">${houseInfo.description}</p>
                <div style="padding: 16px; background: var(--background); border-radius: 12px;">
                    <h5 style="font-size: 14px; margin-bottom: 12px; text-align: left;">🌟 你的特质</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
                        ${houseInfo.traits.map(trait => `
                            <span style="padding: 4px 12px; background: ${houseInfo.color}20; color: ${houseInfo.color}; border-radius: 20px; font-size: 12px;">${trait}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `, [
            { text: '完成', class: 'primary-btn', action: 'close' }
        ]);
    },

    showProfile() {
        App.showPage('profile');
        this.renderProfile();
    },

    renderProfile() {
        const profileContent = $('#profileContent');
        if (!profileContent) return;

        const userConfig = Storage.getUserConfig();
        const mbti = userConfig.mbti;
        const house = userConfig.hogwartsHouse;
        const holland = userConfig.holland;

        let mbtiSection = '';
        if (mbti) {
            const mbtiInfo = MBTI_TYPES[mbti];
            mbtiSection = `
                <div class="profile-section">
                    <div class="section-icon">🧠</div>
                    <div class="section-content">
                        <h3>MBTI性格</h3>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${this.getMBTIEmoji(mbti)}</span>
                            <div>
                                <span style="font-size: 20px; font-weight: 600;">${mbti}</span>
                                <span style="color: var(--text-secondary);"> - ${mbtiInfo.name}</span>
                            </div>
                        </div>
                        <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">${mbtiInfo.description}</p>
                    </div>
                </div>
            `;
        } else {
            mbtiSection = `
                <div class="profile-section incomplete">
                    <div class="section-icon">🧠</div>
                    <div class="section-content">
                        <h3>MBTI性格</h3>
                        <p style="color: var(--text-secondary);">尚未完成测试</p>
                        <button class="secondary-btn" style="margin-top: 8px;" onclick="PersonalityModule.startMBTITest()">开始测试</button>
                    </div>
                </div>
            `;
        }

        let hollandSection = '';
        if (holland) {
            const hollandInfo = getHollandType(holland);
            if (hollandInfo) {
                hollandSection = `
                    <div class="profile-section">
                        <div class="section-icon">💼</div>
                        <div class="section-content">
                            <h3>职业兴趣</h3>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 24px;">${hollandInfo.icon}</span>
                                <div>
                                    <span style="font-size: 20px; font-weight: 600;">${holland}</span>
                                    <span style="color: var(--text-secondary);"> - ${hollandInfo.name}</span>
                                </div>
                            </div>
                            <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">${hollandInfo.desc}</p>
                            <div style="margin-top: 12px;">
                                <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;">适合职业：</p>
                                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                                    ${hollandInfo.careers.slice(0, 4).map(career => `
                                        <span style="padding: 4px 10px; background: var(--primary-light); color: var(--primary); border-radius: 12px; font-size: 12px;">${career}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            hollandSection = `
                <div class="profile-section incomplete">
                    <div class="section-icon">💼</div>
                    <div class="section-content">
                        <h3>职业兴趣</h3>
                        <p style="color: var(--text-secondary);">尚未完成测试</p>
                        <button class="secondary-btn" style="margin-top: 8px;" onclick="TestModule.startHollandTest()">开始测试</button>
                    </div>
                </div>
            `;
        }

        let houseSection = '';
        if (house) {
            const houseInfo = HOGWARTS_HOUSES[house];
            houseSection = `
                <div class="profile-section">
                    <div class="section-icon">🏰</div>
                    <div class="section-content">
                        <h3>霍格沃兹分院</h3>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 32px;">${houseInfo.emoji}</span>
                            <div>
                                <span style="font-size: 20px; font-weight: 600; color: ${houseInfo.color};">${houseInfo.name}</span>
                            </div>
                        </div>
                        <div style="margin-top: 8px; display: flex; flex-wrap: wrap; gap: 8px;">
                            ${houseInfo.traits.slice(0, 3).map(trait => `
                                <span style="padding: 4px 8px; background: ${houseInfo.color}20; color: ${houseInfo.color}; border-radius: 12px; font-size: 12px;">${trait}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            houseSection = `
                <div class="profile-section incomplete">
                    <div class="section-icon">🏰</div>
                    <div class="section-content">
                        <h3>霍格沃兹分院</h3>
                        <p style="color: var(--text-secondary);">尚未完成测试</p>
                        <button class="secondary-btn" style="margin-top: 8px;" onclick="PersonalityModule.startHogwartsTest()">开始测试</button>
                    </div>
                </div>
            `;
        }

        const stats = this.getProfileStats();

        profileContent.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    ${this.getProfileEmoji(mbti, house)}
                </div>
                <h2>我的性格画像</h2>
                <p style="color: var(--text-secondary);">了解自己的性格与职业兴趣</p>
            </div>

            <div class="profile-grid">
                ${mbtiSection}
                ${hollandSection}
                ${houseSection}
            </div>

            <div class="profile-section">
                <div class="section-icon">📊</div>
                <div class="section-content">
                    <h3>情绪统计</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 16px;">
                        <div style="text-align: center; padding: 16px; background: var(--background); border-radius: 12px;">
                            <div style="font-size: 28px; font-weight: 600;">${stats.totalMoods}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">心情记录</div>
                        </div>
                        <div style="text-align: center; padding: 16px; background: var(--background); border-radius: 12px;">
                            <div style="font-size: 28px; font-weight: 600;">${stats.totalDiaries}</div>
                            <div style="font-size: 12px; color: var(--text-secondary);">日记篇数</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <div class="section-icon">🎯</div>
                <div class="section-content">
                    <h3>性格特质</h3>
                    ${this.getTraitTags(mbti, house, holland)}
                </div>
            </div>
        `;
    },

    getProfileEmoji(mbti, house) {
        if (house) {
            return HOGWARTS_HOUSES[house].emoji;
        }
        if (mbti) {
            return this.getMBTIEmoji(mbti);
        }
        return '👤';
    },

    getProfileStats() {
        const moods = Storage.getMoodEntries();
        const diaries = Storage.getDiaries();

        return {
            totalMoods: moods.length,
            totalDiaries: diaries.length
        };
    },

    getTraitTags(mbti, house, holland) {
        const traits = [];

        if (mbti) {
            const mbtiTraitMap = {
                'E': '外向', 'I': '内向',
                'S': '实感', 'N': '直觉',
                'T': '思考', 'F': '情感',
                'J': '判断', 'P': '感知'
            };
            mbti.split('').forEach(letter => {
                if (mbtiTraitMap[letter]) {
                    traits.push({ text: mbtiTraitMap[letter], color: '#7C9ACC' });
                }
            });
        }

        if (holland) {
            const hollandInfo = getHollandType(holland);
            if (hollandInfo) {
                traits.push({ text: hollandInfo.name, color: '#6EC6FF' });
            }
        }

        if (house) {
            HOGWARTS_HOUSES[house].traits.slice(0, 2).forEach(trait => {
                traits.push({ text: trait, color: HOGWARTS_HOUSES[house].color });
            });
        }

        if (traits.length === 0) {
            return '<p style="color: var(--text-secondary);">完成测试后显示你的性格特质</p>';
        }

        return `
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${traits.map(trait => `
                    <span style="padding: 6px 12px; background: ${trait.color}20; color: ${trait.color}; border-radius: 20px; font-size: 14px;">${trait.text}</span>
                `).join('')}
            </div>
        `;
    }
};
