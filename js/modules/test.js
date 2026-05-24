// ========================================
// 测试模块 - MBTI和霍兰德职业测试（优化版）
// ========================================

const TestModule = {
    // 状态管理
    currentTest: null,
    currentQuestion: 0,
    answers: {},

    // MBTI测试数据 - 精简为12题，覆盖四大维度
    mbtiQuestions: [
        // E-I 维度（2题）
        {
            dimension: 'E-I',
            question: '在社交场合，你通常：',
            options: [
                { value: 'E', label: '主动与人交谈，享受成为焦点' },
                { value: 'I', label: '等待别人来搭话，静静观察' }
            ]
        },
        {
            dimension: 'E-I',
            question: '假期时你更喜欢：',
            options: [
                { value: 'E', label: '和朋友一起出去玩，人多热闹' },
                { value: 'I', label: '独自在家休息，享受独处' }
            ]
        },
        // S-N 维度（3题）
        {
            dimension: 'S-N',
            question: '阅读时你更喜欢：',
            options: [
                { value: 'S', label: '真实具体的故事，贴近生活' },
                { value: 'N', label: '科幻奇幻类作品，充满想象' }
            ]
        },
        {
            dimension: 'S-N',
            question: '学习新技能时，你：',
            options: [
                { value: 'S', label: '按步骤来，打好基础，稳扎稳打' },
                { value: 'N', label: '先摸索大方向，追求创新突破' }
            ]
        },
        {
            dimension: 'S-N',
            question: '看待问题时，你更关注：',
            options: [
                { value: 'S', label: '眼前的具体细节，注重实际' },
                { value: 'N', label: '整体的意义和可能性，把握大局' }
            ]
        },
        // T-F 维度（3题）
        {
            dimension: 'T-F',
            question: '做决定时，你更看重：',
            options: [
                { value: 'T', label: '逻辑和原则，理性分析利弊' },
                { value: 'F', label: '人的感受和影响，注重情感' }
            ]
        },
        {
            dimension: 'T-F',
            question: '当朋友向你倾诉烦恼时，你：',
            options: [
                { value: 'F', label: '给予安慰和鼓励，温暖支持' },
                { value: 'T', label: '分析问题并提供建议，理性帮助' }
            ]
        },
        {
            dimension: 'T-F',
            question: '你认为公平更重要：',
            options: [
                { value: 'T', label: '对每个人都一样，规则面前人人平等' },
                { value: 'F', label: '考虑个人情况，因人而异更合理' }
            ]
        },
        // J-P 维度（4题）
        {
            dimension: 'J-P',
            question: '你更喜欢：',
            options: [
                { value: 'J', label: '有计划的生活，按部就班' },
                { value: 'P', label: '随性的生活方式，灵活自由' }
            ]
        },
        {
            dimension: 'J-P',
            question: '面对任务时，你：',
            options: [
                { value: 'J', label: '提前规划，按时完成，有条不紊' },
                { value: 'P', label: '最后一刻才完成，享受紧迫感' }
            ]
        },
        {
            dimension: 'J-P',
            question: '旅行时你更喜欢：',
            options: [
                { value: 'J', label: '提前订好行程，一切尽在掌握' },
                { value: 'P', label: '说走就走，随性探索，充满惊喜' }
            ]
        },
        {
            dimension: 'J-P',
            question: '当你制定计划后：',
            options: [
                { value: 'J', label: '严格执行，计划就是用来完成的' },
                { value: 'P', label: '随时调整，计划赶不上变化' }
            ]
        }
    ],

    // 霍兰德职业测试数据 - 精简为30题，每种类型5题
    hollandQuestions: [
        // R - 现实型（5题）
        {
            dimension: 'R',
            question: '你喜欢使用工具进行手工制作',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'R',
            question: '你喜欢修理机械设备或电子产品',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'R',
            question: '你喜欢户外活动和体育运动',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'R',
            question: '你擅长动手操作，动手能力强',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'R',
            question: '你喜欢探索自然和户外探险活动',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        // I - 研究型（5题）
        {
            dimension: 'I',
            question: '你喜欢研究和分析问题',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'I',
            question: '你对科学发现和新知识感兴趣',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'I',
            question: '你喜欢独立思考和逻辑推理',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'I',
            question: '你喜欢解决复杂的谜题或问题',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'I',
            question: '你享受深入学习和思考的过程',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        // A - 艺术型（5题）
        {
            dimension: 'A',
            question: '你喜欢绘画、雕塑或音乐等艺术创作',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'A',
            question: '你具有创造力和丰富的想象力',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'A',
            question: '你喜欢表达自己的情感和想法',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'A',
            question: '你对美有敏锐的感知和追求',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'A',
            question: '你喜欢自由灵活的工作方式',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        // S - 社会型（5题）
        {
            dimension: 'S',
            question: '你喜欢帮助他人解决问题',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'S',
            question: '你善于与人沟通交流',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'S',
            question: '你关心他人的福祉和需求',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'S',
            question: '你喜欢教学和传授知识',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'S',
            question: '你喜欢团队合作，互相支持',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        // E - 企业型（5题）
        {
            dimension: 'E',
            question: '你喜欢领导和影响他人',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'E',
            question: '你善于说服和谈判',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'E',
            question: '你喜欢竞争和挑战',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'E',
            question: '你善于组织和管理活动',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'E',
            question: '你向往商业成功和成就',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        // C - 常规型（5题）
        {
            dimension: 'C',
            question: '你喜欢有秩序和结构的工作',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'C',
            question: '你注重细节和准确性',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'C',
            question: '你擅长数据处理和整理',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'C',
            question: '你喜欢文职和行政工作',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        },
        {
            dimension: 'C',
            question: '你喜欢遵守明确的工作流程',
            options: [
                { value: 5, label: '非常同意' },
                { value: 4, label: '比较同意' },
                { value: 3, label: '一般' },
                { value: 2, label: '不太同意' },
                { value: 1, label: '不同意' }
            ]
        }
    ],

    // MBTI类型描述
    mbtiTypes: {
        'INTJ': { name: '建筑师', icon: '🏗️', desc: '富有想象力和战略思维，能够将想法变为现实。理性、有逻辑，善于分析问题。' },
        'INTP': { name: '逻辑学家', icon: '🧩', desc: '喜欢探索新想法，擅长逻辑分析。独立思考，追求知识。' },
        'ENTJ': { name: '指挥官', icon: '⚔️', desc: '天生的领导者，善于决策和组织。果断、有战略眼光。' },
        'ENTP': { name: '辩论家', icon: '💡', desc: '充满创意，喜欢智识挑战。善于发现问题的新解决方案。' },
        'INFJ': { name: '提倡者', icon: '🌈', desc: '理想主义者，有强烈的价值观。善于洞察他人需求。' },
        'INFP': { name: '调停者', icon: '🎭', desc: '浪漫、善良，追求有意义的生活。忠于自己的价值观。' },
        'ENFJ': { name: '主人公', icon: '⭐', desc: '魅力四射的天生领导者。善于激励他人，富有感染力。' },
        'ENFP': { name: '竞选者', icon: '🎪', desc: '热情洋溢的创意者，善于激励他人。充满热情和可能性。' },
        'ISTJ': { name: '物流师', icon: '📋', desc: '务实、可靠，注重责任。做事有条理，有原则。' },
        'ISFJ': { name: '守卫者', icon: '🛡️', desc: '温暖、体贴，默默守护他人。勤奋、忠诚、有责任心。' },
        'ESTJ': { name: '总经理', icon: '📊', desc: '务实、果断，善于组织和管理。注重效率和秩序。' },
        'ESFJ': { name: '执政官', icon: '🤝', desc: '热情、体贴，关心他人。善于社交，喜欢帮助他人。' },
        'ISTP': { name: '鉴赏家', icon: '🔧', desc: '务实、灵活，动手能力强。善于分析和解决实际问题。' },
        'ISFP': { name: '探险家', icon: '🌸', desc: '艺术、灵活，追求自由。有审美眼光，享受当下。' },
        'ESTP': { name: '企业家', icon: '🚀', desc: '充满活力，擅长社交。务实、灵活，善于把握机会。' },
        'ESFP': { name: '表演者', icon: '🎭', desc: '活泼、热情，喜欢成为焦点。善于社交，享受生活。' }
    },

    // 霍兰德类型描述
    hollandTypes: {
        'R': { name: '现实型', icon: '🔧', desc: '喜欢动手操作、户外活动和具体实践。偏好有形的工作，需要技能和体力。' },
        'I': { name: '研究型', icon: '🔬', desc: '喜欢研究、分析和解决复杂问题。偏好科学和学术活动，需要智识和好奇心。' },
        'A': { name: '艺术型', icon: '🎨', desc: '喜欢创造性和自我表达。偏好艺术活动，需要想象力和创造力。' },
        'S': { name: '社会型', icon: '🤝', desc: '喜欢帮助、教育和支持他人。偏好社交活动，需要人际交往能力。' },
        'E': { name: '企业型', icon: '💼', desc: '喜欢领导、说服和影响他人。偏好商业活动，需要领导能力和说服力。' },
        'C': { name: '常规型', icon: '📊', desc: '喜欢有秩序、结构化的工作。偏好文职和数据处理，需要组织和细节能力。' }
    },

    init() {
        this.bindEvents();
        this.isFromSettings = false;
        // 初始化完成状态指示器
        this.updateCompletionIndicator();
    },

    bindEvents() {
        // 测试选择按钮
        document.querySelectorAll('.test-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const testType = btn.dataset.test;
                const choice = btn.dataset.choice;
                this.handleTestSelection(testType, choice);
            });
        });

        // 确认MBTI选择
        const confirmMBTIBtn = $('#confirmMBTIBtn');
        if (confirmMBTIBtn) {
            confirmMBTIBtn.addEventListener('click', () => this.confirmMBTISelection());
        }

        // 确认霍兰德选择
        const confirmHollandBtn = $('#confirmHollandBtn');
        if (confirmHollandBtn) {
            confirmHollandBtn.addEventListener('click', () => this.confirmHollandSelection());
        }

        // 跳过准入流程
        const skipBtn = $('#skipOnboardingBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipOnboarding());
        }

        // 下一步按钮
        const nextBtn = $('#nextOnboardingBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextOnboarding());
        }

        // MBTI测试返回
        const backFromMBTITest = $('#backFromMBTITest');
        if (backFromMBTITest) {
            backFromMBTITest.addEventListener('click', () => this.backToOnboarding('mbti'));
        }

        // 霍兰德测试返回
        const backFromHollandTest = $('#backFromHollandTest');
        if (backFromHollandTest) {
            backFromHollandTest.addEventListener('click', () => this.backToOnboarding('holland'));
        }
    },

    handleTestSelection(testType, choice) {
        if (choice === 'known') {
            // 显示快速选择面板
            if (testType === 'mbti') {
                const quickSelect = $('#mbtiQuickSelect');
                const optionsDiv = document.querySelector('#mbtiSelectionCard .test-options');
                optionsDiv.classList.add('hidden');
                quickSelect.classList.remove('hidden');
            } else if (testType === 'holland') {
                const quickSelect = $('#hollandQuickSelect');
                const optionsDiv = document.querySelector('#hollandSelectionCard .test-options');
                optionsDiv.classList.add('hidden');
                quickSelect.classList.remove('hidden');
            }
        } else if (choice === 'unknown') {
            // 开始测试
            if (testType === 'mbti') {
                this.startMBTITest();
            } else if (testType === 'holland') {
                this.startHollandTest();
            }
        }
    },

    confirmMBTISelection() {
        const select = $('#mbtiTypeSelect');
        const value = select.value;
        
        if (!value) {
            alert('请选择您的MBTI类型');
            return;
        }

        // 临时保存MBTI结果到localStorage
        localStorage.setItem('tempMbti', value);
        localStorage.setItem('tempMbtiCompleted', 'true');
        
        // 更新完成状态指示器
        this.updateCompletionIndicator();
        
        // 显示提示
        alert('MBTI类型已临时保存');
    },

    confirmHollandSelection() {
        const select = $('#hollandTypeSelect');
        const value = select.value;
        
        if (!value) {
            alert('请选择您的霍兰德类型');
            return;
        }

        // 临时保存霍兰德结果到localStorage
        localStorage.setItem('tempHolland', value);
        localStorage.setItem('tempHollandCompleted', 'true');
        
        // 更新完成状态指示器
        this.updateCompletionIndicator();
        
        // 显示提示
        alert('霍兰德类型已临时保存');
    },

    startMBTITest() {
        this.currentTest = 'mbti';
        this.currentQuestion = 0;
        this.answers = {};
        // 检查是否从设置页面调用
        this.isFromSettings = App.currentPage === 'settings';
        
        App.showPage('mbtiTest');
        this.renderMBTIQuestion();
    },

    startHollandTest() {
        this.currentTest = 'holland';
        this.currentQuestion = 0;
        this.answers = {};
        // 检查是否从设置页面调用
        this.isFromSettings = App.currentPage === 'settings';
        
        App.showPage('hollandTest');
        this.renderHollandQuestion();
    },

    renderMBTIQuestion() {
        const container = $('#mbtiQuestionsContainer');
        if (!container) return;

        const question = this.mbtiQuestions[this.currentQuestion];
        const total = this.mbtiQuestions.length;

        // 更新进度
        $('#mbtiCurrentQ').textContent = this.currentQuestion + 1;
        $('#mbtiTotalQ').textContent = total;
        $('#mbtiProgressFill').style.width = `${((this.currentQuestion + 1) / total) * 100}%`;

        // 渲染问题 - 优化排版
        container.innerHTML = `
            <div class="test-question">
                <div class="question-number">问题 ${this.currentQuestion + 1} / ${total}</div>
                <div class="question-text">${question.question}</div>
                <div class="answer-options">
                    ${question.options.map((opt, idx) => `
                        <div class="answer-option ${this.answers[this.currentQuestion] === idx ? 'selected' : ''}" data-index="${idx}">
                            <div class="option-radio"></div>
                            <div class="option-content">
                                <div class="option-label">${opt.label}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="test-navigation">
                ${this.currentQuestion > 0 ? '<button class="nav-btn prev" id="mbtiPrevBtn">← 上一题</button>' : '<div></div>'}
                <button class="nav-btn next" id="mbtiNextBtn" ${this.answers[this.currentQuestion] === undefined ? 'disabled' : ''}>
                    ${this.currentQuestion === total - 1 ? '查看结果 →' : '下一题 →'}
                </button>
            </div>
        `;

        // 绑定答案选择事件
        container.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', () => {
                const idx = parseInt(option.dataset.index);
                this.selectMBTIAnswer(idx);
            });
        });

        // 绑定导航按钮
        const prevBtn = $('#mbtiPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevMBTIQuestion());
        }

        const nextBtn = $('#mbtiNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextMBTIQuestion());
        }
    },

    selectMBTIAnswer(index) {
        this.answers[this.currentQuestion] = index;
        
        // 更新UI
        const container = $('#mbtiQuestionsContainer');
        container.querySelectorAll('.answer-option').forEach((opt, idx) => {
            opt.classList.toggle('selected', idx === index);
        });

        // 启用下一题按钮
        const nextBtn = $('#mbtiNextBtn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    },

    prevMBTIQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderMBTIQuestion();
        }
    },

    nextMBTIQuestion() {
        if (this.currentQuestion < this.mbtiQuestions.length - 1) {
            this.currentQuestion++;
            this.renderMBTIQuestion();
        } else {
            // 完成测试，显示结果
            this.showMBTIResult();
        }
    },

    showMBTIResult() {
        // 计算MBTI结果
        const result = this.calculateMBTI();
        
        const container = $('#mbtiQuestionsContainer');
        const typeInfo = this.mbtiTypes[result];

        container.innerHTML = `
            <div class="test-result">
                <div class="result-icon">${typeInfo.icon}</div>
                <div class="result-type">${result}</div>
                <div class="result-name">${typeInfo.name}</div>
                <div class="result-desc">${typeInfo.desc}</div>
                <button class="save-result-btn" id="saveMBTIResultBtn">保存结果</button>
            </div>
        `;

        // 绑定保存按钮
        const saveBtn = $('#saveMBTIResultBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveMBTIResult(result);
                this.markTestComplete('mbti');
                if (this.isFromSettings) {
                    App.closeModal();
                    App.showPage('settings');
                    SettingsModule.updateSettingsDisplay();
                    Helpers.showToast('MBTI结果已更新', 'success');
                } else {
                    this.checkAndProceed();
                }
            });
        }
    },

    calculateMBTI() {
        const counts = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
        
        this.mbtiQuestions.forEach((q, idx) => {
            const answerIndex = this.answers[idx];
            if (answerIndex !== undefined) {
                const value = q.options[answerIndex].value;
                counts[value]++;
            }
        });

        let result = '';
        result += counts.E >= counts.I ? 'E' : 'I';
        result += counts.S >= counts.N ? 'S' : 'N';
        result += counts.T >= counts.F ? 'T' : 'F';
        result += counts.J >= counts.P ? 'J' : 'P';

        return result;
    },

    saveMBTIResult(result) {
        const userConfig = Storage.getUserConfig();
        userConfig.mbti = result;
        Storage.setUserConfig(userConfig);
    },

    renderHollandQuestion() {
        const container = $('#hollandQuestionsContainer');
        if (!container) return;

        const question = this.hollandQuestions[this.currentQuestion];
        const total = this.hollandQuestions.length;

        // 更新进度
        $('#hollandCurrentQ').textContent = this.currentQuestion + 1;
        $('#hollandTotalQ').textContent = total;
        $('#hollandProgressFill').style.width = `${((this.currentQuestion + 1) / total) * 100}%`;

        // 渲染问题 - 优化排版
        container.innerHTML = `
            <div class="test-question">
                <div class="question-number">问题 ${this.currentQuestion + 1} / ${total}</div>
                <div class="question-text">${question.question}</div>
                <div class="answer-options holland-scale">
                    ${question.options.map((opt, idx) => `
                        <div class="answer-option holland-option ${this.answers[this.currentQuestion] === opt.value ? 'selected' : ''}" data-value="${opt.value}">
                            <div class="option-radio"></div>
                            <div class="option-content">
                                <div class="option-label">${opt.label}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="test-navigation">
                ${this.currentQuestion > 0 ? '<button class="nav-btn prev" id="hollandPrevBtn">← 上一题</button>' : '<div></div>'}
                <button class="nav-btn next" id="hollandNextBtn" ${this.answers[this.currentQuestion] === undefined ? 'disabled' : ''}>
                    ${this.currentQuestion === total - 1 ? '查看结果 →' : '下一题 →'}
                </button>
            </div>
        `;

        // 绑定答案选择事件
        container.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', () => {
                const value = parseInt(option.dataset.value);
                this.selectHollandAnswer(value);
            });
        });

        // 绑定导航按钮
        const prevBtn = $('#hollandPrevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevHollandQuestion());
        }

        const nextBtn = $('#hollandNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextHollandQuestion());
        }
    },

    selectHollandAnswer(value) {
        this.answers[this.currentQuestion] = value;
        
        // 更新UI
        const container = $('#hollandQuestionsContainer');
        container.querySelectorAll('.answer-option').forEach(opt => {
            const optValue = parseInt(opt.dataset.value);
            opt.classList.toggle('selected', optValue === value);
        });

        // 启用下一题按钮
        const nextBtn = $('#hollandNextBtn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    },

    prevHollandQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderHollandQuestion();
        }
    },

    nextHollandQuestion() {
        if (this.currentQuestion < this.hollandQuestions.length - 1) {
            this.currentQuestion++;
            this.renderHollandQuestion();
        } else {
            // 完成测试，显示结果
            this.showHollandResult();
        }
    },

    showHollandResult() {
        // 计算霍兰德结果
        const result = this.calculateHolland();
        
        const container = $('#hollandQuestionsContainer');
        const typeInfo = this.hollandTypes[result];

        container.innerHTML = `
            <div class="test-result">
                <div class="result-icon">${typeInfo.icon}</div>
                <div class="result-type">${result}</div>
                <div class="result-name">${typeInfo.name}</div>
                <div class="result-desc">${typeInfo.desc}</div>
                <button class="save-result-btn" id="saveHollandResultBtn">保存结果</button>
            </div>
        `;

        // 绑定保存按钮
        const saveBtn = $('#saveHollandResultBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveHollandResult(result);
                this.markTestComplete('holland');
                if (this.isFromSettings) {
                    App.closeModal();
                    App.showPage('settings');
                    SettingsModule.updateSettingsDisplay();
                    Helpers.showToast('霍兰德结果已更新', 'success');
                } else {
                    this.checkAndProceed();
                }
            });
        }
    },

    calculateHolland() {
        const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
        
        this.hollandQuestions.forEach((q, idx) => {
            const answerValue = this.answers[idx];
            if (answerValue !== undefined) {
                counts[q.dimension] += answerValue;
            }
        });

        // 找出得分最高的三个维度
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return sorted[0][0] + sorted[1][0] + sorted[2][0];
    },

    saveHollandResult(result) {
        const userConfig = Storage.getUserConfig();
        userConfig.holland = result;
        Storage.setUserConfig(userConfig);
    },

    markTestComplete(testType) {
        const userConfig = Storage.getUserConfig();
        userConfig[`${testType}Completed`] = true;
        Storage.setUserConfig(userConfig);
        // 更新完成状态指示器
        this.updateCompletionIndicator();
        // 移除自动跳转，让调用者决定后续流程
    },

    updateCompletionIndicator() {
        // 从localStorage读取临时保存的状态
        const mbtiCompleted = localStorage.getItem('tempMbtiCompleted') === 'true';
        const hollandCompleted = localStorage.getItem('tempHollandCompleted') === 'true';
        const mbtiIcon = $('#mbtiIcon');
        const hollandIcon = $('#hollandIcon');
        const doneIcon = $('#doneIcon');

        if (mbtiIcon) {
            mbtiIcon.textContent = mbtiCompleted ? '✓' : '○';
            mbtiIcon.classList.toggle('completed', mbtiCompleted);
        }
        
        if (hollandIcon) {
            hollandIcon.textContent = hollandCompleted ? '✓' : '○';
            hollandIcon.classList.toggle('completed', hollandCompleted);
        }
        
        if (doneIcon) {
            const allCompleted = mbtiCompleted || hollandCompleted;
            doneIcon.textContent = allCompleted ? '✓' : '○';
            doneIcon.classList.toggle('completed', allCompleted);
        }
    },

    backToOnboarding(testType) {
        if (this.isFromSettings) {
            // 从设置页面调用，返回设置页面
            App.showPage('settings');
        } else {
            // 从准入页面调用，返回准入页面
            App.showPage('onboarding');
            
            // 重置测试选择面板
            if (testType === 'mbti') {
                const quickSelect = $('#mbtiQuickSelect');
                const optionsDiv = document.querySelector('#mbtiSelectionCard .test-options');
                if (quickSelect) quickSelect.classList.add('hidden');
                if (optionsDiv) optionsDiv.classList.remove('hidden');
            } else if (testType === 'holland') {
                const quickSelect = $('#hollandQuickSelect');
                const optionsDiv = document.querySelector('#hollandSelectionCard .test-options');
                if (quickSelect) quickSelect.classList.add('hidden');
                if (optionsDiv) optionsDiv.classList.remove('hidden');
            }
        }
    },

    checkAndProceed() {
        const userConfig = Storage.getUserConfig();
        
        // 检查两个测试是否都完成
        const mbtiCompleted = userConfig.mbtiCompleted;
        const hollandCompleted = userConfig.hollandCompleted;

        if (mbtiCompleted && hollandCompleted) {
            // 两个测试都完成，进入主页
            this.enterMainApp();
        } else if (!mbtiCompleted) {
            // 提示继续MBTI测试
            App.showModal('温馨提示', '<p style="text-align: center;">请继续完成<span style="color: var(--primary);">MBTI性格测试</span>，帮助我们更好地了解你~</p>', [
                { text: '稍后再说', action: () => this.skipOnboarding() },
                { text: '继续测试', action: () => this.startMBTITest() }
            ]);
        } else if (!hollandCompleted) {
            // 提示继续霍兰德测试
            App.showModal('温馨提示', '<p style="text-align: center;">请继续完成<span style="color: var(--primary);">霍兰德职业测试</span>，发现你的职业兴趣~</p>', [
                { text: '稍后再说', action: () => this.skipOnboarding() },
                { text: '继续测试', action: () => this.startHollandTest() }
            ]);
        }
    },

    skipOnboarding() {
        // 不保存任何临时数据，清除临时记录
        localStorage.removeItem('tempMbti');
        localStorage.removeItem('tempHolland');
        localStorage.removeItem('tempMbtiCompleted');
        localStorage.removeItem('tempHollandCompleted');
        
        // 仅标记登录状态完成
        localStorage.setItem('hasCompletedSetup', 'true');
        localStorage.setItem('setupSkipped', 'true');

        // 直接跳转到主界面
        window.location.href = 'main.html';
    },

    nextOnboarding() {
        // 读取已临时保存的数据
        const tempMbti = localStorage.getItem('tempMbti');
        const tempHolland = localStorage.getItem('tempHolland');
        const mbtiCompleted = localStorage.getItem('tempMbtiCompleted') === 'true';
        const hollandCompleted = localStorage.getItem('tempHollandCompleted') === 'true';

        // 检查是否有临时保存的数据
        if (!mbtiCompleted && !hollandCompleted) {
            alert('请至少选择一个类型后再点击下一步');
            return;
        }

        // 正式保存数据到Storage
        const userConfig = Storage.getUserConfig();
        if (tempMbti) {
            userConfig.mbti = tempMbti;
            userConfig.mbtiCompleted = true;
        }
        if (tempHolland) {
            userConfig.holland = tempHolland;
            userConfig.hollandCompleted = true;
        }
        userConfig.onboardingCompleted = true;
        Storage.setUserConfig(userConfig);

        // 标记登录状态完成，并标记不是跳过的
        localStorage.setItem('hasCompletedSetup', 'true');
        localStorage.setItem('setupSkipped', 'false');
        
        // 正式保存到localStorage供其他页面使用
        if (tempMbti) {
            localStorage.setItem('userMbti', tempMbti);
        }
        if (tempHolland) {
            localStorage.setItem('userHolland', tempHolland);
        }
        
        // 清除临时数据
        localStorage.removeItem('tempMbti');
        localStorage.removeItem('tempHolland');
        localStorage.removeItem('tempMbtiCompleted');
        localStorage.removeItem('tempHollandCompleted');

        // 跳转到主界面
        window.location.href = 'main.html';
    },

    enterMainApp() {
        try {
            console.log('进入主应用');
            // 标记准入流程已完成
            const userConfig = Storage.getUserConfig();
            userConfig.onboardingCompleted = true;
            Storage.setUserConfig(userConfig);

            // 设置 localStorage 标记，表示已完成引导设置
            localStorage.setItem('hasCompletedSetup', 'true');
            
            // 将用户的 MBTI 和霍兰德类型也存入 localStorage
            if (userConfig.mbti) {
                localStorage.setItem('userMbti', userConfig.mbti);
            }
            if (userConfig.holland) {
                localStorage.setItem('userHolland', userConfig.holland);
            }

            console.log('已保存完成状态，准备跳转');
            // 直接跳转到主界面
            window.location.href = 'main.html';
        } catch (error) {
            console.error('进入主应用失败:', error);
            // 出错时也尝试跳转
            try {
                localStorage.setItem('hasCompletedSetup', 'true');
                window.location.href = 'main.html';
            } catch (e) {
                console.error('跳转失败:', e);
            }
        }
    },

    shouldShowOnboarding() {
        const userConfig = Storage.getUserConfig();
        return !userConfig.onboardingCompleted;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    TestModule.init();
});
