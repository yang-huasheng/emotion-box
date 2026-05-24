const MoodModule = {
    currentMood: null,
    currentIntensity: 0,
    currentNote: '',

    init() {
        this.bindEvents();
        this.renderMoodPanel();
        this.renderStars();
        this.loadTodayMood();
        this.renderRecentMoods();
    },

    bindEvents() {
        const saveMoodBtn = $('#saveMoodBtn');
        if (saveMoodBtn) {
            saveMoodBtn.addEventListener('click', () => this.saveMood());
        }

        const quickNoteInput = $('#quickNoteInput');
        if (quickNoteInput) {
            quickNoteInput.addEventListener('input', (e) => {
                this.currentNote = e.target.value;
            });
        }
    },

    renderMoodPanel() {
        const container = $('#moodPanel');
        if (!container) {
            this.renderMoodGrid();
            return;
        }

        container.innerHTML = EMOTION_CATEGORIES.map(category => {
            const categoryEmotions = EMOTIONS.filter(e => e.category === category.id);
            return `
                <div class="mood-category" data-category="${category.id}">
                    <div class="category-header" style="--category-color: ${category.color};">
                        <span class="category-emoji">${category.emoji}</span>
                        <span class="category-name">${category.name}</span>
                        <span class="category-desc">${category.description}</span>
                    </div>
                    <div class="category-emotions">
                        ${categoryEmotions.map(emotion => `
                            <button class="mood-card" 
                                data-emotion="${emotion.id}"
                                data-color="${emotion.color}"
                                title="${emotion.description}\n${emotion.psychology}">
                                <span class="mood-emoji">${emotion.emoji}</span>
                                <span class="mood-name">${emotion.name}</span>
                                <span class="mood-desc">${emotion.description}</span>
                                <div class="mood-glow" style="background: ${emotion.color}30;"></div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        container.addEventListener('click', (e) => {
            const moodCard = e.target.closest('.mood-card');
            if (moodCard) {
                this.selectMood(moodCard.dataset.emotion);
            }
        });
    },

    renderMoodGrid() {
        const container = $('#moodGrid');
        if (!container) return;

        container.innerHTML = EMOTIONS.map(emotion => `
            <div class="mood-item" data-emotion="${emotion.id}">
                <span class="mood-emoji">${emotion.emoji}</span>
                <span class="mood-label">${emotion.name}</span>
            </div>
        `).join('');

        container.addEventListener('click', (e) => {
            const moodItem = e.target.closest('.mood-item');
            if (moodItem) {
                this.selectMood(moodItem.dataset.emotion);
            }
        });
    },

    renderStars() {
        const container = $('#starsContainer');
        if (!container) return;

        container.innerHTML = [1, 2, 3, 4, 5].map(num => `
            <span class="star" data-value="${num}">★</span>
        `).join('');

        container.addEventListener('click', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                this.setIntensity(parseInt(star.dataset.value));
            }
        });

        container.addEventListener('mouseover', (e) => {
            const star = e.target.closest('.star');
            if (star) {
                const value = parseInt(star.dataset.value);
                this.previewIntensity(value);
            }
        });

        container.addEventListener('mouseout', () => {
            this.previewIntensity(this.currentIntensity, true);
        });
    },

    selectMood(emotionId) {
        this.currentMood = emotionId;

        const cards = Helpers.$$('.mood-card');
        cards.forEach(card => {
            card.classList.toggle('selected', card.dataset.emotion === emotionId);
            if (card.dataset.emotion === emotionId) {
                card.style.transform = 'scale(1.05)';
            } else {
                card.style.transform = 'scale(1)';
            }
        });

        const items = Helpers.$$('.mood-item');
        items.forEach(item => {
            item.classList.toggle('selected', item.dataset.emotion === emotionId);
        });

        const emotion = getEmotionById(emotionId);
        if (emotion) {
            document.documentElement.style.setProperty('--current-emotion', emotion.color);
            this.showEmotionInfo(emotion);
        }

        const saveBtn = $('#saveMoodBtn');
        if (saveBtn) {
            saveBtn.querySelector('.btn-text').textContent = '更新心情';
        }
    },

    showEmotionInfo(emotion) {
        const infoPanel = $('#emotionInfoPanel');
        if (!infoPanel) return;

        infoPanel.innerHTML = `
            <div class="emotion-info-header" style="border-left-color: ${emotion.color};">
                <span class="emotion-info-emoji">${emotion.emoji}</span>
                <div class="emotion-info-content">
                    <h4>${emotion.name}</h4>
                    <p>${emotion.description}</p>
                </div>
            </div>
            <div class="emotion-info-psychology">
                <span class="psychology-icon">🧠</span>
                <span>${emotion.psychology}</span>
            </div>
        `;
        infoPanel.classList.remove('hidden');
    },

    setIntensity(value) {
        this.currentIntensity = value;
        this.updateStars(value);
    },

    previewIntensity(value, reset = false) {
        if (reset) {
            this.updateStars(this.currentIntensity);
            return;
        }

        this.updateStars(value);
    },

    updateStars(value) {
        const stars = Helpers.$$('.star');
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < value);

            const emotion = getEmotionById(this.currentMood);
            if (emotion) {
                star.style.color = index < value ? emotion.color : '';
            }
        });
    },

    loadTodayMood() {
        const today = Helpers.getToday();
        const todayMood = Storage.getMoodByDate(today);

        const currentDate = $('#currentDate');
        if (currentDate) {
            currentDate.textContent = Helpers.formatDate(new Date(), 'full');
        }

        if (todayMood) {
            this.currentMood = todayMood.emotion;
            this.currentIntensity = todayMood.intensity;
            this.currentNote = todayMood.note || '';

            const moodCard = Helpers.$(`.mood-card[data-emotion="${todayMood.emotion}"]`);
            if (moodCard) {
                Helpers.$$('.mood-card').forEach(card => card.classList.remove('selected'));
                moodCard.classList.add('selected');
            }

            const moodItem = Helpers.$(`.mood-item[data-emotion="${todayMood.emotion}"]`);
            if (moodItem) {
                Helpers.$$('.mood-item').forEach(item => item.classList.remove('selected'));
                moodItem.classList.add('selected');
            }

            this.updateStars(todayMood.intensity);

            const noteInput = $('#quickNoteInput');
            if (noteInput) {
                noteInput.value = todayMood.note || '';
            }

            const saveBtn = $('#saveMoodBtn');
            if (saveBtn) {
                saveBtn.querySelector('.btn-text').textContent = '更新心情';
            }

            const emotion = getEmotionById(todayMood.emotion);
            if (emotion) {
                document.documentElement.style.setProperty('--current-emotion', emotion.color);
                this.showEmotionInfo(emotion);
            }
        }
    },

    saveMood() {
        if (!this.currentMood) {
            Helpers.showToast('请先选择今天的心情', 'warning');
            return;
        }

        const today = Helpers.getToday();
        const entry = {
            date: today,
            emotion: this.currentMood,
            intensity: this.currentIntensity || 3,
            note: this.currentNote,
            colorTheme: this.currentMood
        };

        const success = Storage.saveMoodEntry(entry);

        if (success) {
            Helpers.showToast(Helpers.getRandomItem(ENCOURAGEMENT_MESSAGES), 'success');
            this.renderRecentMoods();
        } else {
            Helpers.showToast('保存失败，请重试', 'error');
        }
    },

    renderRecentMoods() {
        const container = $('#moodTimeline');
        if (!container) return;

        const entries = Storage.getMoodEntries().slice(0, 7);

        if (entries.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    <p>还没有记录哦</p>
                    <p style="font-size: 14px;">记录今天的心情，开启治愈之旅</p>
                </div>
            `;
            return;
        }

        container.innerHTML = entries.map(entry => {
            const emotion = getEmotionById(entry.emotion);
            return `
                <div class="timeline-item">
                    <div class="timeline-date">${Helpers.formatDate(entry.date, 'short')}</div>
                    <div class="timeline-content">
                        <div class="timeline-mood">
                            <span class="emotion-dot" style="background: ${emotion?.color || '#7C9ACC'}"></span>
                            <span>${emotion?.emoji || '😊'} ${emotion?.name || '平静'}</span>
                            <span style="color: var(--text-secondary); font-size: 12px;">
                                ${entry.intensity ? '⭐'.repeat(entry.intensity) : ''}
                            </span>
                        </div>
                        ${entry.note ? `<p class="timeline-note">${entry.note}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    getMoodEntriesForMonth(year, month) {
        const entries = Storage.getMoodEntries();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }
};
