# 可能人生 (Possibly Life) v2.0 - 规格文档

## 1. Concept & Vision

**可能人生**是一款AI驱动的对话式人生设计教练应用，帮助用户在45分钟内通过结构化的自我探索，发现并设计三种可能的人生方向。它不是冰冷的测评工具，而是一位温暖且富有洞察力的向导，陪伴用户进行深度的自我对话，最终产出一份个性化的人生设计报告。

应用的核心体验：**沉浸式的对话旅程** —— 用户仿佛在与一位智慧的老朋友进行深夜长谈，在柔和的光影与舒缓的节奏中，逐步揭开内心深处的渴望与恐惧。

## 2. Design Language

### Aesthetic Direction
**深邃冥想 (Deep Meditation)** —— 结合现代极简主义与东方禅意美学，营造出一种宁静、深邃的沉思空间。界面以深色为主调，点缀柔和的渐变光晕，如同夜空中的星辰。

### Color Palette
```
--bg-primary: #0a0b14          // 深邃夜空
--bg-secondary: #12141f        // 暗色层
--bg-card: #1a1d2e             // 卡片背景
--bg-elevated: #242842         // 提升层
--text-primary: #f0f2f7         // 主文字
--text-secondary: #a0a6b8       // 次要文字
--text-muted: #6b7194          // 暗淡文字
--accent-primary: #7c5bf5       // 主题紫
--accent-secondary: #5b8def     // 辅助蓝
--accent-glow: rgba(124, 91, 245, 0.15)  // 光晕
--accent-success: #4ade80      // 成功绿
--accent-warning: #fbbf24      // 警示金
--accent-danger: #f87171        // 危险红
--gradient-hero: linear-gradient(135deg, #1a1d2e 0%, #0a0b14 50%, #12141f 100%)
--gradient-glow: radial-gradient(ellipse at center, rgba(124, 91, 245, 0.2) 0%, transparent 70%)
```

### Typography
- **标题**: "Noto Serif SC", serif — 中文衬线体，传递文化深度与智慧感
- **正文**: "Noto Sans SC", system-ui — 清晰易读的无衬线体
- **数字/强调**: "DM Serif Display", serif — 优雅的数字展示

### Spatial System
- 基础单位: 4px
- 间距递进: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- 卡片圆角: 16px
- 按钮圆角: 8px
- 输入框圆角: 12px

### Motion Philosophy
- **呼吸节奏**: 所有过渡动画遵循缓入缓出的节奏，如呼吸般自然
- **渐进揭示**: 内容层层展开，引导用户注意力
- **光影流动**: 背景光晕微微流动，营造生命感
- 基础动画时长: 300-500ms
- 缓动函数: cubic-bezier(0.4, 0, 0.2, 1)

### Visual Assets
- **图标库**: Lucide React — 线条细腻，风格统一
- **装饰元素**:
  - 微妙的星点粒子背景
  - 渐变光晕作为视觉焦点
  - 流动的渐变线条作为分隔
- **无图片依赖**: 所有视觉效果通过CSS/SVG实现

## 3. Layout & Structure

### 整体架构
```
┌─────────────────────────────────────────────────────────┐
│  顶部进度指示 (Progress Bar + Stage Indicator)         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              主内容区域 (Conversation Area)             │
│              - 问题展示                                  │
│              - 用户输入                                  │
│              - AI回复                                    │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  底部操作区 (Action Bar)                                │
└─────────────────────────────────────────────────────────┘
```

### 页面流程
1. **首页 (Landing)** — 品牌展示与开始入口
2. **阶段1: 灵魂快照** — 8个互动问题
3. **阶段2: 反愿景** — 3个子步骤
4. **阶段3: 三种可能** — 人生版本展示与调整
5. **阶段4: 未来对话** — 与60岁自我对话
6. **报告页** — 完整人生设计报告

### 响应式策略
- 桌面优先，移动端友好
- 移动端输入区域固定在底部
- 卡片单列布局，桌面端可并排

## 4. Features & Interactions

### 阶段1: 灵魂快照 (约12分钟，8个问题)

