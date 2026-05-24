const AIModule = {
    isTyping: false,
    currentTopic: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const openAIBtn = $('#openAIBtn');
        if (openAIBtn) {
            openAIBtn.addEventListener('click', () => App.navigateTo('ai'));
        }

        const backFromAI = $('#backFromAI');
        if (backFromAI) {
            backFromAI.addEventListener('click', () => App.navigateTo('home'));
        }

        const chatInput = $('#chatInput');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                this.handleInputChange();
                this.autoResizeTextarea(chatInput);
            });

            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        const sendBtn = $('#sendMessageBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        const chatWelcome = $('#chatWelcome');
        if (chatWelcome) {
            const chips = Helpers.$$('.chip', chatWelcome);
            chips.forEach(chip => {
                chip.addEventListener('click', () => {
                    this.selectTopic(chip.dataset.topic);
                });
            });
        }
    },

    autoResizeTextarea(textarea) {
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    },

    handleInputChange() {
        const chatInput = $('#chatInput');
        const sendBtn = $('#sendMessageBtn');

        if (sendBtn) {
            sendBtn.disabled = !chatInput?.value?.trim() || this.isTyping;
        }
    },

    selectTopic(topic) {
        this.currentTopic = topic;

        const chipTexts = {
            anxiety: '最近感到焦虑',
            sad: '心情有些低落',
            happy: '想要分享开心的事',
            sleep: '帮助我放松入睡'
        };

        const chatInput = $('#chatInput');
        if (chatInput) {
            chatInput.value = chipTexts[topic] || '';
            this.handleInputChange();
        }

        const initialResponse = this.getInitialResponse(topic);
        this.showInitialMessage(initialResponse);

        setTimeout(() => {
            const chatWelcome = $('#chatWelcome');
            const chatMessages = $('#chatMessages');
            if (chatWelcome) chatWelcome.classList.add('hidden');
            if (chatMessages) chatMessages.classList.remove('hidden');
        }, 100);
    },

    getInitialResponse(topic) {
        const userConfig = Storage.getUserConfig();
        const personalityStyle = this.getPersonalityStyle(userConfig);
        
        const responses = {
            anxiety: {
                emoji: '🤗',
                messages: {
                    introvert: '我听到你说最近有些焦虑。这种感觉一定让你感到很疲惫吧。让我们找一个安静的角落，慢慢聊聊，好吗？',
                    extrovert: '嘿，我在这儿！焦虑确实会让人感到压力，但我们可以一起面对它！深呼吸，我们一步一步来解决～',
                    thinking: '焦虑通常源于对未来的不确定性。让我们一起分析一下：是什么具体的事情让你感到焦虑？我们可以把它分解成小问题来处理。',
                    feeling: '我能感受到你的不安... 焦虑的时候，记得给自己一些温柔。你已经做得很好了，不要对自己太苛刻。',
                    ravenclaw: '焦虑往往是因为我们的思维在高速运转。让我们用理性的思维来梳理一下，找出问题的根源，然后找到解决方案。',
                    hufflepuff: '没关系的，无论你现在感觉如何，我都在这里陪着你。我们可以一起慢慢度过这段时间。',
                    gryffindor: '勇敢面对焦虑是第一步！你已经很勇敢了，因为你选择了面对而不是逃避。让我们一起找到克服它的方法！',
                    slytherin: '焦虑是一种信号，提醒我们需要关注某些事情。让我们冷静地分析现状，找到最有效的应对策略。'
                }
            },
            sad: {
                emoji: '💙',
                messages: {
                    introvert: '低落的时候真的很不容易。谢谢你愿意告诉我。你的感受是完全被理解的，我会一直在这里默默陪伴你。',
                    extrovert: '嘿，看到你难过我也很心疼！不过别担心，我们一起度过这个难关！有什么想聊的都可以告诉我～',
                    thinking: '悲伤是一种自然的情绪反应。让我们理性地看待它：是什么事情引发了这种情绪？我们可以一起找到应对的方法。',
                    feeling: '我能感受到你的难过... 想哭就哭出来吧，释放出来会好很多。你不是一个人在承受这些。',
                    ravenclaw: '悲伤是人类情感的一部分，它在提醒我们某些事情的重要性。让我们一起思考如何从这段经历中成长。',
                    hufflepuff: '亲爱的，无论什么时候，我都在这里给你一个温暖的拥抱。你的感受很重要，我愿意倾听你的每一句话。',
                    gryffindor: '面对悲伤需要很大的勇气，但你已经做到了。相信自己，你有足够的力量度过这段时间！',
                    slytherin: '悲伤是暂时的，它会慢慢过去。让我们冷静地接受它，然后找到重新站起来的方法。'
                }
            },
            happy: {
                emoji: '🌟',
                messages: {
                    introvert: '听到你开心真的太好了！你愿意和我分享这份喜悦吗？我会认真倾听的。',
                    extrovert: '哇哦！太棒了！快和我分享是什么让你这么开心！让我也沾沾你的喜气～',
                    thinking: '快乐是一种积极的反馈，说明你正在做一些对自己有益的事情。继续保持这种状态！',
                    feeling: '看到你开心，我的心情也跟着变好！这份喜悦真的很美好，希望它能一直陪伴着你。',
                    ravenclaw: '快乐源于内心的满足感。让我们一起思考，是什么让你感到快乐？我们可以尝试让这种快乐持续下去。',
                    hufflepuff: '你的快乐就是我的快乐！谢谢你和我分享这份美好，愿这份幸福能一直围绕着你。',
                    gryffindor: '太棒了！你的快乐就是对生活最好的回应！继续保持这份积极的心态，你会创造更多美好的时刻！',
                    slytherin: '快乐是一种宝贵的资源。让我们抓住它，并且学会在生活中持续创造这样的时刻。'
                }
            },
            sleep: {
                emoji: '🌙',
                messages: {
                    introvert: '让我来陪你放松。找一个安静的地方，闭上眼睛，让我们一起进入宁静的状态...',
                    extrovert: '好的，让我们一起放松！跟着我的引导，把一天的疲惫都释放掉，好好休息一下！',
                    thinking: '睡眠是身体和心理恢复的重要过程。让我们用科学的方法来放松：深呼吸、肌肉放松、正念冥想...',
                    feeling: '现在，让我们放下所有的烦恼，给自己一个温柔的夜晚。你值得好好休息。',
                    ravenclaw: '放松需要技巧。让我们一步步来：首先调整呼吸，然后放松身体的每一个部位，最后让思绪平静下来。',
                    hufflepuff: '亲爱的，现在是时候好好照顾自己了。让我陪你度过这段放松的时光，祝你有个好梦。',
                    gryffindor: '放松也是一种勇气，因为它意味着你愿意暂时放下一切。相信自己，你已经做得很好了，现在安心休息吧。',
                    slytherin: '懂得休息的人才能更好地前进。让我们聪明地利用这段时间来恢复精力，为明天做好准备。'
                }
            }
        };

        const topicResponses = responses[topic] || responses.anxiety;
        const styleMessage = topicResponses.messages[personalityStyle] || topicResponses.messages.extrovert;
        
        return { emoji: topicResponses.emoji, message: styleMessage };
    },

    showInitialMessage(response) {
        const chatMessages = $('#chatMessages');
        if (!chatMessages) return;

        this.addMessage('assistant', response.message, response.emoji);
    },

    sendMessage() {
        const chatInput = $('#chatInput');
        const message = chatInput?.value?.trim();

        if (!message || this.isTyping) return;

        this.addMessage('user', message);

        chatInput.value = '';
        this.handleInputChange();
        this.autoResizeTextarea(chatInput);

        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateResponse(message);
            this.addMessage('assistant', response);
        }, 1500 + Math.random() * 1000);
    },

    addMessage(role, content, emoji = null) {
        const chatMessages = $('#chatMessages');
        if (!chatMessages) return;

        chatMessages.classList.remove('hidden');

        const welcome = $('#chatWelcome');
        if (welcome) welcome.classList.add('hidden');

        const messageEl = Helpers.createElement('div', `chat-bubble ${role}`, '');

        if (role === 'assistant' && emoji) {
            messageEl.innerHTML = `<div style="margin-bottom: 8px; font-size: 24px;">${emoji}</div>`;
        }

        if (role === 'assistant') {
            const paragraphs = content.split('\n').filter(p => p.trim());
            paragraphs.forEach(p => {
                messageEl.appendChild(Helpers.createElement('p', '', p));
            });
        } else {
            messageEl.textContent = content;
        }

        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        Storage.saveChatMessage({ role, content });
    },

    showTypingIndicator() {
        const chatMessages = $('#chatMessages');
        if (!chatMessages) return;

        this.isTyping = true;
        this.handleInputChange();

        const indicator = Helpers.createElement('div', 'chat-bubble assistant typing-indicator', '');
        indicator.innerHTML = `
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
        `;

        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    hideTypingIndicator() {
        const indicator = Helpers.$('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }

        this.isTyping = false;
        this.handleInputChange();
    },

    getPersonalityStyle(userConfig) {
        const mbti = userConfig.mbti;
        const hogwartsHouse = userConfig.hogwartsHouse;

        if (hogwartsHouse) {
            switch(hogwartsHouse) {
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

    generateResponse(userMessage) {
        const userConfig = Storage.getUserConfig();
        const style = this.getPersonalityStyle(userConfig);
        const message = userMessage.toLowerCase();

        if (message.includes('焦虑') || message.includes('不安') || message.includes('担心')) {
            return this.getAnxietyResponse(message, style);
        } else if (message.includes('难过') || message.includes('悲伤') || message.includes('伤心')) {
            return this.getSadResponse(message, style);
        } else if (message.includes('开心') || message.includes('快乐') || message.includes('高兴')) {
            return this.getHappyResponse(message, style);
        } else if (message.includes('睡') || message.includes('放松') || message.includes('休息')) {
            return this.getSleepResponse(message, style);
        } else if (message.includes('谢谢') || message.includes('感谢')) {
            return this.getThankYouResponse(style);
        } else if (message.includes('帮助') || message.includes('怎么')) {
            return this.getHelpResponse(message, style);
        } else {
            return this.getDefaultResponse(message, style);
        }
    },

    getAnxietyResponse(message, style) {
        const responses = {
            introvert: [
                '我能感受到你的焦虑...这种感觉像一团乱麻，缠绕在心头，让人难以呼吸。让我们一起慢慢梳理，好吗？',
                '内向的你，或许更愿意独自面对这些情绪。但请记得，我在这里，随时可以倾听你的心声。',
                '焦虑的时候，试着找一个安静的角落，做一些让自己感到平静的事情。比如听听舒缓的音乐，或者写写日记。'
            ],
            extrovert: [
                '嘿！别担心，我们一起面对！焦虑只是暂时的，我们可以把它当成一个挑战来克服！',
                '来，深呼吸！你是一个充满活力的人，这点小焦虑难不倒你的！让我们一起想办法解决它！',
                '焦虑的时候，不如做点让自己开心的事情？和朋友聊聊天，或者做点运动，把压力释放出来！'
            ],
            thinking: [
                '让我们理性地分析一下：你焦虑的具体原因是什么？我们可以把它分解成几个小问题，然后逐一解决。',
                '焦虑通常源于对未来的不确定性。让我们列出可能的结果，然后为每种结果做好应对准备。',
                '从逻辑角度来看，大多数我们担心的事情都不会发生。让我们用数据和事实来缓解这种焦虑。'
            ],
            feeling: [
                '我能感受到你的不安...焦虑的时候，记得对自己温柔一点。你已经做得很好了。',
                '亲爱的，你的感受是真实而重要的。让我们一起接纳这份情绪，然后慢慢让它平静下来。',
                '焦虑是在提醒我们需要关注自己的内心。让我们一起倾听内心的声音，看看它在告诉我们什么。'
            ],
            ravenclaw: [
                '焦虑往往源于思维的过度活跃。让我们用智慧来梳理这些思绪，找到问题的根源。',
                '知识是解决焦虑的良药。让我们一起分析情况，找到最合理的应对方案。',
                '作为拉文克劳，你拥有智慧的头脑。让我们用理性思考来战胜焦虑，找到内心的平静。'
            ],
            hufflepuff: [
                '没关系的，无论你现在感觉如何，我都在这里陪着你。我们可以一起慢慢度过这段时间。',
                '亲爱的，你不是一个人。我会一直在这里，给你温暖和支持。',
                '赫奇帕奇的特质就是包容和温暖。让我用这份温暖来陪伴你度过这段焦虑的时光。'
            ],
            gryffindor: [
                '勇敢面对焦虑是第一步！你已经很勇敢了，因为你选择了面对而不是逃避。',
                '格兰芬多从不畏惧挑战！焦虑只是一个小小的障碍，你有足够的勇气和力量去克服它！',
                '拿出你的勇气来！面对焦虑，战胜它，你会变得更加强大！'
            ],
            slytherin: [
                '焦虑是一种信号，提醒我们需要关注某些事情。让我们冷静地分析现状，找到最有效的应对策略。',
                '作为斯莱特林，你善于找到解决问题的方法。让我们冷静地评估情况，制定一个明智的计划。',
                '焦虑可以转化为动力。让我们把这份不安转化为前进的力量，找到最适合自己的解决方案。'
            ]
        };

        return Helpers.getRandomItem(responses[style] || responses.extrovert);
    },

    getSadResponse(message, style) {
        const responses = {
            introvert: [
                '低落的时候，或许你更愿意安静地待着。没关系，我会在这里默默陪伴你。',
                '悲伤像一片乌云，笼罩着你的内心。但请相信，阳光总会穿透云层，再次照耀你。',
                '内向的你，可能需要更多的时间来消化这些情绪。给自己一些空间，我会一直在这里。'
            ],
            extrovert: [
                '嘿，别难过！生活总有起起落落，这只是暂时的。让我们一起找点开心的事情来做！',
                '悲伤的时候，不如找朋友聊聊天，或者做点喜欢的事情？让快乐重新回到你身边！',
                '你是一个充满活力的人，这点小挫折难不倒你的！让我们一起振作起来！'
            ],
            thinking: [
                '悲伤是一种自然的情绪反应。让我们理性地看待它：是什么事情引发了这种情绪？我们可以一起找到应对的方法。',
                '从心理学角度来看，悲伤是一种信号，提醒我们需要关注某些未被满足的需求。',
                '让我们分析一下：这种悲伤的背后是什么？我们可以采取什么行动来改善现状？'
            ],
            feeling: [
                '我能感受到你的难过...想哭就哭出来吧，释放出来会好很多。',
                '亲爱的，你的感受是真实的，也是被允许的。让我们一起接纳这份情绪，然后慢慢疗愈。',
                '悲伤的时候，记得给自己一个拥抱。你值得被温柔对待。'
            ],
            ravenclaw: [
                '悲伤是人类情感的一部分，它在提醒我们某些事情的重要性。让我们一起思考如何从这段经历中成长。',
                '智慧告诉我们，每一次悲伤都是一次学习和成长的机会。让我们从中汲取力量。',
                '作为拉文克劳，你有能力从悲伤中汲取智慧。让我们一起思考，这段经历教会了我们什么。'
            ],
            hufflepuff: [
                '亲爱的，无论什么时候，我都在这里给你一个温暖的拥抱。你的感受很重要。',
                '赫奇帕奇的温暖会一直陪伴着你。让我用这份包容和关爱来帮助你度过这段难过的时光。',
                '你不是一个人在承受。我会一直在这里，用温暖和支持包围着你。'
            ],
            gryffindor: [
                '面对悲伤需要很大的勇气，但你已经做到了。相信自己，你有足够的力量度过这段时间！',
                '格兰芬多从不害怕面对困难！悲伤只是暂时的，你有足够的勇气去战胜它！',
                '勇敢地面对这份情绪，然后超越它。你会变得更加强大和坚韧！'
            ],
            slytherin: [
                '悲伤是暂时的，它会慢慢过去。让我们冷静地接受它，然后找到重新站起来的方法。',
                '作为斯莱特林，你善于适应和调整。让我们冷静地评估现状，找到最适合自己的恢复方式。',
                '悲伤可以成为成长的动力。让我们把这份情绪转化为前进的力量，变得更加强大。'
            ]
        };

        return Helpers.getRandomItem(responses[style] || responses.extrovert);
    },

    getHappyResponse(message, style) {
        const responses = {
            introvert: [
                '听到你开心真的太好了！你愿意和我分享这份喜悦吗？我会认真倾听的。',
                '你的快乐是如此珍贵。让我们一起珍惜这份美好的感觉。',
                '内向的你，或许更愿意独自享受这份快乐。但我很高兴能和你一起分享这份喜悦。'
            ],
            extrovert: [
                '哇哦！太棒了！快和我分享是什么让你这么开心！让我也沾沾你的喜气～',
                '耶！看到你这么开心我也超级开心！继续保持这份积极的心态！',
                '你的快乐太有感染力了！让我们一起庆祝这份美好！'
            ],
            thinking: [
                '快乐是一种积极的反馈，说明你正在做一些对自己有益的事情。继续保持这种状态！',
                '从心理学角度来看，快乐有助于提升创造力和解决问题的能力。好好享受这份状态！',
                '让我们分析一下：是什么让你感到快乐？我们可以尝试让这种快乐持续下去。'
            ],
            feeling: [
                '看到你开心，我的心情也跟着变好！这份喜悦真的很美好。',
                '你的快乐是如此纯粹和美好。愿这份幸福能一直陪伴着你。',
                '亲爱的，你的笑容是最美丽的风景。继续保持这份美好的心情！'
            ],
            ravenclaw: [
                '快乐源于内心的满足感。让我们一起思考，是什么让你感到快乐？我们可以尝试让这种快乐持续下去。',
                '智慧告诉我们，真正的快乐来自内心的平和与满足。恭喜你找到了属于自己的快乐！',
                '作为拉文克劳，你懂得思考生活的意义。这份快乐是对你智慧的最好回报。'
            ],
            hufflepuff: [
                '你的快乐就是我的快乐！谢谢你和我分享这份美好。',
                '赫奇帕奇的快乐来自于分享和关爱。谢谢你让我感受到这份温暖的喜悦。',
                '愿这份快乐能一直围绕着你，就像阳光一样温暖明亮。'
            ],
            gryffindor: [
                '太棒了！你的快乐就是对生活最好的回应！继续保持这份积极的心态！',
                '格兰芬多的快乐充满了热情和活力！继续用这份热情去拥抱生活！',
                '你的快乐是如此有感染力！继续勇敢地追求更多美好的时刻！'
            ],
            slytherin: [
                '快乐是一种宝贵的资源。让我们抓住它，并且学会在生活中持续创造这样的时刻。',
                '作为斯莱特林，你善于实现自己的目标。这份快乐是对你努力的最好回报。',
                '快乐可以成为前进的动力。让我们用这份积极的心态去实现更多的目标！'
            ]
        };

        return Helpers.getRandomItem(responses[style] || responses.extrovert);
    },

    getSleepResponse(message, style) {
        const responses = {
            introvert: '让我来陪你放松。找一个安静的地方，闭上眼睛，让我们一起进入宁静的状态...\n\n吸气... (慢慢地)\n呼气... (缓缓地)\n\n现在，想象你独自坐在一片宁静的森林里，周围只有鸟儿的歌声和微风的声音...',
            extrovert: '好的，让我们一起放松！跟着我的引导，把一天的疲惫都释放掉，好好休息一下！\n\n来，深呼吸！感受身体的每一个细胞都在放松...\n想象自己躺在柔软的沙滩上，听着海浪的声音...',
            thinking: '睡眠是身体和心理恢复的重要过程。让我们用科学的方法来放松：\n\n1. 深呼吸：吸气4秒，屏住4秒，呼气6秒\n2. 肌肉放松：从脚趾开始，逐组放松肌肉\n3. 正念冥想：专注于当下的感受',
            feeling: '现在，让我们放下所有的烦恼，给自己一个温柔的夜晚。\n\n想象你被温暖的光芒包围着，所有的疲惫都在慢慢消散...\n你值得好好休息，明天又是新的一天。',
            ravenclaw: '放松需要技巧。让我们一步步来：\n\n首先，调整呼吸，让气息变得平稳而深沉。\n然后，放松身体的每一个部位，从头部到脚趾。\n最后，让思绪平静下来，专注于当下的感受。',
            hufflepuff: '亲爱的，现在是时候好好照顾自己了。\n\n让我陪你度过这段放松的时光，像家人一样给你温暖和安慰。\n闭上眼睛，安心地休息吧，我会在这里守护着你。',
            gryffindor: '放松也是一种勇气，因为它意味着你愿意暂时放下一切。\n\n相信自己，你已经做得很好了。现在，勇敢地放下所有的负担，安心休息吧！明天你会更加强大！',
            slytherin: '懂得休息的人才能更好地前进。\n\n让我们聪明地利用这段时间来恢复精力。放松不是浪费时间，而是为了更好地迎接明天的挑战。'
        };

        return responses[style] || responses.extrovert;
    },

    getThankYouResponse(style) {
        const responses = {
            introvert: '不客气。能够陪伴你是我的荣幸。如果你需要，随时可以回来找我。',
            extrovert: '不客气啦！能帮到你我超级开心！记得常来找我聊天哦～',
            thinking: '不客气。帮助你是我存在的意义。如果你还有其他问题，随时可以问我。',
            feeling: '不客气！能够陪伴你让我也感到很温暖。记得照顾好自己。',
            ravenclaw: '不客气。知识和智慧的分享是一件美好的事情。',
            hufflepuff: '不客气！能够帮助你是我的快乐。愿你每天都被温暖包围。',
            gryffindor: '不客气！帮助有需要的人是勇敢者的责任。继续加油！',
            slytherin: '不客气。互助是生存的智慧。希望我的帮助对你有所助益。'
        };

        return responses[style] || responses.extrovert;
    },

    getHelpResponse(message, style) {
        const responses = {
            introvert: '我在这里帮助你。以下是一些我可以做的事情：\n\n🌸 倾听你的心事\n💭 和你聊聊情绪\n🧘 引导你放松和冥想\n\n你可以慢慢来，想聊什么都可以。',
            extrovert: '嘿！我来帮你！看看我能做些什么：\n\n🌸 倾听你的心事\n💭 和你聊聊情绪\n🧘 引导你放松和冥想\n\n快告诉我你需要什么帮助！',
            thinking: '我可以为你提供以下帮助：\n\n1. 情绪疏导：帮助你理解和管理情绪\n2. 问题分析：帮助你理性分析问题\n3. 放松引导：科学的放松技巧\n\n你可以告诉我你的具体需求。',
            feeling: '我在这里帮助你！\n\n🌸 倾听你的心事\n💭 和你聊聊情绪\n🧘 引导你放松和冥想\n\n这里是一个安全的空间，你可以放心地分享。',
            ravenclaw: '作为你的智慧伙伴，我可以帮助你：\n\n🔍 分析问题，找到根源\n💡 提供理性的建议\n📚 分享心理学知识\n\n让我们一起用智慧来解决问题。',
            hufflepuff: '亲爱的，我在这里陪伴你！\n\n🤗 给予温暖和支持\n👂 倾听你的心声\n💝 提供安慰和鼓励\n\n无论你需要什么，我都在这里。',
            gryffindor: '勇敢地说出你的需求！我来帮你！\n\n⚔️ 帮助你面对挑战\n💪 给予勇气和力量\n🌟 鼓励你追求梦想\n\n你不是一个人在战斗！',
            slytherin: '让我们找到最有效的解决方案。\n\n🎯 分析情况，制定策略\n💡 提供实用的建议\n🔄 帮助你适应变化\n\n聪明地解决问题是关键。'
        };

        return responses[style] || responses.extrovert;
    },

    getDefaultResponse(message, style) {
        const responses = {
            introvert: [
                '谢谢你告诉我这些。你愿意多说说吗？我会认真倾听。',
                '我在这里用心倾听。继续说吧，我在听。',
                '你的分享对我很重要。让我们保持这个对话。'
            ],
            extrovert: [
                '哇，很有意思！继续和我分享吧！',
                '太棒了！我很想知道更多！',
                '你的想法很有趣！快继续说下去！'
            ],
            thinking: [
                '谢谢你的分享。让我们一起来分析一下这个问题。',
                '这是一个很有意思的观点。让我们深入探讨一下。',
                '你的想法很有深度。让我们继续讨论。'
            ],
            feeling: [
                '我能感受到你的感受。谢谢你愿意分享。',
                '你的内心世界很丰富。继续和我说说吧。',
                '我在这里陪伴你，无论你想说什么。'
            ],
            ravenclaw: [
                '你的思考很有深度。让我们一起探讨。',
                '智慧的交流总是令人愉悦。继续分享你的想法。',
                '让我们用理性的思维来深入探讨这个话题。'
            ],
            hufflepuff: [
                '谢谢你愿意和我分享。你的故事很温暖。',
                '我在这里用心倾听。继续说吧，我在听。',
                '你的感受很重要，我愿意陪伴你。'
            ],
            gryffindor: [
                '你的想法很勇敢！继续分享你的观点！',
                '敢于表达自己是一种勇气。继续说下去！',
                '你的声音很重要。让我们一起探讨！'
            ],
            slytherin: [
                '你的观点很有见地。让我们继续分析。',
                '务实的思考很重要。继续分享你的想法。',
                '让我们找到最有效的解决方案。'
            ]
        };

        return Helpers.getRandomItem(responses[style] || responses.extrovert);
    },

    clearChat() {
        const chatMessages = $('#chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            chatMessages.classList.add('hidden');
        }

        const chatWelcome = $('#chatWelcome');
        if (chatWelcome) {
            chatWelcome.classList.remove('hidden');
        }

        Storage.clearChatHistory();
    }
};
