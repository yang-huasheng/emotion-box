const EMOTIONS = [
    // 正向情绪
    {
        id: 'happy',
        name: '愉悦',
        emoji: '😊',
        color: '#FFD93D',
        category: 'positive',
        description: '心情舒畅，充满阳光',
        psychology: '多巴胺分泌增加，身心愉悦'
    },
    {
        id: 'excited',
        name: '惊喜',
        emoji: '🤩',
        color: '#FF9F43',
        category: 'positive',
        description: '意外之喜，满心欢喜',
        psychology: '肾上腺素飙升，充满活力'
    },
    {
        id: 'touched',
        name: '感动',
        emoji: '🥰',
        color: '#FFB5C2',
        category: 'positive',
        description: '温暖心房，充满感激',
        psychology: '催产素释放，感受到爱与连接'
    },
    {
        id: 'grateful',
        name: '感恩',
        emoji: '🙏',
        color: '#98D4BB',
        category: 'positive',
        description: '心怀感激，珍惜拥有',
        psychology: '提升幸福感和生活满意度'
    },
    {
        id: 'hopeful',
        name: '期待',
        emoji: '🌟',
        color: '#A8D8EA',
        category: 'positive',
        description: '满怀希望，憧憬未来',
        psychology: '增强动力和积极心态'
    },
    // 中性情绪
    {
        id: 'calm',
        name: '平静',
        emoji: '😌',
        color: '#6EC6FF',
        category: 'neutral',
        description: '内心宁静，平和自在',
        psychology: '身心放松，处于稳态'
    },
    {
        id: 'peaceful',
        name: '平淡',
        emoji: '😐',
        color: '#B8D4E8',
        category: 'neutral',
        description: '心如止水，不喜不悲',
        psychology: '情绪稳定，内心平和'
    },
    {
        id: 'lazy',
        name: '慵懒',
        emoji: '😴',
        color: '#C4B7D6',
        category: 'neutral',
        description: '悠闲放松，不想动弹',
        psychology: '能量较低，需要休息'
    },
    {
        id: 'focused',
        name: '专注',
        emoji: '🎯',
        color: '#8EBDD4',
        category: 'neutral',
        description: '全神贯注，心无旁骛',
        psychology: '进入心流状态'
    },
    {
        id: 'nostalgic',
        name: '怀念',
        emoji: '💭',
        color: '#D4C4E0',
        category: 'neutral',
        description: '追忆往昔，思绪万千',
        psychology: '情感回忆，自我反思'
    },
    // 负面情绪
    {
        id: 'sad',
        name: '悲伤',
        emoji: '😢',
        color: '#8EBDD4',
        category: 'negative',
        description: '有些失落，需要安慰',
        psychology: '情绪低落，需要倾诉'
    },
    {
        id: 'anxious',
        name: '焦虑',
        emoji: '😨',
        color: '#D4A574',
        category: 'negative',
        description: '心神不宁，思绪纷乱',
        psychology: '压力激素升高，紧张不安'
    },
    {
        id: 'angry',
        name: '愤怒',
        emoji: '😠',
        color: '#E8A0A0',
        category: 'negative',
        description: '情绪激动，难以平静',
        psychology: '皮质醇升高，需要冷静'
    },
    {
        id: 'tired',
        name: '疲惫',
        emoji: '😫',
        color: '#B8D4E8',
        category: 'negative',
        description: '身心俱疲，需要休息',
        psychology: '精力耗尽，需要恢复'
    },
    {
        id: 'confused',
        name: '茫然',
        emoji: '😕',
        color: '#C4A2D4',
        category: 'negative',
        description: '迷茫不解，需要指引',
        psychology: '认知困惑，需要理清思路'
    },
    {
        id: 'irritated',
        name: '烦躁',
        emoji: '😤',
        color: '#F5B041',
        category: 'negative',
        description: '心烦意乱，容易发火',
        psychology: '情绪易激惹，需要平静'
    },
    {
        id: 'lonely',
        name: '孤独',
        emoji: '🥺',
        color: '#9B8AC9',
        category: 'negative',
        description: '形单影只，渴望陪伴',
        psychology: '社交需求未满足'
    },
    {
        id: 'overwhelmed',
        name: '压力',
        emoji: '😩',
        color: '#D49595',
        category: 'negative',
        description: '压力山大，不堪重负',
        psychology: '超出心理承受能力'
    }
];

const EMOTION_CATEGORIES = [
    {
        id: 'positive',
        name: '正向情绪',
        emoji: '☀️',
        color: '#FFD93D',
        description: '带来能量和愉悦的情绪'
    },
    {
        id: 'neutral',
        name: '中性情绪',
        emoji: '🌤️',
        color: '#6EC6FF',
        description: '平静稳定的中间状态'
    },
    {
        id: 'negative',
        name: '负面情绪',
        emoji: '🌧️',
        color: '#C4A2D4',
        description: '需要关注和疏导的情绪'
    }
];

const EMOTION_INTENSITY_LABELS = [
    '一点点',
    '有些',
    '中等',
    '比较强烈',
    '非常强烈'
];

