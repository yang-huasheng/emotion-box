const HappyModule = {
    categories: [
        { id: 'food', name: '美食日常', emoji: '🍔', keywords: ['吃', '饭', '美食', '餐厅', '厨房', '甜品', '咖啡', '奶茶', '蛋糕', '火锅', '早餐', '午餐', '晚餐', '零食', '水果', '甜点', '美味'] },
        { id: 'social', name: '人际温暖', emoji: '💝', keywords: ['朋友', '家人', '闺蜜', '兄弟', '聚会', '聊天', '陪伴', '温暖', '感动', '感谢', '关心', '礼物', '惊喜', '生日', '祝福'] },
        { id: 'growth', name: '个人成长', emoji: '📚', keywords: ['学习', '进步', '成长', '挑战', '突破', '考试', '证书', '技能', '看书', '阅读', '运动', '健身', '跑步', '瑜伽', '冥想'] },
        { id: 'fun', name: '趣味小事', emoji: '🎉', keywords: ['开心', '快乐', '有趣', '搞笑', '好玩', '电影', '游戏', '旅行', '出游', '逛街', '散步', '宠物', '猫', '狗', '可爱', '萌'] },
        { id: 'goodies', name: '惊喜好物', emoji: '🎁', keywords: ['购物', '好物', '推荐', '好物分享', '开箱', '礼物', '新', '买', '获得', '收到', '奖品', '中奖', '幸运', '惊喜'] }
    ],

    currentHappy: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const happyBtn = $('#happyBtn');
        if (happyBtn) {
            happyBtn.addEventListener('click', () => this.showHappyPage());
        }

        const backFromHappy = $('#backFromHappy');
        if (backFromHappy) {
            backFromHappy.addEventListener('click', () => this.closeHappy());
        }
    },

    showHappyPage() {
        this.currentHappy = {
            content: '',
            category: null,
            createdAt: Date.now()
        };
        this.renderHappyPage();
        App.showPage('happy');
    },

    renderHappyPage() {
        const contentDiv = $('#happyContent');
        if (!contentDiv) return;

        const categoryCards = this.categories.map(cat => `
            <button class="happy-category-card" data-category="${cat.id}">
                <span class="category-emoji">${cat.emoji}</span>
                <span class="category-name">${cat.name}</span>
            </button>
        `).join('');

        contentDiv.innerHTML = `
            <div class="happy-container">
                <div class="happy-header">
                    <h2 class="happy-title">美好收纳盒 ✨</h2>
                    <p class="happy-subtitle">记录生活中的小确幸，让美好永久留存</p>
                </div>

                <div class="happy-section">
                    <h3 class="section-label">今天的小美好属于哪一类？</h3>
                    <div class="happy-categories-container">
                        ${categoryCards}
                    </div>
                </div>

                <div class="happy-section">
                    <h3 class="section-label">分享你的快乐</h3>
                    <textarea id="happyContentInput" class="happy-textarea" placeholder="写下让你开心的事...无论是一顿美食、朋友的问候，还是自己的小进步，都值得被记录下来！"></textarea>
                    <div class="word-hint">
                        <span id="happyWordCount">0</span> 字
                    </div>
                </div>

                <button class="happy-submit-btn" id="happySubmitBtn" disabled>
                    保存这份美好
                </button>
            </div>
        `;

        this.bindHappyEvents();
    },

    bindHappyEvents() {
        const contentInput = $('#happyContentInput');
        if (contentInput) {
            contentInput.addEventListener('input', () => {
                this.currentHappy.content = contentInput.value;
                const count = Helpers.countWords(contentInput.value);
                const wordCountEl = $('#happyWordCount');
                if (wordCountEl) {
                    wordCountEl.textContent = count;
                }

                if (!this.currentHappy.category) {
                    this.autoDetectCategory(contentInput.value);
                }

                this.updateSubmitButton();
            });
        }

        const categoryCards = Helpers.$$('.happy-category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => {
                categoryCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectCategory(card.dataset.category);
                this.updateSubmitButton();
            });
        });

        const submitBtn = $('#happySubmitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitHappy());
        }
    },

    autoDetectCategory(content) {
        if (!content.trim()) return;

        const lowerContent = content.toLowerCase();
        let detectedCategory = null;
        let maxMatches = 0;

        this.categories.forEach(cat => {
            let matches = 0;
            cat.keywords.forEach(keyword => {
                if (lowerContent.includes(keyword)) {
                    matches++;
                }
            });
            if (matches > maxMatches) {
                maxMatches = matches;
                detectedCategory = cat.id;
            }
        });

        if (detectedCategory && maxMatches > 0) {
            this.currentHappy.category = detectedCategory;
            const categoryCards = Helpers.$$('.happy-category-card');
            categoryCards.forEach(card => {
                card.classList.toggle('active', card.dataset.category === detectedCategory);
            });
        }
    },

    selectCategory(categoryId) {
        this.currentHappy.category = categoryId;
    },

    updateSubmitButton() {
        const btn = $('#happySubmitBtn');
        if (btn) {
            const isValid = this.currentHappy.category &&
                           this.currentHappy.content?.trim();
            btn.disabled = !isValid;
        }
    },

    submitHappy() {
        if (!this.currentHappy.category || !this.currentHappy.content?.trim()) {
            Helpers.showToast('请选择分类并填写内容', 'warning');
            return;
        }

        const happy = {
            ...this.currentHappy,
            id: this.generateId(),
            createdAt: Date.now()
        };

        this.saveHappy(happy);
        this.showHappyResponse(happy);
    },

    saveHappy(happy) {
        const happies = this.getHappies();
        happies.unshift(happy);
        localStorage.setItem('emotion_box_happies', JSON.stringify(happies));
    },

    getHappies() {
        try {
            const data = localStorage.getItem('emotion_box_happies');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    getHappiesByCategory(categoryId) {
        const happies = this.getHappies();
        if (!categoryId) return happies;
        return happies.filter(h => h.category === categoryId);
    },

    showHappyResponse(happy) {
        const category = this.categories.find(c => c.id === happy.category);
        const compliment = this.generateCompliment(happy);
        const tips = this.generateHappyTips(happy);

        App.showModal('✨ 美好已收录', `
            <div class="happy-response">
                <div class="response-category">
                    <span class="response-emoji">${category?.emoji || '🌟'}</span>
                    <span class="response-category-name">${category?.name || '美好时刻'}</span>
                </div>

                <div class="response-message">
                    <p>${compliment}</p>
                </div>

                <div class="response-tips">
                    <h4>🌸 让美好延续的小建议</h4>
                    <ul>
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>

                <div class="response-storage">
                    <span class="storage-icon">💾</span>
                    <span>这份美好已永久保存，随时可以回味</span>
                </div>
            </div>
        `, [
            { text: '继续记录', class: 'secondary-btn', action: () => {
                App.closeModal();
                this.showHappyPage();
            }},
            { text: '我知道了', class: 'primary-btn', action: () => {
                App.closeModal();
                this.closeHappy();
            }}
        ]);
    },

    generateCompliment(happy) {
        const userConfig = Storage.getUserConfig();
        const mbti = userConfig.mbti;
        const hogwarts = userConfig.hogwartsHouse;
        const style = this.getPersonalityStyle(mbti, hogwarts);

        const compliments = {
            food: {
                introvert: '独自享受美食也是一种幸福～在宁静中品味每一口的滋味，这种独处的快乐真的很美好！',
                extrovert: '和朋友分享美食的快乐加倍！看着大家一起享受美食的样子，这份快乐更加珍贵！',
                thinking: '美食不仅是味觉的享受，更是生活品质的体现。你对生活的用心值得称赞！',
                feeling: '一顿好饭能治愈一切烦恼～舌尖上的幸福最真实，也最能温暖人心！',
                ravenclaw: '探索美食也是一种智慧！每一道菜背后都有独特的故事和文化，你的好奇心真让人钦佩！',
                hufflepuff: '分享美食是最温暖的关怀！你的善良和热情让身边的人都感受到了幸福！',
                gryffindor: '敢于尝试新美食是一种勇气！你的冒险精神让生活更加精彩！',
                slytherin: '懂得享受生活是一种智慧！你善于发现生活中的美好，这是一种宝贵的能力！'
            },
            social: {
                introvert: '用心维系的关系更加珍贵～你真诚的付出让每一段关系都充满温暖！',
                extrovert: '你总是能给身边的人带来快乐！你的热情和活力感染了每一个人！',
                thinking: '良好的人际关系是生活的基石。你对人际关系的经营展现了你的智慧！',
                feeling: '被爱包围的感觉真好～你的善良和真诚让你拥有最珍贵的情谊！',
                ravenclaw: '理解他人需要智慧，你做到了！你的同理心让你成为最好的倾听者！',
                hufflepuff: '你的善良和真诚温暖着每一个人！赫奇帕奇的特质在你身上闪闪发光！',
                gryffindor: '敢于表达感情是一种勇气！你的真诚让每一段关系都更加深厚！',
                slytherin: '建立有意义的关系需要智慧和策略，你做得很棒！'
            },
            growth: {
                introvert: '默默努力的你最值得骄傲！每一步成长都在积蓄力量，终将绽放光芒！',
                extrovert: '你的进步让所有人都为你高兴！继续保持这份积极向上的态度！',
                thinking: '每一步成长都值得骄傲！你的坚持和努力展现了你的毅力和智慧！',
                feeling: '你正在成为更好的自己！这份成长的喜悦是最珍贵的礼物！',
                ravenclaw: '知识的积累让你不断进步！拉文克劳的智慧在你身上得到了最好的体现！',
                hufflepuff: '坚持不懈是最美的品质！你的努力终将得到回报！',
                gryffindor: '面对挑战需要勇气，你做到了！你的勇敢让你不断突破自我！',
                slytherin: '目标明确是成功的关键！你的执行力令人钦佩！'
            },
            fun: {
                introvert: '独处的快乐也是一种美好～享受属于自己的时光，这份宁静真的很珍贵！',
                extrovert: '你的快乐感染了身边的每一个人！这份正能量让生活更加美好！',
                thinking: '快乐其实很简单！你善于发现生活中的小确幸，这是一种智慧！',
                feeling: '生活中的小确幸值得被珍藏～你的快乐让这个世界更加温暖！',
                ravenclaw: '保持好奇心是智慧的源泉！你的探索精神让生活充满惊喜！',
                hufflepuff: '你的快乐很纯粹！这种简单的幸福最能温暖人心！',
                gryffindor: '敢于尝试新事物是一种勇气！你的冒险精神让生活更加精彩！',
                slytherin: '懂得享受生活是一种智慧！你善于创造属于自己的快乐！'
            },
            goodies: {
                introvert: '善待自己是最美好的投资～这份礼物是对自己努力的最好奖励！',
                extrovert: '分享这份喜悦吧！让你的快乐感染更多人！',
                thinking: '理性消费，聪明选择！你的决策展现了你的智慧！',
                feeling: '取悦自己是最重要的事情！这份美好值得被好好珍惜！',
                ravenclaw: '发现好物需要眼光！你的品味和智慧让生活更加精致！',
                hufflepuff: '分享好物是最温暖的关怀！你的慷慨让身边的人都感到幸福！',
                gryffindor: '奖励自己是一种勇气！你值得拥有这份美好！',
                slytherin: '懂得投资自己是一种智慧！这份好物会成为你前进的动力！'
            }
        };

        const catCompliments = compliments[happy.category] || compliments.fun;
        return catCompliments[style] || catCompliments.extrovert + ' 🌟';
    },

    getPersonalityStyle(mbti, hogwarts) {
        if (hogwarts) {
            switch(hogwarts.toUpperCase()) {
                case 'RAVENCLAW': return 'ravenclaw';
                case 'HUFFLEPUFF': return 'hufflepuff';
                case 'GRYFFINDOR': return 'gryffindor';
                case 'SLYTHERIN': return 'slytherin';
            }
        }

        if (mbti) {
            if (mbti.includes('T')) return 'thinking';
            if (mbti.includes('F')) return 'feeling';
            if (mbti.startsWith('I')) return 'introvert';
            if (mbti.startsWith('E')) return 'extrovert';
        }

        return 'extrovert';
    },

    generateHappyTips(happy) {
        const category = happy.category;
        const tips = [];

        const categoryTips = {
            food: [
                '把这份美食分享给朋友，快乐会加倍！',
                '尝试自己动手做一次，成就感满满～',
                '记录下这家店，以后可以再来回味',
                '拍张照片保存，视觉也能感受到美味'
            ],
            social: [
                '给对方发个消息，表达你的感谢～',
                '约个时间再聚，延续这份温暖',
                '写一张感谢卡，让温暖更持久',
                '把这份感动传递给更多人'
            ],
            growth: [
                '设定一个小目标，继续前进！',
                '奖励自己一下，庆祝这份进步',
                '记录下来，日后回头看会很有成就感',
                '分享你的经验，帮助更多人'
            ],
            fun: [
                '把这个有趣的事情告诉朋友，一起开心',
                '收藏起来，不开心的时候翻出来看看',
                '尝试更多新鲜事物，发现更多快乐',
                '保持好奇心，生活处处有惊喜'
            ],
            goodies: [
                '好好享用这份好物，让它提升你的生活品质',
                '分享给朋友，让美好传递',
                '记录下来，以后可以推荐给需要的人',
                '整理一下你的收藏，发现更多宝藏'
            ]
        };

        const availableTips = categoryTips[category] || categoryTips.fun;
        const shuffled = [...availableTips].sort(() => Math.random() - 0.5);
        tips.push(...shuffled.slice(0, 3));

        return tips;
    },

    closeHappy() {
        this.currentHappy = null;
        App.navigateTo('home');
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};