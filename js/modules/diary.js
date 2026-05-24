const DiaryModule = {
    currentDiary: null,
    writingTimer: null,
    writingStartTime: null,
    autoSaveTimer: null,
    searchKeyword: '',
    favoriteOnly: false,
    currentView: 'timeline', // timeline | mood
    selectedMood: null,

    init() {
        this.bindEvents();
        this.renderDiaryMoodGrid();
    },

    bindEvents() {
        const writeDiaryBtn = $('#writeDiaryBtn');
        if (writeDiaryBtn) {
            writeDiaryBtn.addEventListener('click', () => this.openNewDiary());
        }

        const backFromDiary = $('#backFromDiary');
        if (backFromDiary) {
            backFromDiary.addEventListener('click', () => this.closeDiary());
        }

        const saveDiaryBtn = $('#saveDiaryBtn');
        if (saveDiaryBtn) {
            saveDiaryBtn.addEventListener('click', () => this.saveDiary());
        }

        const deleteDiaryBtn = $('#deleteDiaryBtn');
        if (deleteDiaryBtn) {
            deleteDiaryBtn.addEventListener('click', () => this.deleteCurrentDiary());
        }

        const favoriteDiaryBtn = $('#favoriteDiaryBtn');
        if (favoriteDiaryBtn) {
            favoriteDiaryBtn.addEventListener('click', () => this.toggleFavorite());
        }

        const titleInput = $('#diaryTitleInput');
        if (titleInput) {
            titleInput.addEventListener('input', () => this.handleContentChange());
        }

        const contentInput = $('#diaryContentInput');
        if (contentInput) {
            contentInput.addEventListener('input', () => {
                this.handleContentChange();
                this.autoResizeTextarea(contentInput);
                this.autoDetectMood();
            });
        }

        this.setupHistoryEvents();
        this.setupAutoSave();
    },

    /* ================================
       日记情绪选择器相关方法
       ================================ */

    renderDiaryMoodGrid() {
        const container = $('#diaryMoodGrid');
        if (!container) return;

        // 严格遵循色彩心理学的情绪配色方案
        // 分类：愉悦开朗、平静安然、低落伤感、激动欣喜、淡然慵懒
        const emotionConfig = [
            {
                id: 'happy',
                name: '愉悦开朗',
                emoji: '☀️',
                color: '#FFAB91', // 暖浅杏色
                gradient: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 50%, #FFCCBC 100%)',
                description: '温暖放松'
            },
            {
                id: 'calm',
                name: '平静安然',
                emoji: '🌊',
                color: '#81D4FA', // 清浅湖蓝
                gradient: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #90CAF9 100%)',
                description: '静心舒缓'
            },
            {
                id: 'sad',
                name: '低落伤感',
                emoji: '🌧️',
                color: '#B39DDB', // 雾灰紫调
                gradient: 'linear-gradient(135deg, #EDE7F6 0%, #D1C4E9 50%, #B39DDB 100%)',
                description: '沉稳安抚'
            },
            {
                id: 'excited',
                name: '激动欣喜',
                emoji: '🎉',
                color: '#FFAB91', // 柔粉橘色
                gradient: 'linear-gradient(135deg, #FBE9E7 0%, #FFCCBC 50%, #FFAB91 100%)',
                description: '元气轻快'
            },
            {
                id: 'relaxed',
                name: '淡然慵懒',
                emoji: '🍃',
                color: '#A5D6A7', // 薄荷浅绿
                gradient: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)',
                description: '松弛解压'
            }
        ];

        container.innerHTML = emotionConfig.map(emotion => `
            <div class="diary-mood-item" 
                 data-emotion-id="${emotion.id}" 
                 data-emotion-name="${emotion.name}"
                 data-emotion-emoji="${emotion.emoji}"
                 data-emotion-color="${emotion.color}"
                 data-emotion-gradient="${emotion.gradient}"
                 data-emotion-desc="${emotion.description}"
                 style="--item-color: ${emotion.color};">
                <span class="diary-mood-emoji">${emotion.emoji}</span>
                <span class="diary-mood-name">${emotion.name}</span>
            </div>
        `).join('');

        // 绑定点击事件
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.diary-mood-item');
            if (item) {
                this.selectDiaryMood(item.dataset.emotionId);
            }
        });
    },

    selectDiaryMood(emotionId) {
        // 从DOM元素中获取情绪配置
        const selectedItem = Helpers.$(`[data-emotion-id="${emotionId}"]`);
        if (!selectedItem) return;

        const emotionConfig = {
            id: selectedItem.dataset.emotionId,
            name: selectedItem.dataset.emotionName,
            emoji: selectedItem.dataset.emotionEmoji,
            color: selectedItem.dataset.emotionColor,
            gradient: selectedItem.dataset.emotionGradient,
            description: selectedItem.dataset.emotionDesc
        };

        // 更新当前日记的情绪
        if (this.currentDiary) {
            this.currentDiary.mood = emotionId;
            this.currentDiary.moodId = emotionId;
            this.currentDiary.moodName = emotionConfig.name;
            this.currentDiary.moodEmoji = emotionConfig.emoji;
        }

        // 更新UI选中状态
        const items = Helpers.$$('.diary-mood-item');
        items.forEach(item => {
            const isSelected = item.dataset.emotionId === emotionId;
            item.classList.toggle('selected', isSelected);
        });

        // 更新页面主题色
        this.updateDiaryPageTheme(emotionConfig);

        // 更新底部情绪标签
        this.updateMoodTagDisplay(emotionConfig);
    },

    updateDiaryPageTheme(emotion) {
        const diaryPage = $('#diaryPage');
        if (!diaryPage) return;

        // 严格应用情绪对应的渐变背景
        const gradient = emotion.gradient;

        // 应用主题色到CSS变量
        diaryPage.style.setProperty('--diary-mood-color', emotion.color);
        diaryPage.style.setProperty('--diary-bg-color', gradient);

        // 添加过渡动画类
        diaryPage.classList.add('theme-transitioning');

        // 延迟移除过渡类，确保动画完成
        setTimeout(() => {
            diaryPage.classList.remove('theme-transitioning');
        }, 600);
    },

    updateMoodTagDisplay(emotion) {
        const moodTag = $('#diaryMoodTag');
        if (!moodTag) return;

        moodTag.innerHTML = `
            <span style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 20px;">${emotion.emoji}</span>
                <span style="font-weight: 500;">${emotion.name}</span>
                <span style="font-size: 12px; color: var(--text-secondary); margin-left: 4px;">· ${emotion.description}</span>
            </span>
        `;
    },

    /* ================================
       原有方法继续...
       ================================ */

    autoDetectMood() {
        if (!this.currentDiary?.content) return;
        
        const detectedMood = this.detectMoodFromText(this.currentDiary.content);
        if (detectedMood && !this.currentDiary.mood) {
            this.currentDiary.detectedMood = detectedMood;
            this.updateMoodIndicator(detectedMood);
        }
    },

    detectMoodFromText(text) {
        const positiveWords = ['开心', '快乐', '高兴', '幸福', '满足', '感恩', '美好', '惊喜', '爱', '喜欢', '太棒了', '不错', '顺利', '成功', '期待', '希望', '温暖', '感动', '甜蜜', '温馨', '愉快', '轻松', '舒适', '惬意'];
        const negativeWords = ['难过', '伤心', '失望', '沮丧', '焦虑', '烦躁', '委屈', '孤独', '失落', '压力', '疲惫', '痛苦', '烦恼', '担心', '害怕', '紧张', '不安', '郁闷', '无奈', '迷茫'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        positiveWords.forEach(word => {
            if (text.includes(word)) positiveCount++;
        });
        
        negativeWords.forEach(word => {
            if (text.includes(word)) negativeCount++;
        });
        
        if (positiveCount > negativeCount && positiveCount > 0) {
            return 'positive';
        } else if (negativeCount > positiveCount && negativeCount > 0) {
            return 'negative';
        }
        return 'neutral';
    },

    updateMoodIndicator(mood) {
        const moodIndicator = $('#detectedMoodIndicator');
        if (!moodIndicator) return;
        
        const moodConfig = {
            positive: { emoji: '😊', text: '积极', color: '#98D4BB' },
            negative: { emoji: '😔', text: '低落', color: '#FFB5C2' },
            neutral: { emoji: '😐', text: '平和', color: '#C4B7D6' }
        };
        
        const config = moodConfig[mood] || moodConfig.neutral;
        moodIndicator.innerHTML = `
            <span style="display: flex; align-items: center; gap: 8px; color: ${config.color};">
                ${config.emoji} ${config.text}
            </span>
        `;
        moodIndicator.classList.remove('hidden');
    },

    setupHistoryEvents() {
        const viewHistoryBtn = $('#viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => this.showHistory());
        }

        const backFromHistory = $('#backFromHistory');
        if (backFromHistory) {
            backFromHistory.addEventListener('click', () => App.navigateTo('home'));
        }

        const timelineViewBtn = $('#timelineViewBtn');
        const moodViewBtn = $('#moodViewBtn');
        
        if (timelineViewBtn) {
            timelineViewBtn.addEventListener('click', () => {
                this.currentView = 'timeline';
                timelineViewBtn.classList.add('active');
                moodViewBtn?.classList.remove('active');
                this.showDiaryList();
            });
        }
        
        if (moodViewBtn) {
            moodViewBtn.addEventListener('click', () => {
                this.currentView = 'mood';
                moodViewBtn.classList.add('active');
                timelineViewBtn?.classList.remove('active');
                this.showDiaryList();
            });
        }

        const moodFilterBtns = Helpers.$$('.mood-filter-btn');
        moodFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mood = btn.dataset.mood;
                
                if (this.selectedMood === mood) {
                    this.selectedMood = null;
                    btn.classList.remove('active');
                } else {
                    moodFilterBtns.forEach(b => b.classList.remove('active'));
                    this.selectedMood = mood;
                    btn.classList.add('active');
                }
                
                this.showDiaryList();
            });
        });

        const searchInput = $('#diarySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchKeyword = e.target.value;
                this.performSearch();
            });
        }

        const favoriteFilterBtn = $('#favoriteFilterBtn');
        if (favoriteFilterBtn) {
            favoriteFilterBtn.addEventListener('click', () => this.toggleFavoriteFilter());
        }
    },

    setupAutoSave() {
        const userConfig = Storage.getUserConfig();
        if (userConfig.settings?.autoSave) {
            this.autoSaveTimer = setInterval(() => {
                if (this.currentDiary && this.isDiaryPageVisible()) {
                    this.autoSave();
                }
            }, 30000);
        }
    },

    isDiaryPageVisible() {
        const diaryPage = $('#diaryPage');
        return diaryPage && !diaryPage.classList.contains('hidden');
    },

    openNewDiary(existingDiary = null) {
        this.currentDiary = existingDiary;
        this.writingStartTime = Date.now();

        const today = Helpers.getToday();
        const todayMood = Storage.getMoodByDate(today);

        if (!existingDiary) {
            this.currentDiary = {
                date: today,
                moodId: todayMood?.id || null,
                title: '',
                content: '',
                mood: todayMood?.emotion || null
            };
        }

        this.renderDiaryPage();
        this.startWritingTimer();
        App.showPage('diary');

        // 延迟执行，确保DOM已渲染
        setTimeout(() => {
            // 如果已有情绪，自动选中
            if (this.currentDiary?.mood) {
                this.selectDiaryMood(this.currentDiary.mood);
            }

            // 自动聚焦到标题输入框
            const titleInput = $('#diaryTitleInput');
            if (titleInput) titleInput.focus();
        }, 300);
    },

    openExistingDiary(diaryId) {
        const diary = Storage.getDiaryById(diaryId);
        if (diary) {
            this.currentDiary = { ...diary };
            this.renderDiaryPage();
            this.startWritingTimer();
            App.showPage('diary');

            const contentInput = $('#diaryContentInput');
            if (contentInput) {
                contentInput.readOnly = !!diary.isLocked;
            }

            // 延迟执行，确保DOM已渲染
            setTimeout(() => {
                // 如果已有情绪，自动选中
                if (this.currentDiary?.mood) {
                    this.selectDiaryMood(this.currentDiary.mood);
                }
            }, 300);
        }
    },

    showDiaryList() {
        const container = $('#diaryListContainer');
        if (!container) return;

        let diaries;

        if (this.favoriteOnly) {
            diaries = Storage.getFavoriteDiaries();
        } else if (this.searchKeyword) {
            diaries = Storage.searchDiaries(this.searchKeyword);
        } else {
            diaries = Storage.getDiaries();
        }

        if (this.selectedMood) {
            diaries = this.filterDiariesByMood(diaries, this.selectedMood);
        }

        if (this.currentView === 'timeline') {
            diaries = this.sortDiariesByTime(diaries);
        } else {
            diaries = this.groupDiariesByMood(diaries);
        }

        if (diaries.length === 0) {
            const emptyMessage = this.searchKeyword
                ? '没有找到匹配的日记'
                : this.favoriteOnly
                    ? '还没有收藏的日记'
                    : this.selectedMood
                        ? '该情绪分类下没有日记'
                        : '还没有日记哦';

            const emptyEmoji = this.searchKeyword
                ? '🔍'
                : this.favoriteOnly
                    ? '❤️'
                    : this.selectedMood
                        ? '💭'
                        : '📝';

            container.innerHTML = `
                <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
                    <p style="font-size: 48px; margin-bottom: 16px;">${emptyEmoji}</p>
                    <p>${emptyMessage}</p>
                    ${!this.searchKeyword && !this.favoriteOnly && !this.selectedMood ? '<p style="font-size: 14px;">点击"写日记"开始记录吧</p>' : ''}
                </div>
            `;
            return;
        }

        if (this.currentView === 'timeline') {
            container.innerHTML = this.renderTimelineView(diaries);
        } else {
            container.innerHTML = this.renderMoodView(diaries);
        }

        container.addEventListener('click', (e) => {
            const card = e.target.closest('.diary-card');
            if (card) {
                this.openExistingDiary(card.dataset.diaryId);
            }
        });
    },

    filterDiariesByMood(diaries, mood) {
        return diaries.filter(diary => {
            if (diary.mood) {
                const emotion = getEmotionById(diary.mood);
                if (emotion) {
                    const moodMap = {
                        positive: ['joy', 'love', 'excited', 'grateful', 'hopeful'],
                        negative: ['sad', 'angry', 'anxious', 'lonely', 'stressed'],
                        neutral: ['calm', 'peaceful', 'content']
                    };
                    return moodMap[mood]?.includes(emotion.id);
                }
            }
            
            if (diary.detectedMood) {
                return diary.detectedMood === mood;
            }
            
            return false;
        });
    },

    sortDiariesByTime(diaries) {
        return [...diaries].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateB.getTime() !== dateA.getTime()) {
                return dateB.getTime() - dateA.getTime();
            }
            return (b.createdAt || 0) - (a.createdAt || 0);
        });
    },

    groupDiariesByMood(diaries) {
        const groups = {
            positive: { label: '积极', emoji: '😊', diaries: [], color: '#98D4BB' },
            negative: { label: '低落', emoji: '😔', diaries: [], color: '#FFB5C2' },
            neutral: { label: '平和', emoji: '😐', diaries: [], color: '#C4B7D6' }
        };

        diaries.forEach(diary => {
            let mood = 'neutral';
            
            if (diary.mood) {
                const emotion = getEmotionById(diary.mood);
                if (emotion) {
                    const positiveEmotions = ['joy', 'love', 'excited', 'grateful', 'hopeful'];
                    const negativeEmotions = ['sad', 'angry', 'anxious', 'lonely', 'stressed'];
                    if (positiveEmotions.includes(emotion.id)) {
                        mood = 'positive';
                    } else if (negativeEmotions.includes(emotion.id)) {
                        mood = 'negative';
                    }
                }
            } else if (diary.detectedMood) {
                mood = diary.detectedMood;
            }
            
            groups[mood].diaries.push(diary);
        });

        return groups;
    },

    renderTimelineView(diaries) {
        let html = '';
        let currentDate = null;

        diaries.forEach((diary, index) => {
            if (diary.date !== currentDate) {
                if (index > 0) html += '</div>';
                currentDate = diary.date;
                html += `
                    <div class="timeline-date-section">
                        <div class="timeline-date">${Helpers.formatDate(diary.date, 'full')}</div>
                        <div class="timeline-diaries">
                `;
            }

            const mood = Storage.getMoodByDate(diary.date);
            const emotion = mood ? getEmotionById(mood.emotion) : null;
            const detectedMood = diary.detectedMood;

            html += `
                <div class="diary-card" data-diary-id="${diary.id}" style="${emotion ? `--current-emotion: ${emotion.color};` : ''}">
                    <div class="diary-card-header">
                        ${diary.favorite ? '<span class="favorite-badge">❤️</span>' : ''}
                        ${detectedMood ? this.getMoodBadge(detectedMood) : ''}
                        <h4 class="diary-card-title">${diary.title}</h4>
                    </div>
                    <p class="diary-card-preview">${diary.content}</p>
                    <div class="diary-card-meta">
                        <span>${diary.wordCount || 0} 字</span>
                        ${emotion ? `<span>${emotion.emoji}</span>` : ''}
                    </div>
                </div>
            `;
        });

        if (currentDate) html += '</div></div>';

        return html;
    },

    renderMoodView(groups) {
        let html = '';

        Object.keys(groups).forEach(key => {
            const group = groups[key];
            if (group.diaries.length > 0) {
                html += `
                    <div class="mood-group" style="--mood-color: ${group.color};">
                        <div class="mood-group-header">
                            <span class="mood-group-emoji">${group.emoji}</span>
                            <span class="mood-group-label">${group.label}</span>
                            <span class="mood-group-count">${group.diaries.length}</span>
                        </div>
                        <div class="mood-group-content">
                            ${group.diaries.map(diary => {
                                const emotion = diary.mood ? getEmotionById(diary.mood) : null;
                                return `
                                    <div class="diary-card" data-diary-id="${diary.id}" style="${emotion ? `--current-emotion: ${emotion.color};` : ''}">
                                        <div class="diary-card-header">
                                            ${diary.favorite ? '<span class="favorite-badge">❤️</span>' : ''}
                                            <h4 class="diary-card-title">${diary.title}</h4>
                                        </div>
                                        <p class="diary-card-preview">${diary.content}</p>
                                        <div class="diary-card-meta">
                                            <span>${Helpers.formatDate(diary.date, 'short')}</span>
                                            <span>${diary.wordCount || 0} 字</span>
                                            ${emotion ? `<span>${emotion.emoji}</span>` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        });

        return html;
    },

    getMoodBadge(mood) {
        const moodConfig = {
            positive: { emoji: '😊', color: '#98D4BB', text: '积极' },
            negative: { emoji: '😔', color: '#FFB5C2', text: '低落' },
            neutral: { emoji: '😐', color: '#C4B7D6', text: '平和' }
        };
        const config = moodConfig[mood];
        return `<span class="mood-badge" style="background: ${config.color};">${config.emoji}</span>`;
    },

    renderDiaryPage() {
        const diaryPage = $('#diaryPage');
        if (!diaryPage) return;

        const dateDisplay = $('#diaryDate');
        if (dateDisplay) {
            dateDisplay.textContent = Helpers.formatDate(this.currentDiary?.date || new Date(), 'full');
        }

        const titleInput = $('#diaryTitleInput');
        if (titleInput) {
            titleInput.value = this.currentDiary?.title || '';
        }

        const contentInput = $('#diaryContentInput');
        if (contentInput) {
            contentInput.value = this.currentDiary?.content || '';
            this.autoResizeTextarea(contentInput);
        }

        const moodTag = $('#diaryMoodTag');
        if (moodTag && this.currentDiary?.mood) {
            const emotion = getEmotionById(this.currentDiary.mood);
            moodTag.innerHTML = `
                <span class="emotion-dot" style="background: ${emotion?.color || '#7C9ACC'}"></span>
                <span>${emotion?.emoji || ''} 今天心情：${emotion?.name || ''}</span>
            `;
        }

        const favoriteBtn = $('#favoriteDiaryBtn');
        if (favoriteBtn) {
            if (this.currentDiary?.favorite) {
                favoriteBtn.innerHTML = '❤️ 取消收藏';
                favoriteBtn.classList.add('active');
            } else {
                favoriteBtn.innerHTML = '🤍 收藏';
                favoriteBtn.classList.remove('active');
            }
        }

        const deleteBtn = $('#deleteDiaryBtn');
        if (deleteBtn) {
            deleteBtn.classList.toggle('hidden', !this.currentDiary?.id);
        }

        this.updateWordCount();
    },

    handleContentChange() {
        const contentInput = $('#diaryContentInput');
        const titleInput = $('#diaryTitleInput');

        if (this.currentDiary) {
            this.currentDiary.content = contentInput?.value || '';
            this.currentDiary.title = titleInput?.value || '';
        }

        this.updateWordCount();

        const wordCount = Helpers.countWords(contentInput?.value || '');
        if (wordCount > 500 && wordCount % 100 === 0) {
            Helpers.showToast(`太棒了！你已经写了 ${wordCount} 个字！🎉`, 'success');
        }
    },

    updateWordCount() {
        const contentInput = $('#diaryContentInput');
        const wordCountEl = $('#wordCount');

        if (wordCountEl && contentInput) {
            const count = Helpers.countWords(contentInput.value);
            wordCountEl.textContent = `${count} 字`;
        }
    },

    startWritingTimer() {
        if (this.writingTimer) {
            clearInterval(this.writingTimer);
        }

        this.writingTimer = setInterval(() => {
            if (this.writingStartTime) {
                const elapsed = Math.floor((Date.now() - this.writingStartTime) / 1000);
                const timerEl = $('#writingTimer');
                if (timerEl) {
                    timerEl.textContent = Helpers.formatDuration(elapsed);
                }
            }
        }, 1000);
    },

    stopWritingTimer() {
        if (this.writingTimer) {
            clearInterval(this.writingTimer);
            this.writingTimer = null;
        }
    },

    autoResizeTextarea(textarea) {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
        }
    },

    autoSave() {
        if (this.currentDiary && (this.currentDiary.title || this.currentDiary.content)) {
            this.currentDiary.wordCount = Helpers.countWords(this.currentDiary.content);
            this.currentDiary.duration = this.writingStartTime
                ? Math.floor((Date.now() - this.writingStartTime) / 1000)
                : 0;

            Storage.saveDiary(this.currentDiary);
        }
    },

    saveDiary() {
        const titleInput = $('#diaryTitleInput');
        const contentInput = $('#diaryContentInput');

        const title = titleInput?.value?.trim() || '';
        const content = contentInput?.value?.trim() || '';

        if (!title && !content) {
            Helpers.showToast('请写下你的日记内容', 'warning');
            return;
        }

        this.stopWritingTimer();

        this.currentDiary = {
            ...this.currentDiary,
            title: title || Helpers.formatDate(this.currentDiary.date, 'short') + ' 的日记',
            content,
            wordCount: Helpers.countWords(content),
            duration: this.writingStartTime
                ? Math.floor((Date.now() - this.writingStartTime) / 1000)
                : 0,
            detectedMood: this.detectMoodFromText(content),
            createdAt: this.currentDiary?.createdAt || Date.now()
        };

        const success = Storage.saveDiary(this.currentDiary);

        if (success) {
            Helpers.showToast('日记已保存 ✨', 'success');
            this.currentDiary = null;
            App.navigateTo('home');
        } else {
            Helpers.showToast('保存失败，请重试', 'error');
        }
    },

    deleteCurrentDiary() {
        if (!this.currentDiary?.id) return;

        App.showModal('确认删除', `
            <p style="text-align: center;">确定要删除这篇日记吗？</p>
            <p style="text-align: center; color: var(--text-secondary); font-size: 14px;">
                删除后无法恢复
            </p>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' },
            { text: '删除', class: 'danger-btn', action: () => {
                const success = Storage.deleteDiary(this.currentDiary.id);
                if (success) {
                    App.closeModal();
                    Helpers.showToast('日记已删除', 'success');
                    this.currentDiary = null;
                    App.navigateTo('home');
                } else {
                    Helpers.showToast('删除失败', 'error');
                }
            }}
        ]);
    },

    toggleFavorite() {
        if (!this.currentDiary?.id) {
            Helpers.showToast('请先保存日记后再收藏', 'warning');
            return;
        }

        const success = Storage.toggleFavoriteDiary(this.currentDiary.id);
        if (success) {
            this.currentDiary.favorite = !this.currentDiary.favorite;
            this.renderDiaryPage();

            if (this.currentDiary.favorite) {
                Helpers.showToast('已添加到收藏 ❤️', 'success');
            } else {
                Helpers.showToast('已取消收藏', 'info');
            }
        }
    },

    closeDiary() {
        const titleInput = $('#diaryTitleInput');
        const contentInput = $('#diaryContentInput');

        const hasContent = (titleInput?.value || contentInput?.value || '').trim();

        if (hasContent && !this.currentDiary?.id) {
            if (confirm('还有未保存的内容，确定要离开吗？')) {
                this.stopWritingTimer();
                this.currentDiary = null;
                this.resetDiaryPageTheme();
                App.navigateTo('home');
            }
        } else {
            this.stopWritingTimer();
            this.currentDiary = null;
            this.resetDiaryPageTheme();
            App.navigateTo('home');
        }
    },

    resetDiaryPageTheme() {
        const diaryPage = $('#diaryPage');
        if (!diaryPage) return;

        // 重置到默认主题
        diaryPage.style.setProperty('--diary-mood-color', '#7C9ACC');
        diaryPage.style.setProperty('--diary-bg-color', 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)');

        // 清除选中状态
        const items = Helpers.$$('.diary-mood-item');
        items.forEach(item => item.classList.remove('selected'));

        // 重置底部标签
        const moodTag = $('#diaryMoodTag');
        if (moodTag) {
            moodTag.innerHTML = '<span>选择今日心情</span>';
        }
    },

    showHistory() {
        App.showPage('history');
        this.renderCalendar();
        this.showDiaryList();
    },

    switchHistoryView(view) {
        const calendarContainer = $('#calendarContainer');
        const diaryListContainer = $('#diaryListContainer');
        const selectedContent = $('#selectedDateContent');

        if (view === 'calendar') {
            calendarContainer?.classList.remove('hidden');
            diaryListContainer?.classList.add('hidden');
            selectedContent?.classList.add('hidden');
        } else {
            calendarContainer?.classList.add('hidden');
            diaryListContainer?.classList.remove('hidden');
            selectedContent?.classList.add('hidden');
        }
    },

    performSearch() {
        this.showDiaryList();
    },

    toggleFavoriteFilter() {
        this.favoriteOnly = !this.favoriteOnly;
        const btn = $('#favoriteFilterBtn');
        if (btn) {
            btn.classList.toggle('active', this.favoriteOnly);
            if (this.favoriteOnly) {
                btn.innerHTML = '❤️ 全部';
            } else {
                btn.innerHTML = '🤍 收藏';
            }
        }
        this.showDiaryList();
    },

    renderCalendar(year = new Date().getFullYear(), month = new Date().getMonth()) {
        const container = $('#calendarContainer');
        if (!container) return;

        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const daysInMonth = Helpers.getDaysInMonth(year, month);
        const firstDay = Helpers.getFirstDayOfMonth(year, month);

        const monthMoodEntries = MoodModule.getMoodEntriesForMonth(year, month);
        const moodByDate = {};
        monthMoodEntries.forEach(entry => {
            moodByDate[entry.date] = entry;
        });

        const diaries = Storage.getDiaries();
        const diaryByDate = {};
        diaries.forEach(diary => {
            if (!diaryByDate[diary.date]) {
                diaryByDate[diary.date] = [];
            }
            diaryByDate[diary.date].push(diary);
        });

        container.innerHTML = `
            <div class="calendar-header">
                <button class="icon-btn calendar-prev">
                    <svg width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="M165.66 202.34a8 8 0 0 1-11.32 11.32l-80-80a8 8 0 0 1 0-11.32l80-80a8 8 0 0 1 11.32 11.32L91.31 128Z"/></svg>
                </button>
                <h3 class="calendar-title">${year}年${month + 1}月</h3>
                <button class="icon-btn calendar-next">
                    <svg width="20" height="20" viewBox="0 0 256 256"><path fill="currentColor" d="m181.66 133.66l-80 80a8 8 0 0 1-11.32-11.32L164.69 128L90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32Z"/></svg>
                </button>
            </div>
            <div class="calendar-grid">
                ${weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('')}
                ${this.renderCalendarDays(year, month, firstDay, daysInMonth, moodByDate, diaryByDate)}
            </div>
        `;

        this.bindCalendarEvents(year, month);
    },

    renderCalendarDays(year, month, firstDay, daysInMonth, moodByDate, diaryByDate) {
        const today = Helpers.getToday();
        let days = '';

        for (let i = 0; i < firstDay; i++) {
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const prevDays = Helpers.getDaysInMonth(prevYear, prevMonth);
            const day = prevDays - firstDay + i + 1;
            days += `<div class="calendar-day other-month" data-date="${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}">${day}</div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = date === today;
            const hasMood = !!moodByDate[date];
            const hasDiary = !!diaryByDate[date];

            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (hasMood || hasDiary) classes += ' has-entry';

            days += `<div class="${classes}" data-date="${date}">${day}</div>`;
        }

        const remainingDays = 42 - (firstDay + daysInMonth);
        for (let i = 1; i <= remainingDays; i++) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            days += `<div class="calendar-day other-month" data-date="${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}">${i}</div>`;
        }

        return days;
    },

    bindCalendarEvents(year, month) {
        const prevBtn = Helpers.$('.calendar-prev');
        const nextBtn = Helpers.$('.calendar-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newMonth = month === 0 ? 11 : month - 1;
                const newYear = month === 0 ? year - 1 : year;
                this.renderCalendar(newYear, newMonth);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newMonth = month === 11 ? 0 : month + 1;
                const newYear = month === 11 ? year + 1 : year;
                this.renderCalendar(newYear, newMonth);
            });
        }

        const dayEls = Helpers.$$('.calendar-day:not(.other-month)');
        dayEls.forEach(day => {
            day.addEventListener('click', () => {
                dayEls.forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                this.showDateContent(day.dataset.date);
            });
        });
    },

    showDateContent(date) {
        const selectedContent = $('#selectedDateContent');
        const diaryListContainer = $('#diaryListContainer');

        if (diaryListContainer) {
            diaryListContainer.classList.add('hidden');
        }

        if (selectedContent) {
            selectedContent.classList.remove('hidden');

            const diaries = Storage.getDiaryByDate(date);
            const mood = Storage.getMoodByDate(date);

            let html = `<h3 style="margin-bottom: 16px;">${Helpers.formatDate(date, 'full')}</h3>`;

            if (mood) {
                const emotion = getEmotionById(mood.emotion);
                html += `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: var(--background); border-radius: 8px;">
                        <span>${emotion?.emoji || '😊'}</span>
                        <span>${emotion?.name || '平静'}</span>
                        ${mood.note ? `<span style="color: var(--text-secondary);">- ${mood.note}</span>` : ''}
                    </div>
                `;
            }

            if (diaries.length > 0) {
                html += '<div style="display: flex; flex-direction: column; gap: 12px;">';
                diaries.forEach(diary => {
                    const emotion = mood ? getEmotionById(mood.emotion) : null;
                    html += `
                        <div class="diary-card" data-diary-id="${diary.id}" style="${emotion ? `--current-emotion: ${emotion.color};` : ''}">
                            ${diary.favorite ? '<span class="favorite-badge">❤️</span>' : ''}
                            <h4 class="diary-card-title">${diary.title}</h4>
                            <p class="diary-card-preview">${diary.content.substring(0, 100)}${diary.content.length > 100 ? '...' : ''}</p>
                            <div class="diary-card-meta">
                                <span>${diary.wordCount || 0} 字</span>
                                <span>约 ${Math.ceil((diary.duration || 0) / 60)} 分钟</span>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            } else if (!mood) {
                html += '<p style="color: var(--text-secondary); text-align: center; padding: 24px;">这天还没有记录哦</p>';
            }

            selectedContent.innerHTML = html;

            const diaryCards = Helpers.$$('.diary-card', selectedContent);
            diaryCards.forEach(card => {
                card.addEventListener('click', () => {
                    this.openExistingDiary(card.dataset.diaryId);
                });
            });
        }
    },

    showEditor() {
    }
};