const AI_RESPONSES = {
    anxiety: [
        '我理解你现在的焦虑感。深呼吸，让我们一起慢慢来。',
        '焦虑是很常见的情绪。你愿意和我聊聊是什么让你感到不安吗？',
        '听起来你正在经历一些困难。记住，你不是一个人，我在这里陪着你。'
    ],
    sad: [
        '悲伤的时候，允许自己感受这些情绪是很重要的。',
        '我在这里倾听你。如果想说出来，我随时愿意陪伴。',
        '低落的时候，记得对自己温柔一点。这段困难时期会过去的。'
    ],
    happy: [
        '真的很高兴听到你开心的消息！愿意和我分享是什么让你这么快乐吗？',
        '生活中的小美好值得被珍藏！你的笑容也感染到了我呢。',
        '快乐是会传染的，谢谢你和我分享这份喜悦！'
    ],
    sleep: [
        '让我来帮你放松。闭上眼睛，慢慢地深吸一口气...',
        '睡前的放松很重要。让我为你读一段温柔的文字...',
        '想象你正躺在一片柔软的云朵上，温暖而安心...'
    ]
};

const MBTI_QUESTIONS = [
    {
        question: '在社交场合中，你通常会？',
        options: [
            { text: '主动和陌生人交谈', type: 'E' },
            { text: '等待别人来接近你', type: 'I' }
        ]
    },
    {
        question: '你更倾向于？',
        options: [
            { text: '关注具体的事实和细节', type: 'S' },
            { text: '思考可能性和未来', type: 'N' }
        ]
    },
    {
        question: '做决定时，你更看重？',
        options: [
            { text: '逻辑和客观因素', type: 'T' },
            { text: '对他人的影响', type: 'F' }
        ]
    },
    {
        question: '你更喜欢？',
        options: [
            { text: '有计划地生活', type: 'J' },
            { text: '随遇而安、灵活应变', type: 'P' }
        ]
    }
];

const MBTI_TYPES = {
    'ISTJ': { name: '检查者', description: '安静、严肃，通过全情投入和责任心获得信任', colors: ['#6EC6FF', '#7C9ACC'] },
    'ISFJ': { name: '守护者', description: '安静、友好，有强烈的责任感和忠诚度', colors: ['#98D4BB', '#FFB5C2'] },
    'INFJ': { name: '倡导者', description: '独立，具有强烈的洞察力和理想主义', colors: ['#C4A2D4', '#7C9ACC'] },
    'INTJ': { name: '建筑师', description: '具有战略思维，理性且独立', colors: ['#6EC6FF', '#C4A2D4'] },
    'ISTP': { name: '鉴赏家', description: '大胆实用，擅长发现问题和解决难题', colors: ['#8EBDD4', '#6EC6FF'] },
    'ISFP': { name: '探险家', description: '灵活有魅力，热爱自由和美感', colors: ['#FFB5C2', '#98D4BB'] },
    'INFP': { name: '调停者', description: '理想主义，善良且有创造力', colors: ['#C4A2D4', '#FFB5C2'] },
    'INTP': { name: '逻辑学家', description: '创新者，热爱知识和逻辑推理', colors: ['#6EC6FF', '#C4A2D4'] },
    'ESTP': { name: '企业家', description: '精力充沛，善于发现问题和即时行动', colors: ['#FFB366', '#FFD93D'] },
    'ESFP': { name: '表演者', description: '自发、热情，喜欢享受生活中的每一刻', colors: ['#FFD93D', '#FFB5C2'] },
    'ENFP': { name: '竞选者', description: '热情有创意，社交能力强', colors: ['#FFB366', '#C4A2D4'] },
    'ENTP': { name: '辩论家', description: '聪明好奇，善于发现可能性', colors: ['#FFD93D', '#6EC6FF'] },
    'ESTJ': { name: '总经理', description: '务实高效，善于组织和决策', colors: ['#FFB366', '#8EBDD4'] },
    'ESFJ': { name: '提供者', description: '友好热情，重视和谐与合作', colors: ['#FFB5C2', '#FFB366'] },
    'ENFJ': { name: '主人公', description: '魅力非凡，激励他人成为更好的自己', colors: ['#C4A2D4', '#FFB366'] },
    'ENTJ': { name: '指挥官', description: '大胆果断，天生的领导者', colors: ['#6EC6FF', '#FFB366'] }
};

const ENCOURAGEMENT_MESSAGES = [
    '今天也很勇敢呢，继续加油！',
    '你今天比昨天又进步了一点点哦~',
    '记录本身就是一种疗愈，你做得很好',
    '每一个情绪都值得被看见，包括今天的你',
    '今天的你，已经很棒了！'
];

function getEmotionById(id) {
    return EMOTIONS.find(e => e.id === id) || EMOTIONS[0];
}

function getEmotionColor(id) {
    const emotion = getEmotionById(id);
    return emotion ? emotion.color : '#7C9ACC';
}

function getRandomAIResponse(topic) {
    const responses = AI_RESPONSES[topic] || AI_RESPONSES.anxiety;
    return responses[Math.floor(Math.random() * responses.length)];
}

