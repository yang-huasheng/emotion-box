# 情绪盒子 - 产品规范文档

## 1. Concept & Vision 概念与愿景

**情绪盒子**是一款融合色彩心理学与MBTI人格理论的AI情绪治愈日记应用。它如同一位温柔的心理陪伴者，帮助用户记录情绪、管理心理状态，在温暖的视觉体验中实现自我疗愈。"坏情绪定时消散，小美好永久珍藏"——这不仅是标语，更是产品承诺给用户的情感体验。

整体体验如同置身于一个私密的安全屋，柔和的色彩如流水般包裹用户，每一个交互都传递着关怀与理解。

## 2. Design Language 设计语言

### 2.1 Aesthetic Direction 美学方向
**治愈系插画风格** + **极简主义**：灵感来源于日系治愈插画和北欧简约设计，讲究留白、柔和色彩与自然元素的结合。整体感觉是"在云端写日记"——轻盈、温暖、私密。

### 2.2 Color Palette 色彩系统

基于**色彩心理学**设计，针对不同情绪状态设计了对应的治愈色彩：

```
主色调（默认状态）：
- Primary:      #7C9ACC (薰衣草蓝 - 平静、治愈)
- Primary Dark: #5A7FA8 (深海蓝 - 安心)
- Primary Light: #B8D4E8 (天空蓝 - 轻松)

情绪主题色（可切换）：
- 快乐 Yellow:  #FFD93D (向日葵黄 - 温暖、活力)
- 平静 Blue:     #6EC6FF (清澈蓝 - 平和、安宁)
- 能量 Orange:  #FFB366 (暖阳橙 - 激励、热情)
- 治愈 Green:   #98D4BB (薄荷绿 - 自然、恢复)
- 浪漫 Pink:    #FFB5C2 (樱花粉 - 温柔、甜蜜)
- 沉思 Purple:  #C4A2D4 (薰衣草紫 - 内省、灵性)

中性色：
- Background:   #FAFBFD (云白色 - 主背景)
- Surface:      #FFFFFF (纯白 - 卡片背景)
- Text Primary: #4A5568 (暖灰色 - 主文字)
- Text Secondary: #8E9AAB (柔灰 - 次要文字)
- Border:       #E8ECF0 (雾灰 - 边框)

功能色：
- Success:      #7BCDA0 (清新绿)
- Warning:      #FFB347 (柔和橙)
- Error:        #E8A0A0 (淡雅红)
```

### 2.3 Typography 字体系统

```css
/* 中文优先，温暖易读 */
--font-primary: "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
--font-display: "ZCOOL XiaoWei", "Noto Serif SC", serif; /* 标题装饰性 */

/* 字重与行高 */
--text-xs:    12px / 1.5
--text-sm:    14px / 1.6
--text-base:  16px / 1.8 (日记内容)
--text-lg:    18px / 1.7
--text-xl:    24px / 1.5
--text-2xl:   32px / 1.3
--text-3xl:   40px / 1.2 (品牌标语)
```

### 2.4 Spatial System 空间系统

```css
--space-xs:  4px   (紧凑间距)
--space-sm:  8px   (元素内间距)
--space-md:  16px  (组件间距)
--space-lg:  24px  (区块间距)
--space-xl:  32px  (页面边距)
--space-2xl: 48px  (大区块)
--space-3xl: 64px  (页面顶部/底部留白)

--radius-sm:  8px   (小圆角)
--radius-md:  12px  (卡片圆角)
--radius-lg:  20px  (大圆角)
--radius-full: 9999px (胶囊按钮)
```

### 2.5 Motion Philosophy 动效哲学

**"如水般温柔"**——所有动画都应如流水、轻风般自然，不突兀、不急躁。

```css
/* 缓动函数 */
--ease-gentle:   cubic-bezier(0.4, 0, 0.2, 1);      /* 温和 */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1); /* 轻弹 */
--ease-smooth:   cubic-bezier(0.25, 0.1, 0.25, 1); /* 平滑 */

/* 时长 */
--duration-fast:   150ms  (微交互)
--duration-normal: 300ms  (状态切换)
--duration-slow:   500ms  (页面过渡)
--duration-slower: 800ms  (花瓣飘落等装饰)
```

