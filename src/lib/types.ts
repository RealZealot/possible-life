// Type definitions for 可能人生 (Possibly Life) v2.0

export type Stage = 1 | 2 | 3 | 4 | 'report' | null;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Stage1Answers {
  statusScore: number | null;
  energySources: string;
  choiceDilemma: string;
  fearVisualization: string;
  dreamFragments: string;
  values: string[];
  idealDay: string;
  uniqueTalent: string;
}

export interface AntiVision {
  futureProjection: string;
  letterToFuture: string;
  letterFromFuture: string;
  antiVisionStatement: string;
}

export type LifeVersionType = 'stable' | 'pivot' | 'wild';

export interface LifeVersion {
  id: string;
  type: LifeVersionType;
  title: string;
  tagline: string;
  elements: string[];
  benefits: string[];
  challenges: string[];
  isCustomized: boolean;
}

export interface IntegratedPlan {
  selectedVersions: string[];
  combinedElements: string[];
  reasoning: string;
}

export interface ActionSuggestion {
  id: string;
  title: string;
  description: string;
  steps: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface Report {
  generatedAt: number;
  soulSnapshotSummary: string;
  antiVisionSummary: string;
  lifeVersionsSummary: string;
  integratedPlanSummary: string;
  actionPlan: ActionSuggestion[];
}

export interface JourneyState {
  stage: Stage;
  step: number;
  isLoading: boolean;
  userData: {
    answers: Stage1Answers;
    antiVision: AntiVision;
    lifeVersions: LifeVersion[];
    integratedPlan: IntegratedPlan;
    actionSuggestions: ActionSuggestion[];
    report: Report | null;
  };
  messages: Message[];
  currentQuestion: Question | null;
  progress: {
    stage1Completed: boolean;
    stage2Completed: boolean;
    stage3Completed: boolean;
    stage4Completed: boolean;
  };
}

export interface Question {
  id: string;
  stage: Stage;
  text: string;
  subtext?: string;
  type: 'input' | 'score' | 'multi-select' | 'dialogue';
  options?: string[];
  placeholder?: string;
  estimatedTime: string;
  skipable: boolean;
}

export interface Stage2Step {
  id: string;
  title: string;
  description: string;
  type: 'projection' | 'letter' | 'definition';
  prompt: string;
}

export interface ChatRequest {
  stage: Stage;
  step: number;
  messages: Message[];
  userData: Partial<JourneyState['userData']>;
  action: 'intro' | 'question' | 'summarize' | 'generate' | 'dialogue' | 'reflect' | 'anti-vision' | 'report' | 'advice';
}

export interface ChatResponse {
  type: 'chunk' | 'done' | 'error';
  content?: string;
  error?: string;
}

// Default values
export const defaultStage1Answers: Stage1Answers = {
  statusScore: null,
  energySources: '',
  choiceDilemma: '',
  fearVisualization: '',
  dreamFragments: '',
  values: [],
  idealDay: '',
  uniqueTalent: '',
};

export const defaultAntiVision: AntiVision = {
  futureProjection: '',
  letterToFuture: '',
  letterFromFuture: '',
  antiVisionStatement: '',
};

export const defaultIntegratedPlan: IntegratedPlan = {
  selectedVersions: [],
  combinedElements: [],
  reasoning: '',
};

export const initialJourneyState: JourneyState = {
  stage: null,
  step: 0,
  isLoading: false,
  userData: {
    answers: defaultStage1Answers,
    antiVision: defaultAntiVision,
    lifeVersions: [],
    integratedPlan: defaultIntegratedPlan,
    actionSuggestions: [],
    report: null,
  },
  messages: [],
  currentQuestion: null,
  progress: {
    stage1Completed: false,
    stage2Completed: false,
    stage3Completed: false,
    stage4Completed: false,
  },
};

// Stage 1 Questions
export const stage1Questions: Question[] = [
  {
    id: 'status-score',
    stage: 1,
    text: '用1-10分形容你现在的状态，10分是巅峰状态，1分是最低谷',
    subtext: '这不是评判，只是让我们了解你此刻的能量水平',
    type: 'score',
    estimatedTime: '1分钟',
    skipable: false,
  },
  {
    id: 'energy-sources',
    stage: 1,
    text: '什么事情最能让你感到精力充沛？什么事情最消耗你的能量？',
    subtext: '可以是工作、生活中的任何事情',
    type: 'input',
    placeholder: '比如：和志同道合的人交流让我充满能量，但长时间会议让我疲惫不堪...',
    estimatedTime: '2分钟',
    skipable: false,
  },
  {
    id: 'choice-dilemma',
    stage: 1,
    text: '你目前最纠结的选择是什么？是什么让你难以决定？',
    subtext: '可以是职业、生活方向、人际关系等任何层面的选择',
    type: 'input',
    placeholder: '比如：我应该继续现在的稳定工作，还是去追求那个有风险但更让我兴奋的机会...',
    estimatedTime: '2分钟',
    skipable: true,
  },
  {
    id: 'fear-visualization',
    stage: 1,
    text: '如果有一件事你一直不敢去做，那件事是什么？',
    subtext: '没有标准答案，也不需要告诉任何人',
    type: 'input',
    placeholder: '比如：一直想创业但害怕失败，或者想离开不满意的现状但害怕改变...',
    estimatedTime: '2分钟',
    skipable: true,
  },
  {
    id: 'dream-fragments',
    stage: 1,
    text: '有没有什么事是你一直想做但从未开始的？',
    subtext: '那些被搁置的梦想，哪怕只是一个念头',
    type: 'input',
    placeholder: '比如：想写一本书、学会一门乐器、去某个地方生活...',
    estimatedTime: '2分钟',
    skipable: true,
  },
  {
    id: 'values',
    stage: 1,
    text: '对你来说最重要的是什么？',
    subtext: '选择3-5个对你而言最重要的价值观',
    type: 'multi-select',
    options: ['自由', '成就', '亲密关系', '安全感', '创造力', '影响力', '成长', '平衡', '冒险', '稳定', '意义', '快乐'],
    estimatedTime: '1分钟',
    skipable: false,
  },
  {
    id: 'ideal-day',
    stage: 1,
    text: '描述一个你理想中的普通一天',
    subtext: '从早晨醒来到晚上入睡，你想如何度过这一天？',
    type: 'input',
    placeholder: '比如：睡到自然醒，在喜欢的咖啡馆工作一个小时，下午去运动，晚上和家人朋友吃饭...',
    estimatedTime: '2分钟',
    skipable: true,
  },
  {
    id: 'unique-talent',
    stage: 1,
    text: '你有没有什么事是你做得特别好的，或者别人经常夸你的？',
    subtext: '那些你习以为常但别人眼中很珍贵的能力',
    type: 'input',
    placeholder: '比如：特别擅长沟通协调，或者有很强的洞察力，或者善于发现别人的优点...',
    estimatedTime: '1分钟',
    skipable: true,
  },
];

// Stage 2 Steps
export const stage2Steps: Stage2Step[] = [
  {
    id: 'time-travel',
    title: '时间旅行',
    description: '让我们一起踏上一段想象的旅程',
    type: 'projection',
    prompt: '请闭上眼睛，想象「如果一切保持现状，5年后的你会是什么样？」\n\n请详细描述：\n- 你会在哪里生活？\n- 从事什么工作？\n- 和谁在一起？\n- 你的生活状态如何？\n- 你的感受是什么？',
  },
  {
    id: 'letter-exchange',
    title: '十年版对话',
    description: '与未来的自己进行一次跨越时空的对话',
    type: 'letter',
    prompt: '现在，请给10年后的自己写一封信。\n\n写下你想说的话：\n- 你现在在经历什么？\n- 你对未来的自己有什么期待或问题？\n- 你想请教什么？\n\n写完后，想象你收到了来自未来自己的回信。请描述这封回信的内容——那个更成熟、更有智慧的你会对你说什么？',
  },
  {
    id: 'anti-vision',
    title: '反愿景定义',
    description: '明确你不想要的人生',
    type: 'definition',
    prompt: '基于前面的想象，现在请提炼出你的「反愿景」——\n\n那些你「绝对不想成为」的样子，「绝对不想过的」生活。\n\n请用3-5句话描述你的反愿景。\n\n比如：「我不想成为一个每天抱怨却不愿改变的人，不想过那种一眼就能看到尽头的生活，不想为了安全感而放弃所有的可能性...」',
  },
];

// Life Values Options
export const lifeValuesOptions = [
  { value: 'freedom', label: '自由', description: '能够自主选择想要的生活' },
  { value: 'achievement', label: '成就', description: '达成目标，获得认可' },
  { value: 'relationship', label: '亲密关系', description: '与重要的人建立深厚连接' },
  { value: 'security', label: '安全感', description: '稳定、可预期、有保障' },
  { value: 'creativity', label: '创造力', description: '创造新的东西，表达自我' },
  { value: 'influence', label: '影响力', description: '影响他人，改变世界' },
  { value: 'growth', label: '成长', description: '不断学习，持续进步' },
  { value: 'balance', label: '平衡', description: '工作与生活的和谐' },
  { value: 'adventure', label: '冒险', description: '探索未知，挑战极限' },
  { value: 'stability', label: '稳定', description: '平静、有序、可掌控' },
  { value: 'meaning', label: '意义', description: '做有意义的事' },
  { value: 'happiness', label: '快乐', description: '享受生活，感受幸福' },
];