function getMBTIType(type) {
    return MBTI_TYPES[type] || null;
}

const HOGWARTS_HOUSES = {
    GRYFFINDOR: {
        name: '格兰芬多',
        emoji: '🦁',
        color: '#DC143C',
        traits: ['勇敢', '勇敢无畏', '冒险精神', '正义感', '勇气'],
        description: '你是真正的勇者，拥有炽热的心和无畏的精神。你敢于面对恐惧，为正义而战。'
    },
    SLYTHERIN: {
        name: '斯莱特林',
        emoji: '🐍',
        color: '#228B22',
        traits: ['精明', '野心勃勃', '机智', '领导力', '决心'],
        description: '你是天生的领导者，聪明且富有策略。你知道如何实现自己的目标，从不畏惧挑战。'
    },
    RAVENCLAW: {
        name: '拉文克劳',
        emoji: '🦅',
        color: '#1E90FF',
        traits: ['智慧', '创造力', '好奇心', '博学', '独立思考'],
        description: '你是智慧的化身，对知识有着无尽的渴求。你的好奇心驱使你探索世界的奥秘。'
    },
    HUFFLEPUFF: {
        name: '赫奇帕奇',
        emoji: '🦡',
        color: '#FFD700',
        traits: ['忠诚', '善良', '勤劳', '公正', '耐心'],
        description: '你是善良的守护者，忠诚可靠。你的真诚和善良让周围的人感到温暖和安心。'
    }
};

const HOGWARTS_QUESTIONS = [
    {
        question: '你最看重什么品质？',
        options: [
            { text: '勇气和冒险精神', house: 'GRYFFINDOR' },
            { text: '智慧和创造力', house: 'RAVENCLAW' },
            { text: '忠诚和善良', house: 'HUFFLEPUFF' },
            { text: '野心和策略', house: 'SLYTHERIN' }
        ]
    },
    {
        question: '面对挑战时，你通常会？',
        options: [
            { text: '直接冲上去解决', house: 'GRYFFINDOR' },
            { text: '分析问题找到最佳方案', house: 'RAVENCLAW' },
            { text: '寻求朋友的帮助', house: 'HUFFLEPUFF' },
            { text: '利用现有资源达成目标', house: 'SLYTHERIN' }
        ]
    },
    {
        question: '你更喜欢什么样的环境？',
        options: [
            { text: '充满活力和挑战', house: 'GRYFFINDOR' },
            { text: '安静的图书馆或书房', house: 'RAVENCLAW' },
            { text: '温馨的家庭氛围', house: 'HUFFLEPUFF' },
            { text: '权力和影响力的中心', house: 'SLYTHERIN' }
        ]
    },
    {
        question: '朋友遇到困难时，你会？',
        options: [
            { text: '挺身而出保护他们', house: 'GRYFFINDOR' },
            { text: '提供智慧的建议', house: 'RAVENCLAW' },
            { text: '默默支持和陪伴', house: 'HUFFLEPUFF' },
            { text: '帮助他们找到解决办法', house: 'SLYTHERIN' }
        ]
    },
    {
        question: '你最擅长什么？',
        options: [
            { text: '鼓舞人心', house: 'GRYFFINDOR' },
            { text: '分析和创新', house: 'RAVENCLAW' },
            { text: '倾听和理解', house: 'HUFFLEPUFF' },
            { text: '计划和执行', house: 'SLYTHERIN' }
        ]
    }
];

function getHogwartsHouse(houseId) {
    return HOGWARTS_HOUSES[houseId] || null;
}

// 霍兰德职业类型定义
const HOLLAND_TYPES = {
    'R': { name: '现实型', icon: '🔧', desc: '喜欢动手操作、户外活动和具体实践。偏好有形的工作，需要技能和体力。', careers: ['工程师', '机械师', '运动员', '厨师', '军人'] },
    'I': { name: '研究型', icon: '🔬', desc: '喜欢研究、分析和解决复杂问题。偏好科学和学术活动，需要智识和好奇心。', careers: ['科学家', '医生', '教授', '研究员', '分析师'] },
    'A': { name: '艺术型', icon: '🎨', desc: '喜欢创造性和自我表达。偏好艺术活动，需要想象力和创造力。', careers: ['艺术家', '设计师', '作家', '音乐家', '摄影师'] },
    'S': { name: '社会型', icon: '🤝', desc: '喜欢帮助、教育和支持他人。偏好社交活动，需要人际交往能力。', careers: ['教师', '心理咨询师', '护士', '社工', 'HR'] },
    'E': { name: '企业型', icon: '💼', desc: '喜欢领导、说服和影响他人。偏好商业活动，需要领导能力和说服力。', careers: ['企业家', '经理', '律师', '销售', '政治家'] },
    'C': { name: '常规型', icon: '📊', desc: '喜欢有秩序、结构化的工作。偏好文职和数据处理，需要组织和细节能力。', careers: ['会计', '银行职员', '行政', '文员', '审计师'] }
};

function getHollandType(typeCode) {
    if (!typeCode || typeCode.length < 3) return null;
    const primary = typeCode[0];
    return HOLLAND_TYPES[primary] || null;
}
