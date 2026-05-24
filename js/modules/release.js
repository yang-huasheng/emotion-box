const ReleaseModule = {
    negativeEmotions: [
        { id: 'grievance', name: '委屈', emoji: '😢' },
        { id: 'irritated', name: '烦躁', emoji: '😣' },
        { id: 'anxious', name: '焦虑', emoji: '😰' },
        { id: 'low', name: '低落', emoji: '😔' },
        { id: 'lonely', name: '孤独', emoji: '🥺' },
        { id: 'overwhelmed', name: '压力', emoji: '😩' },
        { id: 'angry', name: '愤怒', emoji: '😤' },
        { id: 'confused', name: '迷茫', emoji: '😕' }
    ],

    dissipationDurations: [
        { value: 1, label: '1小时', desc: '短暂的情绪需要' },
        { value: 6, label: '6小时', desc: '给心情放个假' },
        { value: 24, label: '1天', desc: '给自己一些时间' },
        { value: 72, label: '3天', desc: '慢慢消散' }
    ],

    currentRelease: null,
    checkTimer: null,

    init() {
        this.bindEvents();
        this.startExpirationChecker();
    },

    bindEvents() {
        const releaseBtn = $('#releaseBtn');
        if (releaseBtn) {
            releaseBtn.addEventListener('click', () => this.showReleasePage());
        }

        const backFromRelease = $('#backFromRelease');
        if (backFromRelease) {
            backFromRelease.addEventListener('click', () => this.closeRelease());
        }

        const emotionChips = Helpers.$$('.release-emotion-chip');
        emotionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                emotionChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.selectEmotion(chip.dataset.emotion);
            });
        });
    },

    startExpirationChecker() {
        this.checkTimer = setInterval(() => {
            this.checkExpiredReleases();
        }, 60000);
    },

    checkExpiredReleases() {
        const releases = this.getReleases();
        const now = Date.now();
        const unexpired = releases.filter(r => {
            return r.expireTime > now;
        });

        if (unexpired.length !== releases.length) {
            this.setReleases(unexpired);
            this.showExpiredNotification(releases.length - unexpired.length);
        }
    },

    showExpiredNotification(count) {
        Helpers.showToast(`${count}条负面情绪已消散 ✨`, 'success');
    },

    showReleasePage() {
        this.currentRelease = {
            emotion: null,
            content: '',
            duration: null,
            createdAt: Date.now()
        };
        this.renderReleasePage();
        App.showPage('release');
    },

    renderReleasePage() {
        const page = $('#releasePage');
        if (!page) return;

        const emotionChips = this.negativeEmotions.map(e => `
            <button class="release-emotion-chip" data-emotion="${e.id}">
                <span class="chip-emoji">${e.emoji}</span>
                <span class="chip-name">${e.name}</span>
            </button>
        `).join('');

        const durationCards = this.dissipationDurations.map(d => `
            <button class="duration-card" data-duration="${d.value}">
                <span class="duration-value">${d.label}</span>
                <span class="duration-desc">${d.desc}</span>
            </button>
        `).join('');

        page.innerHTML = `
            <div class="release-container">
                <div class="release-header">
                    <h2 class="release-title">放空情绪盒 🌊</h2>
                    <p class="release-subtitle">把烦心事写下来，让它慢慢消散</p>
                </div>

                <div class="release-section">
                    <h3 class="section-label">此刻你最强烈的感受是？</h3>
                    <div class="emotion-chips-container">
                        ${emotionChips}
                    </div>
                </div>

                <div class="release-section">
                    <h3 class="section-label">倾诉你的心事</h3>
                    <textarea id="releaseContent" class="release-textarea" placeholder="在这里写下让你烦心的事...不用担心，这里只有你一个人，我愿意倾听你的一切。"></textarea>
                    <div class="word-hint">
                        <span id="releaseWordCount">0</span> 字
                    </div>
                </div>

                <div class="release-section">
                    <h3 class="section-label">希望这些情绪多久消散？</h3>
                    <div class="duration-cards-container">
                        ${durationCards}
                    </div>
                </div>

                <button class="release-submit-btn" id="releaseSubmitBtn" disabled>
                    释放情绪，拥抱平静
                </button>
            </div>
        `;

        this.bindReleaseEvents();
    },

    bindReleaseEvents() {
        const contentInput = $('#releaseContent');
        if (contentInput) {
            contentInput.addEventListener('input', () => {
                this.currentRelease.content = contentInput.value;
                const count = Helpers.countWords(contentInput.value);
                const wordCountEl = $('#releaseWordCount');
                if (wordCountEl) {
                    wordCountEl.textContent = count;
                }
                this.updateSubmitButton();
            });
        }

        const emotionChips = Helpers.$$('.release-emotion-chip');
        emotionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                emotionChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.selectEmotion(chip.dataset.emotion);
                this.updateSubmitButton();
            });
        });

        const durationCards = Helpers.$$('.duration-card');
        durationCards.forEach(card => {
            card.addEventListener('click', () => {
                durationCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectDuration(parseInt(card.dataset.duration));
                this.updateSubmitButton();
            });
        });

        const submitBtn = $('#releaseSubmitBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitRelease());
        }
    },

    selectEmotion(emotionId) {
        this.currentRelease.emotion = emotionId;
    },

    selectDuration(hours) {
        this.currentRelease.duration = hours;
        this.currentRelease.expireTime = Date.now() + (hours * 60 * 60 * 1000);
    },

    updateSubmitButton() {
        const btn = $('#releaseSubmitBtn');
        if (btn) {
            const isValid = this.currentRelease.emotion &&
                           this.currentRelease.content?.trim() &&
                           this.currentRelease.duration;
            btn.disabled = !isValid;
        }
    },

    submitRelease() {
        if (!this.currentRelease.emotion || !this.currentRelease.content?.trim() || !this.currentRelease.duration) {
            Helpers.showToast('请选择情绪类型并填写内容', 'warning');
            return;
        }

        const release = {
            ...this.currentRelease,
            id: this.generateId(),
            createdAt: Date.now()
        };

        this.saveRelease(release);
        this.showReleaseResponse(release);
    },

    saveRelease(release) {
        const releases = this.getReleases();
        releases.unshift(release);
        localStorage.setItem('emotion_box_releases', JSON.stringify(releases));
    },

    getReleases() {
        try {
            const data = localStorage.getItem('emotion_box_releases');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    setReleases(releases) {
        localStorage.setItem('emotion_box_releases', JSON.stringify(releases));
    },

    showReleaseResponse(release) {
        const emotion = this.negativeEmotions.find(e => e.id === release.emotion);
        const response = this.generateComfortMessage(release);
        const tips = this.generateTipsForPersonality(release);

        App.showModal('💙 我听到了', `
            <div class="release-response">
                <div class="response-emotion">
                    <span class="response-emoji">${emotion?.emoji || '💙'}</span>
                    <span class="response-emotion-name">${emotion?.name || '低落'}</span>
                </div>

                <div class="response-message">
                    <p>${response}</p>
                </div>

                <div class="response-tips">
                    <h4>🌸 专属于你的情绪调节方法</h4>
                    <ul>
                        ${tips.map(tip => `<li>${tip}</li>`).join('')}
                    </ul>
                </div>

                <div class="response-timer">
                    <span class="timer-icon">⏰</span>
                    <span>${this.formatExpireTime(release.expireTime)}后，这些情绪将自动消散</span>
                </div>
            </div>
        `, [
            { text: '我知道了', class: 'primary-btn', action: () => {
                App.closeModal();
                this.closeRelease();
            }}
        ]);
    },

    generateComfortMessage(release) {
        const emotion = release.emotion;
        const userConfig = Storage.getUserConfig();
        const mbti = userConfig.mbti;
        const hogwarts = userConfig.hogwartsHouse;

        const style = this.getPersonalityStyle(mbti, hogwarts);

        const messages = {
            grievance: {
                introvert: '我知道你承受了很多委屈...有时候，把委屈说出来就已经是治愈的开始。你值得被理解和善待。 💙',
                extrovert: '亲爱的，委屈不代表你软弱。你已经很坚强了，记得给自己一个大大的拥抱。 🤗',
                thinking: '委屈往往源于期望与现实的差距。让我们理性看待这件事：你的感受是真实的，但不一定代表事实的全部。',
                feeling: '我能感受到你的委屈...想哭就哭出来吧，释放出来会好很多。你不是一个人在承受。',
                ravenclaw: '委屈是一种信号，提醒我们需要关注自己的需求。让我们用智慧来分析：是什么让你感到委屈？我们可以做些什么？',
                hufflepuff: '亲爱的，无论你现在感觉如何，我都在这里陪着你。委屈的时候，记得对自己温柔一点。',
                gryffindor: '勇敢面对委屈是一种勇气！你已经很勇敢了，因为你选择了面对而不是逃避。',
                slytherin: '委屈可以成为成长的动力。让我们冷静地分析现状，找到最适合自己的解决方案。'
            },
            irritated: {
                introvert: '烦躁的时候，我们的心就像被什么东西堵住了... 试着做几次深呼吸，让气息带走这份不安。',
                extrovert: '烦躁是很自然的反应！不如站起来动一动，或者听一首喜欢的歌，让心情转换一下？ 🎵',
                thinking: '烦躁通常源于对现状的不满。让我们分析一下：是什么具体的事情让你感到烦躁？我们可以找到解决方法。',
                feeling: '我能感受到你的烦躁...这很正常，每个人都有情绪波动的时候。给自己一些耐心。',
                ravenclaw: '烦躁往往是因为思维的过度活跃。让我们用理性的思维来梳理一下，找到问题的根源。',
                hufflepuff: '没关系的，烦躁只是暂时的。让我用温暖来陪伴你度过这段时间。',
                gryffindor: '面对烦躁需要勇气，但你已经做到了！相信自己，你有能力克服这种情绪！',
                slytherin: '烦躁是一种信号，提醒我们需要调整状态。让我们冷静地评估情况，找到最有效的应对策略。'
            },
            anxious: {
                introvert: '焦虑只是在提醒我们有些事需要被关注... 把担忧写下来，看看它是否真的值得你如此担心。',
                extrovert: '嘿，深呼吸！你不是一个人在面对这些。试着把焦虑的事情分成小块，一件一件来处理。 🌟',
                thinking: '焦虑通常源于对未来的不确定性。让我们列出可能的结果，然后为每种结果做好应对准备。',
                feeling: '我能感受到你的焦虑...这种感觉真的很不好受。让我们一起慢慢梳理，好吗？',
                ravenclaw: '焦虑往往是因为我们的思维在高速运转。让我们用智慧来分析，找到问题的根源，然后找到解决方案。',
                hufflepuff: '没关系的，无论你现在感觉如何，我都在这里陪着你。我们可以一起慢慢度过这段时间。',
                gryffindor: '勇敢面对焦虑是第一步！你已经很勇敢了，因为你选择了面对而不是逃避。让我们一起找到克服它的方法！',
                slytherin: '焦虑是一种信号，提醒我们需要关注某些事情。让我们冷静地分析现状，找到最有效的应对策略。'
            },
            low: {
                introvert: '低落的时刻，试着回忆一件让你感到温暖的小事... 即使在最黑暗的时候，也总会有光亮存在。 🌙',
                extrovert: '难过的时候，允许自己休息一下。你不需要"振作起来"，只需要对自己温柔一些。',
                thinking: '低落是一种自然的情绪反应。让我们理性地看待它：是什么事情引发了这种情绪？我们可以一起找到应对的方法。',
                feeling: '我能感受到你的难过...想哭就哭出来吧，释放出来会好很多。你不是一个人在承受这些。',
                ravenclaw: '悲伤是人类情感的一部分，它在提醒我们某些事情的重要性。让我们一起思考如何从这段经历中成长。',
                hufflepuff: '亲爱的，无论什么时候，我都在这里给你一个温暖的拥抱。你的感受很重要，我愿意倾听你的每一句话。',
                gryffindor: '面对悲伤需要很大的勇气，但你已经做到了。相信自己，你有足够的力量度过这段时间！',
                slytherin: '悲伤是暂时的，它会慢慢过去。让我们冷静地接受它，然后找到重新站起来的方法。'
            },
            lonely: {
                introvert: '孤独有时候是一种珍贵的时间，让自己与内心对话... 但请记得，你永远不会真正孤独。 💜',
                extrovert: '即使现在感到孤单，也请相信有人在关心着你。愿意打开心扉的你，已经很勇敢了。',
                thinking: '孤独可以是一种选择，也可以是一种提醒。让我们分析一下：你真正需要的是什么？',
                feeling: '我能感受到你的孤独...这种感觉真的很难受。但请相信，你并不孤单，我在这里陪着你。',
                ravenclaw: '孤独可以成为自我反思的机会。让我们用智慧来思考：这段时间可以教会我们什么？',
                hufflepuff: '亲爱的，你不是一个人。我会一直在这里，给你温暖和支持。赫奇帕奇的温暖会一直陪伴着你。',
                gryffindor: '勇敢地面对孤独需要勇气！但你已经做到了。相信自己，你有足够的力量度过这段时间！',
                slytherin: '孤独是成长的必经之路。让我们冷静地接受它，然后找到重新连接的方法。'
            },
            overwhelmed: {
                introvert: '压力太大的时候，试着把注意力放在呼吸上... 慢慢来，你不需要一下子解决所有问题。 🌿',
                extrovert: '感到不堪重负是身体在提醒你需要休息！优先级排序，只做最重要的事，其他的可以先放一放。',
                thinking: '压力往往源于任务过多或期望过高。让我们理性地分析：什么是真正重要的？我们可以制定一个计划。',
                feeling: '我能感受到你的压力...这种感觉真的很沉重。但请相信，你不是一个人在承受。',
                ravenclaw: '压力是一种信号，提醒我们需要调整。让我们用智慧来分析：什么是可以控制的？什么是需要放手的？',
                hufflepuff: '亲爱的，你已经做得很好了。让我用温暖来陪伴你度过这段压力大的时光。',
                gryffindor: '面对压力需要勇气！但你已经很勇敢了，因为你选择了面对而不是逃避。相信自己！',
                slytherin: '压力可以转化为动力。让我们冷静地评估情况，找到最有效的应对策略。'
            },
            angry: {
                introvert: '愤怒是一种强烈的情绪，它背后往往藏着未被满足的需求... 试着感受它，但不要被它控制。 🔥',
                extrovert: '生气是完全正常的！找一个安全的方式表达出来，比如写下来或者运动发泄。',
                thinking: '愤怒通常源于边界被侵犯或期望未被满足。让我们理性地分析：什么是真正让你生气的原因？',
                feeling: '我能感受到你的愤怒...这种情绪很强烈，但请相信，你有能力控制它。',
                ravenclaw: '愤怒是一种信号，提醒我们需要关注自己的边界。让我们用智慧来分析：如何建设性地表达这种情绪？',
                hufflepuff: '亲爱的，生气的时候，记得深呼吸。让我用温暖来帮助你平静下来。',
                gryffindor: '面对愤怒需要勇气！但你已经很勇敢了，因为你选择了面对而不是逃避。相信自己！',
                slytherin: '愤怒可以成为改变的动力。让我们冷静地评估情况，找到最有效的应对策略。'
            },
            confused: {
                introvert: '迷茫的时候，不要急着找到所有答案... 有时候，不知道方向也是一种前进的方式。 🌫️',
                extrovert: '感到迷茫说明你在认真思考人生！这正是探索新可能性的好时机呢。',
                thinking: '迷茫通常源于对未来的不确定性。让我们理性地分析：什么是你真正想要的？我们可以制定一个计划。',
                feeling: '我能感受到你的迷茫...这种感觉真的很困惑。但请相信，答案会慢慢浮现的。',
                ravenclaw: '迷茫是智慧成长的机会。让我们用理性的思维来探索：什么是真正重要的？',
                hufflepuff: '亲爱的，迷茫的时候，记得给自己一些时间。我会在这里陪着你，直到你找到方向。',
                gryffindor: '面对迷茫需要勇气！但你已经很勇敢了，因为你选择了面对而不是逃避。相信自己！',
                slytherin: '迷茫是成长的必经之路。让我们冷静地评估情况，找到最适合自己的方向。'
            }
        };

        const emotionMessages = messages[emotion] || messages.low;
        return emotionMessages[style] || emotionMessages.extrovert;
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

    generateTipsForPersonality(release) {
        const userConfig = Storage.getUserConfig();
        const mbti = userConfig.mbti;
        const hogwarts = userConfig.hogwartsHouse;
        const tips = [];

        const mbtiTips = {
            'E': ['和信任的人聊聊你的感受', '参加一些社交活动', '和朋友一起做点有趣的事'],
            'I': ['给自己一些独处的时间', '写日记梳理情绪', '在安静的环境中放松'],
            'S': ['做些具体的小事转移注意力', '整理房间或收拾东西', '去大自然中走走'],
            'N': ['尝试冥想或深呼吸练习', '想象一个让你平静的画面', '听一些舒缓的音乐'],
            'T': ['理性分析让你焦虑的事情', '列出pros和cons', '制定一个行动计划'],
            'F': ['和信任的人分享你的感受', '回忆温暖的往事', '给自己一些善意的肯定'],
            'J': ['制定一个简单的待办事项', '给情绪一个明确的表达', '建立规律的作息'],
            'P': ['接受当下的不确定性', '尝试一些新鲜的事物', '保持开放的心态']
        };

        if (mbti) {
            const types = mbti.split('');
            types.forEach(t => {
                if (mbtiTips[t]) {
                    tips.push(mbtiTips[t][Math.floor(Math.random() * mbtiTips[t].length)]);
                }
            });
        }

        const hogwartsTips = {
            'Gryffindor': ['勇敢面对你的恐惧', '相信自己的力量', '挑战让你成长'],
            'Hufflepuff': ['你值得被善待', '寻找志同道合的伙伴', '坚持做善良的自己'],
            'Ravenclaw': ['知识会带来答案', '思考是治愈的一部分', '寻求新的视角'],
            'Slytherin': ['善用你的资源', '设定清晰的目标', '保护自己的能量']
        };

        if (hogwarts && hogwartsTips[hogwarts]) {
            tips.push(hogwartsTips[hogwarts][Math.floor(Math.random() * hogwartsTips[hogwarts].length)]);
        }

        if (tips.length < 3) {
            const defaultTips = [
                '给自己一个温暖的拥抱',
                '喝一杯热茶或热巧克力',
                '听一些舒缓的轻音乐',
                '去户外呼吸新鲜空气',
                '和小动物互动一下',
                '泡一个热水澡放松身体'
            ];
            while (tips.length < 3) {
                const tip = defaultTips[Math.floor(Math.random() * defaultTips.length)];
                if (!tips.includes(tip)) {
                    tips.push(tip);
                }
            }
        }

        return tips.slice(0, 4);
    },

    formatExpireTime(expireTime) {
        const now = Date.now();
        const diff = expireTime - now;

        if (diff <= 0) return '即将消散';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            return `${days}天`;
        } else if (hours >= 1) {
            return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
        } else {
            return `${minutes}分钟`;
        }
    },

    closeRelease() {
        this.currentRelease = null;
        App.navigateTo('home');
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};