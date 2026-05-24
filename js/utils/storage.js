const Storage = {
    KEYS: {
        CURRENT_USER: 'emotion_box_current_user',
        USER_ACCOUNTS: 'emotion_box_user_accounts',
        USER_CONFIG: 'emotion_box_user_config',
        MOOD_ENTRIES: 'emotion_box_moods',
        DIARIES: 'emotion_box_diaries',
        CHAT_HISTORY: 'emotion_box_chat',
        SETTINGS: 'emotion_box_settings',
        ENCRYPTED_DATA: 'emotion_box_encrypted_data'
    },

    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    clear() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },

    async setEncryptedData(data, privacyPassword) {
        if (!privacyPassword) {
            return this.set(this.KEYS.ENCRYPTED_DATA, { encrypted: false, data });
        }

        try {
            const encrypted = await Crypto.encrypt(JSON.stringify(data), privacyPassword);
            return this.set(this.KEYS.ENCRYPTED_DATA, { encrypted: true, data: encrypted });
        } catch (error) {
            console.error('Encrypt data error:', error);
            return false;
        }
    },

    async getEncryptedData(privacyPassword) {
        const stored = this.get(this.KEYS.ENCRYPTED_DATA);
        if (!stored) return null;

        if (!stored.encrypted) {
            return stored.data;
        }

        if (!privacyPassword) {
            return null;
        }

        try {
            const decrypted = await Crypto.decrypt(stored.data, privacyPassword);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decrypt data error:', error);
            return null;
        }
    },

    getUserConfig() {
        return this.get(this.KEYS.USER_CONFIG) || {
            id: this.generateId(),
            username: null,
            passwordHash: null,
            hasAccount: false,
            mbti: null,
            holland: null,
            hogwartsHouse: null,
            mbtiCompleted: false,
            hollandCompleted: false,
            onboardingCompleted: false,
            theme: 'calm',
            password: null,
            privacyPassword: null,
            privacyPasswordSet: false,
            createdAt: Date.now(),
            settings: {
                language: 'zh-CN',
                notifications: true,
                autoSave: true
            }
        };
    },

    setUserConfig(config) {
        return this.set(this.KEYS.USER_CONFIG, config);
    },

    getMoodEntries() {
        return this.get(this.KEYS.MOOD_ENTRIES) || [];
    },

    saveMoodEntry(entry) {
        const entries = this.getMoodEntries();
        const existingIndex = entries.findIndex(e => e.date === entry.date);

        if (existingIndex >= 0) {
            entries[existingIndex] = { ...entries[existingIndex], ...entry, updatedAt: Date.now() };
        } else {
            entries.push({ ...entry, id: this.generateId(), createdAt: Date.now() });
        }

        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        return this.set(this.KEYS.MOOD_ENTRIES, entries);
    },

    getMoodByDate(date) {
        const entries = this.getMoodEntries();
        return entries.find(e => e.date === date) || null;
    },

    getDiaries() {
        return this.get(this.KEYS.DIARIES) || [];
    },

    saveDiary(diary) {
        const diaries = this.getDiaries();

        if (diary.id) {
            const index = diaries.findIndex(d => d.id === diary.id);
            if (index >= 0) {
                diaries[index] = { ...diaries[index], ...diary, updatedAt: Date.now() };
            }
        } else {
            diaries.push({ ...diary, id: this.generateId(), createdAt: Date.now() });
        }

        diaries.sort((a, b) => new Date(b.date) - new Date(a.date));
        return this.set(this.KEYS.DIARIES, diaries);
    },

    getDiaryById(id) {
        const diaries = this.getDiaries();
        return diaries.find(d => d.id === id) || null;
    },

    getDiaryByDate(date) {
        const diaries = this.getDiaries();
        return diaries.filter(d => d.date === date);
    },

    deleteDiary(id) {
        const diaries = this.getDiaries();
        const filtered = diaries.filter(d => d.id !== id);
        return this.set(this.KEYS.DIARIES, filtered);
    },

    searchDiaries(keyword) {
        const diaries = this.getDiaries();
        if (!keyword) return diaries;

        const lowerKeyword = keyword.toLowerCase();
        return diaries.filter(d =>
            (d.title && d.title.toLowerCase().includes(lowerKeyword)) ||
            (d.content && d.content.toLowerCase().includes(lowerKeyword)) ||
            (d.mood && d.mood.toLowerCase().includes(lowerKeyword))
        );
    },

    getFavoriteDiaries() {
        const diaries = this.getDiaries();
        return diaries.filter(d => d.favorite === true);
    },

    toggleFavoriteDiary(id) {
        const diaries = this.getDiaries();
        const diary = diaries.find(d => d.id === id);
        if (diary) {
            diary.favorite = !diary.favorite;
            diary.updatedAt = Date.now();
            this.set(this.KEYS.DIARIES, diaries);
            return true;
        }
        return false;
    },

    getDiaryStats() {
        const diaries = this.getDiaries();
        const moods = this.getMoodEntries();

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

        return {
            total: diaries.length,
            thisMonth: diaries.filter(d => new Date(d.date) >= startOfMonth).length,
            thisWeek: diaries.filter(d => new Date(d.date) >= startOfWeek).length,
            favorites: diaries.filter(d => d.favorite).length,
            moodCount: moods.length
        };
    },

    getChatHistory() {
        return this.get(this.KEYS.CHAT_HISTORY) || [];
    },

    saveChatMessage(message) {
        const history = this.getChatHistory();
        history.push({ ...message, id: this.generateId(), timestamp: Date.now() });
        return this.set(this.KEYS.CHAT_HISTORY, history);
    },

    clearChatHistory() {
        return this.set(this.KEYS.CHAT_HISTORY, []);
    },

    exportData() {
        return {
            userConfig: this.getUserConfig(),
            moodEntries: this.getMoodEntries(),
            diaries: this.getDiaries(),
            exportDate: new Date().toISOString()
        };
    },

    importData(data) {
        try {
            if (data.userConfig) this.set(this.KEYS.USER_CONFIG, data.userConfig);
            if (data.moodEntries) this.set(this.KEYS.MOOD_ENTRIES, data.moodEntries);
            if (data.diaries) this.set(this.KEYS.DIARIES, data.diaries);
            return true;
        } catch (error) {
            console.error('Import data error:', error);
            return false;
        }
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    generateDemoData() {
        const demoMoods = [];
        const demoDiaries = [];
        const today = new Date();

        const emotionIds = EMOTIONS.map(e => e.id);
        const positiveEmotions = emotionIds.filter(id => {
            const e = EMOTIONS.find(em => em.id === id);
            return e?.category === 'positive';
        });
        const neutralEmotions = emotionIds.filter(id => {
            const e = EMOTIONS.find(em => em.id === id);
            return e?.category === 'neutral';
        });
        const negativeEmotions = emotionIds.filter(id => {
            const e = EMOTIONS.find(em => em.id === id);
            return e?.category === 'negative';
        });

        for (let i = 89; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = Helpers.formatDate(date, 'date');

            let selectedEmotions;
            const random = Math.random();
            if (random < 0.5) {
                selectedEmotions = positiveEmotions;
            } else if (random < 0.8) {
                selectedEmotions = neutralEmotions;
            } else {
                selectedEmotions = negativeEmotions;
            }

            const emotion = selectedEmotions[Math.floor(Math.random() * selectedEmotions.length)];
            const intensity = Math.floor(Math.random() * 5) + 1;

            demoMoods.push({
                id: this.generateId(),
                date: dateStr,
                emotion: emotion,
                intensity: intensity,
                createdAt: date.getTime() + Math.random() * 86400000
            });

            if (Math.random() < 0.6) {
                const detectedMood = EMOTIONS.find(e => e.id === emotion)?.category || 'neutral';
                const diaryTitles = {
                    positive: ['美好的一天', '今天很开心', '收获满满', '感恩遇见', '心情愉悦'],
                    negative: ['有些低落', '需要加油', '会好起来的', '记录一下', '今天累了'],
                    neutral: ['平凡的一天', '日常记录', '继续努力', '保持平静', '生活点滴']
                };

                const diaryContents = {
                    positive: [
                        '今天和朋友一起去了公园，阳光很好，心情也跟着明亮起来。感谢身边有这样的朋友陪伴。',
                        '工作上有了新的进展，很开心自己的努力没有白费。继续保持这种状态！',
                        '吃到了想念已久的美食，感觉超级满足。生活中的小确幸值得被记录。'
                    ],
                    negative: [
                        '今天有些事情不太顺利，情绪有点低落。不过没关系，明天又是新的一天。',
                        '感觉压力有点大，需要好好调整一下自己的状态。希望能早点好起来。',
                        '有点累了，今天早点休息吧。照顾好自己才是最重要的。'
                    ],
                    neutral: [
                        '今天平平淡淡地度过了，没有特别的开心也没有特别的难过。这样的日子也很好。',
                        '完成了日常的工作和学习，按部就班的生活也很踏实。继续保持规律作息。',
                        '看了几页书，写了点东西，今天就这样过去了。每一天都是独特的。'
                    ]
                };

                const categoryTitles = diaryTitles[detectedMood] || diaryTitles.neutral;
                const categoryContents = diaryContents[detectedMood] || diaryContents.neutral;

                demoDiaries.push({
                    id: this.generateId(),
                    date: dateStr,
                    title: categoryTitles[Math.floor(Math.random() * categoryTitles.length)],
                    content: categoryContents[Math.floor(Math.random() * categoryContents.length)],
                    mood: emotion,
                    detectedMood: detectedMood,
                    favorite: Math.random() < 0.2,
                    createdAt: date.getTime() + Math.random() * 86400000,
                    type: Math.random() < 0.5 ? 'happy' : (Math.random() < 0.3 ? 'release' : null),
                    category: Math.random() < 0.7 ? ['food', 'friends', 'growth', 'fun', 'surprise'][Math.floor(Math.random() * 5)] : null
                });
            }
        }

        this.set(this.KEYS.MOOD_ENTRIES, demoMoods);
        this.set(this.KEYS.DIARIES, demoDiaries);

        const config = this.getUserConfig();
        config.mbti = ['INTJ', 'INFP', 'ENFJ', 'ESFP'][Math.floor(Math.random() * 4)];
        config.hogwartsHouse = ['GRYFFINDOR', 'HUFFLEPUFF', 'RAVENCLAW', 'SLYTHERIN'][Math.floor(Math.random() * 4)];
        this.setUserConfig(config);

        return {
            moodCount: demoMoods.length,
            diaryCount: demoDiaries.length
        };
    },

    clearDemoData() {
        this.set(this.KEYS.MOOD_ENTRIES, []);
        this.set(this.KEYS.DIARIES, []);
    }
};