**核心动效模式：**
1. **呼吸感动画**：按钮悬停时轻微放大(1.02)，如同呼吸
2. **渐入渐出**：页面切换采用淡入淡出，opacity 0→1, 300ms
3. **浮动元素**：装饰性花瓣、云朵持续缓慢浮动动画
4. **情绪颜色渐变**：心情切换时背景色平滑过渡(500ms)
5. **卡片轻弹**：日记卡片hover时轻微上浮(translateY -4px) + 阴影加深

### 2.6 Visual Assets 视觉资源

**图标库**：Phosphor Icons (https://phosphoricons.com) - 圆润友好的线条风格
**装饰元素**：
- 花瓣飘落动画（SVG）
- 云朵漂浮（CSS）
- 星星闪烁（关键帧动画）
- 波纹扩散（CSS animation）

**情感插画风格**：简约扁平化，使用上述情绪主题色，圆润的线条和形状

## 3. Layout & Structure 布局与结构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────┐
│                    Header                        │
│         Logo + 标语 + 用户头像/设置              │
├─────────────────────────────────────────────────┤
│                                                  │
│                  Main Content                    │
│                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │ Today   │  │ History │  │  Mood   │        │
│   │ 今日   │  │ 历史   │  │ 心情墙  │        │
│   │ 心情   │  │ 日记   │  │         │        │
│   └─────────┘  └─────────┘  └─────────┘        │
│                                                  │
│              [AI 治愈助手入口]                   │
│                                                  │
├─────────────────────────────────────────────────┤
│                    Footer                        │
│              隐私声明 + 版权信息                  │
└─────────────────────────────────────────────────┘
```

### 3.2 响应式策略

**断点设计：**
- Mobile:  < 640px  (手机优先，单列布局)
- Tablet:  640px - 1024px (平板，双列布局)
- Desktop: > 1024px (桌面，三列布局)

**核心原则：**
- 移动端：单手操作友好，底部导航
- 桌面端：更丰富的视觉层次，更大的留白
- 所有设备保持相同的情感体验

### 3.3 页面层级

```
层级 0: 欢迎/登录页 (首次使用)
层级 1: 首页 (今日心情 + 快捷入口)
层级 2: 日记编辑页 (全屏沉浸式写作)
层级 3: 历史浏览页 (时间线视图)
层级 4: 心情墙/统计页 (数据可视化)
层级 5: AI治愈助手 (对话式界面)
层级 6: 个人设置页
```

## 4. Features & Interactions 功能与交互

### 4.1 核心功能模块

#### 4.1.1 心情记录 (Today)

**入口**：首页中央的主要卡片，点击进入当日心情记录

**流程**：
1. 选择今日情绪标签（预设8种情绪 + 自定义）
2. 选择情绪强度（1-5星）
3. 可选：关联的色彩主题自动切换
4. 记录今日一句话心情
5. AI基于MBTI人格推荐写日记的提示问题

**情绪标签系统**：
```
😊 愉悦  | 😢 悲伤  | 😨 焦虑  | 😠 愤怒
😌 平静  | 😴 疲惫  | 🤔 困惑  | 🥰 感动
✨ 其他（自定义）
```

**交互细节**：
- 选择情绪时，对应色彩主题实时预览
- 情绪强度使用星星评分，hover时有呼吸放大效果
- 提交后显示温柔鼓励语，如"今天也很勇敢呢"

#### 4.1.2 日记撰写 (Diary)

**编辑器特性**：
- Markdown支持（可选）
- 自动保存（每30秒）
- 字数统计
- 撰写时长计时
- 表情符号快捷插入

**隐私保护**：
- 支持设置日记锁定密码
- 密码错误时不暴露日记内容存在
- 连续3次密码错误后锁定5分钟

**交互细节**：
- 标题自动聚焦时显示placeholder动画
- 正文字数超过500字时显示字数烟花庆祝
- 退出时未保存提示

#### 4.1.3 历史浏览 (History)

**视图模式**：
- 日历视图（默认）：每月日历显示情绪颜色标记
- 列表视图：时间线形式展示
- 卡片视图：瀑布流日记卡片

**筛选功能**：
- 按情绪类型筛选
- 按日期范围筛选
- 关键词搜索

**交互细节**：
- 日历上的情绪标记为小圆点，颜色对应情绪主题
- 点击日期展开当日日记预览
- 滑动切换月份时有平滑过渡

#### 4.1.4 心情墙/统计 (Mood Wall)

**数据可视化**：
- 月度情绪分布饼图
- 情绪变化折线图
- 人格类型与情绪关联分析

**心理学元素**：
- 基于MBTI的人格情绪倾向分析
- 每周/每月情绪总结报告
- 相似情绪时段的智能提醒

#### 4.1.5 AI治愈助手 (AI Companion)

**对话风格**：
- 温柔、支持性语气
- 基于认知行为疗法(CBT)原理
- 结合用户MBTI人格类型给出个性化建议

**功能点**：
- 情绪陪伴对话
- 认知重构建议
- 正念冥想引导
- 睡眠故事（未来功能）

**交互细节**：
- 对话气泡采用消息流形式
- AI回复有"正在输入"动画
- 支持语音输入（可选）

#### 4.1.6 个人中心 (Settings)

**功能项**：
- MBTI人格测试入口
- 隐私设置（密码保护、加密选项）
- 主题颜色切换
- 数据导出/备份
- 通知设置
- 关于与反馈

### 4.2 隐私与安全

- 本地存储为主，数据不上传到服务器
- 可选的密码保护
- 连续错误锁定机制
- 无痕浏览模式支持
- 隐私政策透明

### 4.3 边界状态处理

**空状态**：
- 无日记时：显示"今天想写点什么吗？"配合轻柔动画
- 搜索无结果：显示"没有找到相关日记，或许这就是新的开始？"

**加载状态**：
- 使用柔和的脉冲动画
- 避免使用生硬的loading spinner

**错误状态**：
- 使用温暖的语言而非技术术语
- 提供明确的解决指引

## 5. Component Inventory 组件清单

### 5.1 情绪选择器 (MoodSelector)

**外观**：圆形emoji图标 + 文字标签，横向或网格排列

**状态**：
- Default: 半透明灰色背景
- Hover: 背景色变为情绪对应色，scale 1.1
- Selected: 边框高亮，背景填充，scale 1.15
- Disabled: 灰色，无交互

### 5.2 强度评分器 (IntensityRating)

**外观**：5颗星星，横向排列

**状态**：
- Empty: 灰色轮廓星
- Filled: 情绪主题色填充星
- Hover: 预览填充效果 + 呼吸放大

### 5.3 日记卡片 (DiaryCard)

**外观**：圆角白色卡片，左侧有情绪颜色条带

**状态**：
- Default: 轻微阴影
- Hover: 上浮4px + 阴影加深
- Active: 点击时缩小至0.98

### 5.4 AI对话气泡 (ChatBubble)

**外观**：圆角矩形，AI为左对齐浅紫色背景，用户为右对齐主题色背景

**状态**：
- Sending: 透明度渐显
- Sent: 正常显示
- Error: 红色边框 + 重发按钮

### 5.5 导航栏 (Navigation)

**移动端**：底部固定，4个主要入口图标 + 文字

**桌面端**：顶部横向排列

### 5.6 按钮系统

**Primary Button**：
- 背景：Primary色渐变
- 文字：白色
- 圆角：radius-full
- Hover: 亮度提升 + 轻微放大
- Active: 缩小至0.98
- Loading: 显示脉冲动画
- Disabled: 50%透明度

**Secondary Button**：
- 背景：透明
- 边框：1px Primary色
- Hover: 背景填充10% Primary色

**Ghost Button**：
- 背景：透明
- 文字：Primary色
- Hover: 背景填充5%

### 5.7 输入框 (Input)

**外观**：底部边框样式，圆角

**状态**：
- Default: 浅灰色边框
- Focus: Primary色边框 + 轻微发光
- Error: 红色边框 + 错误提示文字
- Disabled: 灰色背景

### 5.8 模态框 (Modal)

**外观**：白色圆角卡片，背景模糊遮罩

**动画**：
- 出现：scale 0.9→1 + opacity 0→1, 300ms
- 消失：scale 1→0.95 + opacity 1→0, 200ms

## 6. Technical Approach 技术方案

### 6.1 技术栈

**前端**：
- 纯HTML5 + CSS3 + Vanilla JavaScript (无框架依赖，最大兼容性和隐私性)
- CSS Grid + Flexbox 布局
- CSS Custom Properties (变量系统)
- LocalStorage 本地数据存储
- IndexedDB (大量日记数据存储)

**AI对话**：
- 预留接口（可对接ChatGPT API或其他AI服务）
- 本地模拟响应（演示用）

**加密**：
- Web Crypto API (AES加密)

### 6.2 数据模型

```javascript
// 用户配置
UserConfig {
  id: string,
  mbti: string | null,           // MBTI类型
  theme: string,                  // 当前主题色
  password: string | null,        // 加密密码hash
  createdAt: timestamp,
  settings: {
    language: string,
    notifications: boolean,
    autoSave: boolean
  }
}

// 心情记录
MoodEntry {
  id: string,
  date: string (YYYY-MM-DD),
  emotion: string,                // 情绪类型
  intensity: number (1-5),
  note: string,                   // 一句话心情
  colorTheme: string,             // 使用的色彩主题
  createdAt: timestamp
}

// 日记
Diary {
  id: string,
  moodId: string | null,          // 关联的心情记录
  date: string (YYYY-MM-DD),
  title: string,
  content: string,
  wordCount: number,
  duration: number,               // 撰写时长(秒)
  isLocked: boolean,
  tags: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}

// AI对话记录
ChatMessage {
  id: string,
  role: 'user' | 'assistant',
  content: string,
  timestamp: timestamp
}
```

### 6.3 文件结构

```
/
├── index.html              # 主页面
├── css/
│   ├── variables.css       # CSS变量定义
│   ├── base.css            # 基础样式重置
│   ├── components.css      # 组件样式
│   ├── layouts.css         # 布局样式
│   └── animations.css      # 动画定义
├── js/
│   ├── app.js              # 主入口
│   ├── modules/
│   │   ├── mood.js         # 心情记录模块
│   │   ├── diary.js        # 日记模块
│   │   ├── ai.js           # AI对话模块
│   │   ├── stats.js        # 统计模块
│   │   └── settings.js     # 设置模块
│   ├── utils/
│   │   ├── storage.js      # 存储工具
│   │   ├── crypto.js       # 加密工具
│   │   └── helpers.js      # 辅助函数
│   └── data/
│       └── emotions.js     # 情绪数据
└── assets/
    └── icons/              # 图标资源
```

### 6.4 性能优化

- CSS/JS 按需加载
- 图片懒加载
- 防抖节流处理频繁事件
- Service Worker 离线支持（可选）

## 7. MBTI人格与情绪色彩关联

基于人格心理学设计，每种MBTI类型对应推荐的情绪主题色和分析：

```
感觉型(S) + 思考型(T): 蓝色系 (理性、平静)
感觉型(S) + 情感型(F): 绿色系 (温暖、治愈)
直觉型(N) + 思考型(T): 紫色系 (深邃、灵性)
直觉型(N) + 情感型(F): 粉色系 (浪漫、敏感)
外向型(E): 橙色系 (活力、激励)
内向型(I): 蓝色系 (内省、安宁)
```

## 8. Accessibility & Inclusive 无障碍与包容性

- 语义化HTML标签
- ARIA标签支持
- 键盘导航完整
- 足够的颜色对比度
- 支持减弱动画偏好
- 支持屏幕阅读器