**问题列表**:
1. **状态评分** — "用1-10分形容你现在的状态，10分是巅峰状态，1分是最低谷"
2. **能量来源** — "什么事情最能让你感到精力充沛？什么事情最消耗你的能量？"
3. **选择障碍** — "你目前最纠结的选择是什么？是什么让你难以决定？"
4. **恐惧具象化** — "如果有一件事你一直不敢去做，那件事是什么？"
5. **梦想碎片** — "有没有什么事是你一直想做但从未开始的吗？"
6. **价值观排序** — "对你来说最重要的是什么？自由、成就、关系、安全、创造..."
7. **生活片段** — "描述一个你理想中的普通一天"
8. **独特天赋** — "你有没有什么事是你做得特别好的，或者别人经常夸你的？"

**交互行为**:
- 每次仅展示一个问题
- 底部显示问题编号和预计时间
- 用户输入支持多行文本
- 提交后显示确认动画，然后进入下一题
- "跳过"选项用于敏感问题

### 阶段2: 反愿景 (约8分钟)

**子步骤**:
1. **时间旅行** — 引导用户想象"如果一切保持现状，5年后的你会是什么样？"
2. **十年版对话** — 用户给10年后的自己写一封信，然后以未来自我的视角回信
3. **反愿景定义** — 基于上述想象，提炼出用户"不想成为"的样子

**交互行为**:
- 时间旅行以可视化年表形式呈现
- 对话采用双面板设计（写信/收信）
- AI生成的反愿景以卡片形式展示

### 阶段3: 三种可能人生 (约15分钟)

**三种人生版本**:
1. **稳定进阶版** — 在现有基础上稳步发展，深耕当前领域
2. **转身切换版** — 转向与当前相关但不同的领域/角色
3. **疯狂自由版** — 完全追随内心渴望的冒险之路

**交互行为**:
- 三个版本以卡片并排展示（移动端可滑动）
- 每个版本包含：标题、一句话描述、关键要素、潜在收益与挑战
- 用户可以：
  - 调整任一版本中的元素
  - 组合多个版本的元素形成"整合方案"
  - 与AI讨论某个版本的可行性

### 阶段4: 与未来的自己对话 (约10分钟)

**对话结构**:
- 设定场景：用户以当前年龄与60岁的"未来自我"对话
- AI扮演60岁的智慧长者角色
- 引导用户问出核心疑虑
- AI给予共情回应和具体行动建议

**交互行为**:
- 对话以聊天气泡形式呈现
- 特殊节点插入"行动建议卡片"
- 支持语音输入（可选）

### 最终报告

**报告结构**:
```
┌─────────────────────────────────────────┐
│  📋 灵魂快照                              │
│  - 核心发现                               │
│  - 关键洞察                               │
├─────────────────────────────────────────┤
│  🚫 反愿景                               │
│  - 不想成为的样子                          │
│  - 核心恐惧                              │
├─────────────────────────────────────────┤
│  🌟 三种可能                             │
│  - 版本1/2/3 概要                         │
│  - 整合方案                              │
├─────────────────────────────────────────┤
│  📝 行动建议                              │
│  - 下一步行动                             │
│  - 30天计划                              │
│  - 资源推荐                              │
└─────────────────────────────────────────┘
```

**交互行为**:
- 支持导出为PDF/图片
- 可分享到社交媒体（仅链接）
- 可保存到本地存储

### 情绪处理机制

**危险信号识别**:
- 用户表达极度负面情绪（绝望、无助等）
- 涉及自伤/自杀相关内容
- 严重的心理健康困扰

**应对策略**:
- 暂停对话流程
- 显示支持资源卡片（心理热线等）
- 提供"我想聊聊别的话题"选项
- 不评判、不诊断，只是陪伴

### 严格规则执行

1. **单问题原则**: 每轮仅问一个问题，不连续追问
2. **时间控制**: 每阶段有预估时间，超时会温和提醒
3. **进度保存**: 自动保存进度到localStorage
4. **随时退出**: 支持随时暂停，保留进度

## 5. Component Inventory

### ProgressBar
- 显示当前阶段进度
- 状态: default, animating, completed
- 显示阶段名称和预计剩余时间

