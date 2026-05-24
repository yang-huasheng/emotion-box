const StatsModule = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        const viewStatsBtn = $('#viewStatsBtn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => App.navigateTo('moodWall'));
        }

        const backFromMoodWall = $('#backFromMoodWall');
        if (backFromMoodWall) {
            backFromMoodWall.addEventListener('click', () => App.navigateTo('home'));
        }

        const startMbtiBtn = $('#startMbtiBtn');
        if (startMbtiBtn) {
            startMbtiBtn.addEventListener('click', () => this.startMBTITest());
        }

        const statsPeriodBtns = Helpers.$$('.stats-period-btn');
        statsPeriodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                statsPeriodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changePeriod(btn.dataset.period);
            });
        });

        const exportStatsBtn = $('#exportStatsBtn');
        if (exportStatsBtn) {
            exportStatsBtn.addEventListener('click', () => this.exportStats());
        }
    },

    show() {
        this.currentPeriod = 'week';
        this.renderStatsOverview();
        this.renderEmotionDistribution();
        this.renderMoodTrend();
        this.renderEmotionHeatmap();
        this.renderCategoryStats();
        this.renderEmotionCalendar();
    },

    changePeriod(period) {
        this.currentPeriod = period;
        this.renderMoodTrend();
        this.renderEmotionHeatmap();
        this.renderCategoryStats();
    },

    renderStatsOverview() {
        const container = $('#statsOverview');
        if (!container) return;

        const diaryStats = Storage.getDiaryStats();
        const moodEntries = Storage.getMoodEntries();
        const diaries = Storage.getDiaries();
        const userConfig = Storage.getUserConfig();

        const last30Days = this.getLast30DaysData();
        const avgMoodScore = this.calculateAverageMood(last30Days);
        const dominantEmotion = this.getDominantEmotion(last30Days);
        const positiveRatio = this.calculatePositiveRatio(last30Days);

        container.innerHTML = `
            <div class="stats-overview-grid">
                <div class="stats-card primary">
                    <div class="stats-card-icon">📊</div>
                    <div class="stats-card-content">
                        <div class="stats-card-value">${diaryStats.total}</div>
                        <div class="stats-card-label">总日记数</div>
                    </div>
                </div>

                <div class="stats-card success">
                    <div class="stats-card-icon">😊</div>
                    <div class="stats-card-content">
                        <div class="stats-card-value">${(avgMoodScore * 20).toFixed(0)}%</div>
                        <div class="stats-card-label">平均心情指数</div>
                    </div>
                </div>

                <div class="stats-card warning">
                    <div class="stats-card-icon">💝</div>
                    <div class="stats-card-content">
                        <div class="stats-card-value">${positiveRatio.toFixed(0)}%</div>
                        <div class="stats-card-label">正向情绪占比</div>
                    </div>
                </div>

                <div class="stats-card info">
                    <div class="stats-card-icon">🔥</div>
                    <div class="stats-card-content">
                        <div class="stats-card-value">${diaryStats.thisMonth}</div>
                        <div class="stats-card-label">本月记录</div>
                    </div>
                </div>
            </div>

            <div class="stats-insight-card">
                <div class="insight-header">
                    <span class="insight-icon">💡</span>
                    <h3>情绪洞察</h3>
                </div>
                <div class="insight-content">
                    ${this.generateInsight(last30Days, avgMoodScore, dominantEmotion, positiveRatio)}
                </div>
            </div>
        `;
    },

    generateInsight(last30Days, avgMoodScore, dominantEmotion, positiveRatio) {
        const insights = [];

        if (avgMoodScore >= 3.5) {
            insights.push('🌟 最近你的心情状态非常好！继续保持这种积极的心态。');
        } else if (avgMoodScore >= 2.5) {
            insights.push('✨ 你的心情状态总体良好，生活节奏把握得很不错。');
        } else if (avgMoodScore >= 1.5) {
            insights.push('💙 最近有些低潮，但请相信黑暗终会过去。');
        } else {
            insights.push('🤗 最近经历了一段困难时期，记得对自己温柔一些。');
        }

        if (positiveRatio >= 60) {
            insights.push('😊 你的生活中正向情绪占了主导，这是非常健康的信号。');
        } else if (positiveRatio >= 40) {
            insights.push('⚖️ 你的情绪分布比较均衡，这说明你能够体验生活的多面性。');
        } else {
            insights.push('💪 最近的负面情绪较多，但这也是成长的机会。记得多关注自己的感受。');
        }

        if (dominantEmotion) {
            const emotion = getEmotionById(dominantEmotion.id);
            insights.push(`${emotion?.emoji || '🎭'} 最近你常感受到${emotion?.name || '某种情绪'}，这反映了你的生活状态。`);
        }

        return insights.map(insight => `<p>${insight}</p>`).join('');
    },

    renderEmotionDistribution() {
        const container = $('#emotionDistribution');
        if (!container) return;

        const diaries = Storage.getDiaries();
        const emotionCounts = {};
        const emotionPercents = {};

        EMOTIONS.forEach(e => {
            emotionCounts[e.id] = 0;
        });

        diaries.forEach(diary => {
            if (diary.mood) {
                emotionCounts[diary.mood]++;
            } else if (diary.detectedMood) {
                const categoryEmotions = this.getCategoryEmotions(diary.detectedMood);
                if (categoryEmotions.length > 0) {
                    emotionCounts[categoryEmotions[0].id]++;
                }
            }
        });

        const total = diaries.length || 1;
        Object.keys(emotionCounts).forEach(id => {
            emotionPercents[id] = (emotionCounts[id] / total * 100).toFixed(1);
        });

        const sortedEmotions = EMOTIONS.filter(e => emotionCounts[e.id] > 0)
            .sort((a, b) => emotionCounts[b.id] - emotionCounts[a.id])
            .slice(0, 8);

        const categoryStats = this.getEmotionCategoryStats(emotionCounts);

        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">
                    <h3>🎨 情绪分布</h3>
                    <span class="chart-subtitle">各类情绪出现频率</span>
                </div>
                <div class="pie-chart-wrapper">
                    <div class="pie-chart" id="pieChart"></div>
                    <div class="pie-legend">
                        ${sortedEmotions.map(emotion => `
                            <div class="legend-item" data-emotion="${emotion.id}">
                                <div class="legend-color" style="background: ${emotion.color};"></div>
                                <div class="legend-label">
                                    <span class="legend-emoji">${emotion.emoji}</span>
                                    <span class="legend-name">${emotion.name}</span>
                                </div>
                                <div class="legend-value">
                                    <span class="legend-percent">${emotionPercents[emotion.id]}%</span>
                                    <span class="legend-count">${emotionCounts[emotion.id]}次</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="category-summary">
                    ${categoryStats.map(cat => `
                        <div class="category-stat" style="--cat-color: ${cat.color};">
                            <span class="category-stat-icon">${cat.emoji}</span>
                            <span class="category-stat-name">${cat.name}</span>
                            <span class="category-stat-value">${cat.percent.toFixed(0)}%</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        setTimeout(() => {
            this.renderPieChart(sortedEmotions, emotionPercents);
        }, 100);
    },

    renderPieChart(emotions, percents) {
        const container = $('#pieChart');
        if (!container) return;

        const size = 240;
        const strokeWidth = 40;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const center = size / 2;

        let currentOffset = 0;
        const slices = emotions.map(emotion => {
            const percent = parseFloat(percents[emotion.id]);
            const sliceCircumference = (percent / 100) * circumference;
            const slice = {
                ...emotion,
                offset: currentOffset,
                circumference: sliceCircumference,
                dashArray: `${sliceCircumference} ${circumference - sliceCircumference}`
            };
            currentOffset += sliceCircumference;
            return slice;
        });

        container.innerHTML = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                ${slices.map(slice => `
                    <circle
                        class="pie-slice"
                        cx="${center}"
                        cy="${center}"
                        r="${radius}"
                        fill="none"
                        stroke="${slice.color}"
                        stroke-width="${strokeWidth}"
                        stroke-dasharray="${slice.dashArray}"
                        stroke-dashoffset="${-slice.offset}"
                        data-emotion="${slice.id}"
                        style="--slice-offset: ${slice.offset};"
                    />
                `).join('')}
                <circle cx="${center}" cy="${center}" r="${radius - strokeWidth / 2 - 10}" fill="var(--surface)" />
            </svg>
            <div class="pie-center">
                <div class="pie-center-emoji" id="pieCenterEmoji">📊</div>
                <div class="pie-center-text" id="pieCenterText">选择查看</div>
            </div>
        `;

        const sliceEls = Helpers.$$('.pie-slice', container);
        sliceEls.forEach(slice => {
            slice.addEventListener('mouseenter', () => {
                const emotion = getEmotionById(slice.dataset.emotion);
                const centerEmoji = $('#pieCenterEmoji');
                const centerText = $('#pieCenterText');
                if (centerEmoji) centerEmoji.textContent = emotion?.emoji || '📊';
                if (centerText) centerText.textContent = emotion?.name || '';
            });

            slice.addEventListener('mouseleave', () => {
                const centerEmoji = $('#pieCenterEmoji');
                const centerText = $('#pieCenterText');
                if (centerEmoji) centerEmoji.textContent = '📊';
                if (centerText) centerText.textContent = '选择查看';
            });
        });
    },

    renderMoodTrend() {
        const container = $('#moodTrend');
        if (!container) return;

        let data;
        let labels;

        switch(this.currentPeriod) {
            case 'week':
                data = this.getLast7DaysMoodData();
                labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                break;
            case 'month':
                data = this.getLast30DaysMoodData();
                labels = this.generateMonthLabels(30);
                break;
            case 'year':
                data = this.getLast12MonthsMoodData();
                labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                break;
        }

        const maxValue = 5;
        const chartHeight = 200;
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return { x, y, value };
        });

        const pathD = points.map((point, index) => {
            if (index === 0) return `M ${point.x}% ${point.y}px`;
            const prev = points[index - 1];
            const cpx = (prev.x + point.x) / 2;
            return `Q ${cpx}% ${prev.y}px, ${point.x}% ${point.y}px`;
        }).join(' ');

        const areaD = pathD + ` L 100% ${chartHeight}px L 0% ${chartHeight}px Z`;

        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">
                    <h3>📈 心境波动</h3>
                    <div class="period-switcher">
                        <button class="period-btn ${this.currentPeriod === 'week' ? 'active' : ''}" data-period="week">近7天</button>
                        <button class="period-btn ${this.currentPeriod === 'month' ? 'active' : ''}" data-period="month">近30天</button>
                        <button class="period-btn ${this.currentPeriod === 'year' ? 'active' : ''}" data-period="year">近一年</button>
                    </div>
                </div>
                <div class="trend-chart" id="trendChartArea">
                    <svg class="trend-svg" viewBox="0 0 100 ${chartHeight}" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style="stop-color: var(--primary); stop-opacity: 0.3" />
                                <stop offset="100%" style="stop-color: var(--primary); stop-opacity: 0" />
                            </linearGradient>
                        </defs>
                        <path class="trend-area" d="${areaD}" fill="url(#trendGradient)" />
                        <path class="trend-line" d="${pathD}" fill="none" />
                        ${points.map((point, index) => `
                            <circle
                                class="trend-point"
                                cx="${point.x}%"
                                cy="${point.y}px"
                                r="3"
                                data-value="${point.value}"
                                data-label="${labels[index]}"
                            />
                        `).join('')}
                    </svg>
                    <div class="trend-labels">
                        ${labels.map((label, index) => `
                            <span class="trend-label" style="left: ${(index / (labels.length - 1)) * 100}%">${label}</span>
                        `).join('')}
                    </div>
                    <div class="trend-tooltip hidden" id="trendTooltip"></div>
                </div>
                <div class="trend-stats">
                    <div class="trend-stat">
                        <span class="trend-stat-label">平均值</span>
                        <span class="trend-stat-value">${(data.reduce((a, b) => a + b, 0) / data.length || 0).toFixed(1)}</span>
                    </div>
                    <div class="trend-stat">
                        <span class="trend-stat-label">最高值</span>
                        <span class="trend-stat-value">${Math.max(...data).toFixed(1)}</span>
                    </div>
                    <div class="trend-stat">
                        <span class="trend-stat-label">波动幅度</span>
                        <span class="trend-stat-value">${(Math.max(...data) - Math.min(...data)).toFixed(1)}</span>
                    </div>
                </div>
            </div>
        `;

        this.bindTrendChartEvents();
    },

    bindTrendChartEvents() {
        const chartArea = $('#trendChartArea');
        if (!chartArea) return;

        const points = Helpers.$$('.trend-point', chartArea);
        const tooltip = $('#trendTooltip');

        points.forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                if (tooltip) {
                    tooltip.classList.remove('hidden');
                    tooltip.innerHTML = `
                        <div class="tooltip-date">${point.dataset.label}</div>
                        <div class="tooltip-value">心情指数: ${parseFloat(point.dataset.value).toFixed(1)}</div>
                    `;
                    tooltip.style.left = point.cx.baseVal.valueAsString;
                    tooltip.style.top = `${parseFloat(point.cy.baseVal.valueAsString) - 40}px`;
                }
            });

            point.addEventListener('mouseleave', () => {
                if (tooltip) {
                    tooltip.classList.add('hidden');
                }
            });
        });

        const periodBtns = Helpers.$$('.period-btn', chartArea);
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changePeriod(btn.dataset.period);
            });
        });
    },

    renderEmotionHeatmap() {
        const container = $('#emotionHeatmap');
        if (!container) return;

        let data;
        let days;

        switch(this.currentPeriod) {
            case 'week':
                data = this.getLast7DaysMoodData();
                days = this.getLast7Days();
                break;
            case 'month':
                data = this.getLast30DaysMoodData();
                days = this.getLast30Days();
                break;
            case 'year':
                data = this.getLast12MonthsMoodData();
                days = this.getLast12Months();
                break;
        }

        const maxIntensity = 5;

        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">
                    <h3>🔥 情绪热力图</h3>
                    <span class="chart-subtitle">每日情绪强度分布</span>
                </div>
                <div class="heatmap-grid">
                    ${days.map((day, index) => {
                        const intensity = data[index] || 0;
                        const percent = (intensity / maxIntensity) * 100;
                        const color = this.getHeatmapColor(percent);
                        return `
                            <div class="heatmap-cell"
                                 style="--intensity: ${percent}%; background: ${color};"
                                 data-date="${day}"
                                 data-intensity="${intensity}"
                                 title="${day}: ${intensity.toFixed(1)}">
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="heatmap-legend">
                    <span class="legend-label">低</span>
                    <div class="legend-gradient"></div>
                    <span class="legend-label">高</span>
                </div>
            </div>
        `;
    },

    getHeatmapColor(percent) {
        if (percent <= 20) return 'rgba(196, 162, 212, 0.3)';
        if (percent <= 40) return 'rgba(196, 162, 212, 0.5)';
        if (percent <= 60) return 'rgba(110, 198, 255, 0.6)';
        if (percent <= 80) return 'rgba(152, 212, 187, 0.7)';
        return 'rgba(255, 217, 61, 0.8)';
    },

    renderCategoryStats() {
        const container = $('#categoryStats');
        if (!container) return;

        const diaries = Storage.getDiaries();
        const categoryData = this.analyzeDiariesByCategory(diaries);

        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-title">
                    <h3>📚 内容分析</h3>
                    <span class="chart-subtitle">日记内容分类统计</span>
                </div>
                <div class="category-analysis">
                    ${categoryData.map(cat => `
                        <div class="category-analysis-item">
                            <div class="category-analysis-header">
                                <span class="category-analysis-icon">${cat.emoji}</span>
                                <span class="category-analysis-name">${cat.name}</span>
                                <span class="category-analysis-count">${cat.count}篇</span>
                            </div>
                            <div class="category-analysis-bar">
                                <div class="category-analysis-fill" style="width: ${cat.percent}%; background: ${cat.color};"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderEmotionCalendar() {
        const container = $('#emotionCalendar');
        if (!container) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const diaries = Storage.getDiaries();
        const moodEntries = Storage.getMoodEntries();

        const moodByDate = {};
        moodEntries.forEach(entry => {
            moodByDate[entry.date] = entry;
        });

        const diaryByDate = {};
        diaries.forEach(diary => {
            diaryByDate[diary.date] = diary;
        });

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        let calendarHtml = `
            <div class="chart-container">
                <div class="chart-title">
                    <h3>🗓️ 情绪日历</h3>
                    <span class="chart-subtitle">${year}年${month + 1}月</span>
                </div>
                <div class="calendar-grid-stats">
                    ${['日', '一', '二', '三', '四', '五', '六'].map(day => `
                        <div class="calendar-header-cell">${day}</div>
                    `).join('')}
                    ${Array(firstDay).fill(null).map(() => '<div class="calendar-cell empty"></div>').join('')}
                    ${Array(daysInMonth).fill(null).map((_, i) => {
                        const day = i + 1;
                        const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const mood = moodByDate[date];
                        const hasDiary = !!diaryByDate[date];

                        let bgColor = 'transparent';
                        let emoji = '';

                        if (mood) {
                            const emotion = getEmotionById(mood.emotion);
                            bgColor = emotion?.color || 'transparent';
                            emoji = emotion?.emoji || '';
                        } else if (hasDiary) {
                            bgColor = 'var(--border)';
                            emoji = '📝';
                        }

                        const isToday = date === Helpers.getToday();

                        return `
                            <div class="calendar-cell ${isToday ? 'today' : ''}"
                                 style="background: ${bgColor};"
                                 data-date="${date}"
                                 title="${date}${emoji ? ' - ' + emoji : ''}">
                                <span class="calendar-day-num">${day}</span>
                                ${emoji ? `<span class="calendar-day-emoji">${emoji}</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        container.innerHTML = calendarHtml;
    },

    analyzeDiariesByCategory(diaries) {
        const categories = [
            { id: 'positive', name: '积极', emoji: '😊', color: '#98D4BB' },
            { id: 'negative', name: '消极', emoji: '😔', color: '#FFB5C2' },
            { id: 'neutral', name: '平和', emoji: '😐', color: '#C4B7D6' }
        ];

        const categoryCounts = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        diaries.forEach(diary => {
            if (diary.mood) {
                const emotion = getEmotionById(diary.mood);
                if (emotion) {
                    categoryCounts[emotion.category]++;
                }
            } else if (diary.detectedMood) {
                categoryCounts[diary.detectedMood]++;
            }
        });

        const total = diaries.length || 1;

        return categories.map(cat => ({
            ...cat,
            count: categoryCounts[cat.id],
            percent: (categoryCounts[cat.id] / total) * 100
        }));
    },

    getCategoryEmotions(category) {
        return EMOTIONS.filter(e => e.category === category);
    },

    getEmotionCategoryStats(emotionCounts) {
        const categoryStats = [
            { id: 'positive', name: '正向', emoji: '☀️', color: '#FFD93D' },
            { id: 'neutral', name: '中性', emoji: '🌤️', color: '#6EC6FF' },
            { id: 'negative', name: '负向', emoji: '🌧️', color: '#C4A2D4' }
        ];

        let total = 0;
        categoryStats.forEach(cat => {
            const categoryEmotions = EMOTIONS.filter(e => e.category === cat.id);
            cat.count = categoryEmotions.reduce((sum, e) => sum + (emotionCounts[e.id] || 0), 0);
            total += cat.count;
        });

        categoryStats.forEach(cat => {
            cat.percent = total > 0 ? (cat.count / total) * 100 : 0;
        });

        return categoryStats;
    },

    getLast30DaysData() {
        const moodEntries = Storage.getMoodEntries();
        const diaries = Storage.getDiaries();
        const data = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = Helpers.formatDate(date, 'date');

            const mood = moodEntries.find(e => e.date === dateStr);
            const diary = diaries.find(d => d.date === dateStr);

            if (mood?.intensity) {
                data.push(mood.intensity);
            } else if (diary) {
                const detectedMood = diary.detectedMood;
                if (detectedMood === 'positive') data.push(4);
                else if (detectedMood === 'negative') data.push(2);
                else data.push(3);
            } else {
                data.push(0);
            }
        }

        return data;
    },

    getLast7DaysMoodData() {
        const data = this.getLast30DaysData();
        return data.slice(-7);
    },

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(Helpers.formatDate(date, 'short'));
        }
        return days;
    },

    getLast30DaysMoodData() {
        return this.getLast30DaysData();
    },

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(Helpers.formatDate(date, 'short'));
        }
        return days;
    },

    getLast12MonthsMoodData() {
        const moodEntries = Storage.getMoodEntries();
        const diaries = Storage.getDiaries();
        const data = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const monthEntries = moodEntries.filter(e => e.date.startsWith(yearMonth));
            const monthDiaries = diaries.filter(d => d.date.startsWith(yearMonth));

            let avgIntensity = 0;
            if (monthEntries.length > 0) {
                avgIntensity = monthEntries.reduce((sum, e) => sum + (e.intensity || 3), 0) / monthEntries.length;
            } else if (monthDiaries.length > 0) {
                const positiveCount = monthDiaries.filter(d => d.detectedMood === 'positive').length;
                const negativeCount = monthDiaries.filter(d => d.detectedMood === 'negative').length;
                if (positiveCount > negativeCount) avgIntensity = 4;
                else if (negativeCount > positiveCount) avgIntensity = 2;
                else avgIntensity = 3;
            }

            data.push(avgIntensity);
        }

        return data;
    },

    getLast12Months() {
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(`${date.getMonth() + 1}月`);
        }
        return months;
    },

    calculateAverageMood(data) {
        const nonZero = data.filter(v => v > 0);
        if (nonZero.length === 0) return 0;
        return nonZero.reduce((sum, v) => sum + v, 0) / nonZero.length;
    },

    getDominantEmotion(data) {
        const moodEntries = Storage.getMoodEntries();
        const diaries = Storage.getDiaries();

        const emotionCounts = {};
        const last30Dates = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last30Dates.push(Helpers.formatDate(date, 'date'));
        }

        last30Dates.forEach(date => {
            const mood = moodEntries.find(e => e.date === date);
            const diary = diaries.find(d => d.date === date);

            if (mood?.emotion) {
                emotionCounts[mood.emotion] = (emotionCounts[mood.emotion] || 0) + 2;
            }

            if (diary?.detectedMood) {
                const categoryEmotions = this.getCategoryEmotions(diary.detectedMood);
                if (categoryEmotions.length > 0) {
                    emotionCounts[categoryEmotions[0].id] = (emotionCounts[categoryEmotions[0].id] || 0) + 1;
                }
            }
        });

        const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            return {
                id: sorted[0][0],
                count: sorted[0][1]
            };
        }

        return null;
    },

    calculatePositiveRatio(data) {
        const positiveCount = data.filter(v => v >= 4).length;
        const totalCount = data.filter(v => v > 0).length;
        if (totalCount === 0) return 0;
        return (positiveCount / totalCount) * 100;
    },

    generateMonthLabels(count) {
        const labels = [];
        const today = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            if (i % 5 === 0) {
                labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            } else {
                labels.push('');
            }
        }

        return labels;
    },

    renderPersonality() {
        const container = $('#personalityContent');
        if (!container) return;

        const userConfig = Storage.getUserConfig();
        const mbti = userConfig.mbti;

        if (mbti && MBTI_TYPES[mbti]) {
            const typeInfo = MBTI_TYPES[mbti];
            container.innerHTML = `
                <div class="personality-result" style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 16px;">${this.getMBTIEmoji(mbti)}</div>
                    <h4 style="font-size: 24px; color: var(--primary); margin-bottom: 8px;">${mbti}</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 16px;">${typeInfo.name}</p>
                    <p style="font-size: 14px; color: var(--text-primary);">${typeInfo.description}</p>
                    <div style="margin-top: 24px; padding: 16px; background: var(--background); border-radius: 12px; text-align: left;">
                        <h5 style="font-size: 14px; margin-bottom: 12px; color: var(--text-primary);">💡 专属情绪建议</h5>
                        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">${this.getMBTIAdvice(mbti)}</p>
                    </div>
                    <button class="secondary-btn" style="margin-top: 16px;" onclick="StatsModule.startMBTITest()">重新测试</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <p class="personality-hint">完成MBTI测试，开启专属心理洞察</p>
                <button class="primary-btn" id="startMbtiBtn">开始测试</button>
            `;

            const startBtn = $('#startMbtiBtn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startMBTITest());
            }
        }
    },

    getMBTIEmoji(mbti) {
        const emojis = {
            'INTJ': '🎯',
            'INTP': '💡',
            'ENTJ': '⚡',
            'ENTP': '🔥',
            'INFJ': '🌈',
            'INFP': '🎨',
            'ENFJ': '✨',
            'ENFP': '🦋',
            'ISTJ': '📊',
            'ISFJ': '🛡️',
            'ESTJ': '🏆',
            'ESFJ': '💝',
            'ISTP': '🔧',
            'ISFP': '🌸',
            'ESTP': '🚀',
            'ESFP': '🎭'
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
        return advice[mbti] || '你是独一无二的个体。了解自己是一个持续的旅程，我很荣幸能陪伴你。';
    },

    startMBTITest() {
        App.showModal('MBTI人格测试', `
            <div id="mbtiTestContainer">
                <p style="text-align: center; color: var(--text-secondary); margin-bottom: 24px;">
                    这个测试将帮助你了解自己的性格特点，从而获得更个性化的情绪管理建议。
                </p>
                <div id="mbtiProgress" style="display: flex; gap: 8px; justify-content: center; margin-bottom: 24px;">
                    ${MBTI_QUESTIONS.map((_, i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--border);" data-step="${i}"></div>`).join('')}
                </div>
                <div id="mbtiQuestion"></div>
            </div>
        `, [
            { text: '取消', class: 'ghost-btn', action: 'close' }
        ]);

        this.mbtiAnswers = [];
        this.currentQuestion = 0;
        this.renderMBTIQuestion();
    },

    renderMBTIQuestion() {
        const container = $('#mbtiQuestion');
        if (!container || this.currentQuestion >= MBTI_QUESTIONS.length) {
            this.finishMBTITest();
            return;
        }

        const question = MBTI_QUESTIONS[this.currentQuestion];

        const progressDots = Helpers.$$('[data-step]');
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

        const options = Helpers.$$('button[data-type]', container);
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                this.mbtiAnswers.push({ type: btn.dataset.type });
                this.currentQuestion++;
                this.renderMBTIQuestion();
            });
        });
    },

    finishMBTITest() {
        const mbti = Helpers.parseMBTI(this.mbtiAnswers);

        if (mbti) {
            const userConfig = Storage.getUserConfig();
            userConfig.mbti = mbti;
            Storage.setUserConfig(userConfig);

            App.closeModal();
            Helpers.showToast(`测试完成！你是 ${mbti} 类型`, 'success');

            this.renderPersonality();
        } else {
            Helpers.showToast('测试未完成，请重试', 'warning');
        }
    },

    exportStats() {
        const stats = {
            exportDate: new Date().toISOString(),
            overview: Storage.getDiaryStats(),
            moodEntries: Storage.getMoodEntries(),
            diaries: Storage.getDiaries(),
            emotionDistribution: this.getEmotionDistribution(),
            moodTrend: this.getMoodTrend()
        };

        const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `情绪数据统计_${new Date().toLocaleDateString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        Helpers.showToast('统计数据已导出', 'success');
    },

    getEmotionDistribution() {
        const diaries = Storage.getDiaries();
        const distribution = {};

        diaries.forEach(diary => {
            if (diary.mood) {
                distribution[diary.mood] = (distribution[diary.mood] || 0) + 1;
            }
        });

        return distribution;
    },

    getMoodTrend() {
        return this.getLast30DaysData();
    },

    getMonthlyStats(year, month) {
        const entries = MoodModule.getMoodEntriesForMonth(year, month);

        const emotionCounts = {};
        EMOTIONS.forEach(e => emotionCounts[e.id] = 0);

        let totalIntensity = 0;

        entries.forEach(entry => {
            if (emotionCounts[entry.emotion] !== undefined) {
                emotionCounts[entry.emotion]++;
            }
            totalIntensity += entry.intensity || 0;
        });

        const avgIntensity = entries.length > 0 ? (totalIntensity / entries.length).toFixed(1) : 0;

        return {
            totalEntries: entries.length,
            emotionCounts,
            avgIntensity,
            dominantEmotion: Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
        };
    }
};