### QuestionCard
- 问题展示卡片
- 包含问题编号、问题文本、预计回答时间
- 状态: entering, active, exiting

### InputArea
- 多行文本输入
- 字符计数
- 提交按钮（主色）
- 跳过按钮（次要/幽灵样式）

### ChatBubble
- 对话气泡
- 变体: user, ai, system, action
- AI气泡支持打字机效果

### LifeVersionCard
- 人生版本卡片
- 包含：标题、描述、要素列表、收益/挑战
- 状态: default, selected, editing
- 操作按钮：选择、调整、讨论

### ActionSuggestionCard
- 行动建议卡片
- 包含：标题、描述、执行步骤
- 高亮当前推荐项

### SupportModal
- 危机支持弹窗
- 显示心理援助资源
- 关闭后继续正常流程

### ReportView
- 报告阅读视图
- 折叠/展开各部分
- 导出按钮组

## 6. Technical Approach

### Framework & Architecture
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **State Management**: React Context + useReducer
- **AI Integration**: coze-coding-dev-sdk (后端流式输出)

### Project Structure
```
src/
├── app/
│   ├── page.tsx                    # 首页
│   ├── journey/
│   │   ├── page.tsx                # 旅程入口
│   │   ├── stage-1/
│   │   │   └── page.tsx            # 灵魂快照
│   │   ├── stage-2/
│   │   │   └── page.tsx            # 反愿景
│   │   ├── stage-3/
│   │   │   └── page.tsx            # 三种可能
│   │   ├── stage-4/
│   │   │   └── page.tsx            # 未来对话
│   │   └── report/
│   │       └── page.tsx            # 最终报告
│   └── api/
│       └── chat/
│           └── route.ts            # AI对话API
├── components/
│   ├── progress-bar.tsx
│   ├── question-card.tsx
│   ├── input-area.tsx
│   ├── chat-bubble.tsx
│   ├── life-version-card.tsx
│   ├── action-suggestion.tsx
│   ├── support-modal.tsx
│   └── report-view.tsx
├── context/
│   └── journey-context.tsx         # 旅程状态管理
├── lib/
│   ├── prompts.ts                  # AI提示词模板
│   └── types.ts                    # 类型定义
└── styles/
    └── globals.css                 # 全局样式与变量
```

### API Design

**POST /api/chat**
```typescript
// Request
{
  stage: 1 | 2 | 3 | 4,
  step: number,
  messages: Message[],
  userData: UserData,
  action: 'question' | 'summarize' | 'generate' | 'dialogue'
}

// Response: SSE Stream
{
  type: 'chunk' | 'done' | 'error',
  content?: string,
  error?: string
}
```

### Data Model

```typescript
interface UserData {
  id: string;
  answers: Stage1Answers;
  antiVision: AntiVision;
  lifeVersions: LifeVersion[];
  integratedPlan: IntegratedPlan;
  actionSuggestions: ActionSuggestion[];
}

interface Stage1Answers {
  statusScore: number;
  energySources: string;
  choiceDilemma: string;
  fearVisualization: string;
  dreamFragments: string;
  values: string[];
  idealDay: string;
  uniqueTalent: string;
}

interface AntiVision {
  futureProjection: string;
  letterToFuture: string;
  letterFromFuture: string;
  antiVisionStatement: string;
}

interface LifeVersion {
  id: string;
  type: 'stable' | 'pivot' | 'wild';
  title: string;
  tagline: string;
  elements: string[];
  benefits: string[];
  challenges: string[];
}

interface IntegratedPlan {
  selectedVersions: string[];
  combinedElements: string[];
  reasoning: string;
}

interface ActionSuggestion {
  title: string;
  description: string;
  steps: string[];
  priority: 'high' | 'medium' | 'low';
}
```

### Storage Strategy
- **会话存储**: localStorage用于保存进度
- **报告导出**: 生成后提供下载选项
- **无后端数据库**: 所有数据在客户端处理

## 7. Quality Checklist

- [ ] 所有按钮可点击并有反馈
- [ ] 进度自动保存
- [ ] 移动端布局完整
- [ ] 无控制台错误
- [ ] AI流式输出正常
- [ ] 危险信号检测工作
- [ ] 报告可导出
