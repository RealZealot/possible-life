import { NextRequest, NextResponse } from 'next/server';
import {
  sessionPrompts,
  formatPrompt,
  containsDangerSignal,
} from '@/lib/prompts';
import { ChatRequest } from '@/lib/types';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const MODEL_ID = 'deepseek-chat';

export async function POST(request: NextRequest) {
  try {
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const body: ChatRequest = await request.json();
    const { stage, step, messages, userData, action } = body;

    // Determine the prompt based on action and stage
    let prompt = '';
    let systemPrompt = '';

    switch (action) {
      case 'intro':
        systemPrompt = getIntroSystemPrompt(stage);
        prompt = getIntroPrompt(stage);
        break;
      case 'question':
        systemPrompt = getQuestionSystemPrompt(stage, step);
        prompt = getQuestionPrompt(stage, step);
        break;
      case 'summarize':
        systemPrompt = getSummarizeSystemPrompt(stage);
        prompt = getSummarizePrompt(stage, userData);
        break;
      case 'generate':
        systemPrompt = getGenerateSystemPrompt();
        prompt = getGeneratePrompt(userData);
        break;
      case 'dialogue':
        systemPrompt = getDialogueSystemPrompt();
        prompt = getDialoguePrompt(stage, messages, userData);
        break;
      case 'reflect':
        systemPrompt = getReflectSystemPrompt();
        prompt = getReflectPrompt(messages);
        break;
      case 'anti-vision':
        systemPrompt = getAntiVisionSystemPrompt();
        prompt = getAntiVisionPrompt(messages);
        break;
      case 'report':
        systemPrompt = getReportSystemPrompt();
        prompt = getReportPrompt(userData);
        break;
      case 'advice':
        systemPrompt = getAdviceSystemPrompt();
        prompt = getAdvicePrompt(userData);
        break;
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Build messages array
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    // Call DeepSeek API with streaming
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL_ID,
              messages: chatMessages,
              temperature: 0.8,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No reader');

          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.choices?.[0]?.delta?.content) {
                    const content = data.choices[0].delta.content;
                    const output = JSON.stringify({
                      type: 'chunk',
                      content,
                    });
                    controller.enqueue(encoder.encode(`data: ${output}\n\n`));
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          const data = JSON.stringify({
            type: 'error',
            error: errorMessage,
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

function getIntroSystemPrompt(stage: number | string | null): string {
  return `你是「可能人生」的人生设计教练，一位充满智慧与温暖的长者。
你的风格：温暖而有洞察力，像一位值得信赖的老朋友。
语言富有诗意但不做作，善于提问而非直接给答案。

当前环节：${getStageName(stage)} 引导介绍`;
}

function getQuestionSystemPrompt(stage: number | string | null, step: number): string {
  return `你是「可能人生」的人生设计教练。
当前环节：${getStageName(stage)} - 第 ${step + 1} 个问题
严格规则：每次只问一个问题，不要连续追问。等待用户回答后再继续。`;
}

function getSummarizeSystemPrompt(stage: number | string | null): string {
  return `你是「可能人生」的人生设计教练，擅长提炼洞察和总结要点。
你的总结应该：
- 温暖而有洞察力
- 提炼出3-5个核心发现
- 帮助用户更清晰地认识自己
- 语言简洁但有深度`;
}

function getGenerateSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练，专注于人生可能性设计。
你的任务是：根据用户分享的信息，生成三个具体、可信、富有吸引力的人生版本。
每个版本必须包含：
- 一个吸引人的标题
- 一句精炼的标语（15字以内）
- 3-5个关键要素
- 2-3个潜在收益
- 2-3个可能的挑战
- 一句话总结

语言要生动、有画面感，让用户能够真正想象这些人生。`;
}

function getDialogueSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练，现在扮演60岁的"未来自我"。
你充满智慧、对自己的人生感到满意和感恩。
你理解年轻人面对的困惑和挣扎，愿意分享自己的经验和建议。
你的回复应该：
- 先对用户的问题表示理解和共情
- 分享你曾经类似的经历或思考
- 提供具体而可操作的建议
- 保持对话的自然流畅
- 适时分享洞见而非说教`;
}

function getReflectSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练。
你的任务是帮助用户反思和提炼刚才对话的要点。
保持温暖、支持的态度，引导用户思考。`;
}

function getAntiVisionSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练，专注于帮助用户明确自己不想追求的方向。
你的任务是：基于用户之前的分享，帮助他们提炼出清晰、有力的"反愿景"。
反愿景不是抱怨，而是对"我不想成为什么样的人"的清醒认知。
你的回复应该：
- 总结用户在时间旅行中描述的未来场景
- 提炼出3-5个核心的"反"要素
- 用温暖但直接的语言表述
- 帮助用户清晰地认识自己不想追求的方向`;
}

function getReportSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练，现在要为用户生成完整的人生设计报告。
报告应该：
- 语言温暖而有力量
- 结构清晰、层次分明
- 具体而可执行
- 富有洞察和启发
- 长度适中（500-800字）
- 最后要有激励性的结尾`;
}

function getAdviceSystemPrompt(): string {
  return `你是「可能人生」的人生设计教练，以60岁"未来自我"的身份给出行动建议。
你的建议应该：
- 具体而可操作
- 分为立即行动（本周）、短期目标（30天）、长期方向
- 带有鼓励和信任
- 简洁有力`;
}

function getStageName(stage: number | string | null): string {
  const names: Record<string, string> = {
    '1': '灵魂快照',
    '2': '反愿景',
    '3': '三种可能人生',
    '4': '与未来自我对话',
  };
  return names[String(stage)] || '未知阶段';
}

function getIntroPrompt(stage: number | string | null): string {
  const prompts: Record<string, string> = {
    '1': sessionPrompts.stage1Intro,
    '2': sessionPrompts.stage2Intro,
    '3': sessionPrompts.stage3Intro,
    '4': sessionPrompts.stage4Intro,
  };
  return prompts[String(stage)] || '欢迎来到可能人生。';
}

function getQuestionPrompt(stage: number | string | null, step: number): string {
  return `请继续第 ${step + 1} 个问题。`;
}

function getSummarizePrompt(stage: number | string | null, userData: any): string {
  if (stage === 1) {
    const { answers } = userData;
    return formatPrompt(sessionPrompts.stage1Summarize, {
      statusScore: answers?.statusScore ?? '未提供',
      energySources: answers?.energySources || '未提供',
      choiceDilemma: answers?.choiceDilemma || '未提供',
      fearVisualization: answers?.fearVisualization || '未提供',
      dreamFragments: answers?.dreamFragments || '未提供',
      values: answers?.values || [],
      idealDay: answers?.idealDay || '未提供',
      uniqueTalent: answers?.uniqueTalent || '未提供',
    });
  }

  if (stage === 2) {
    const { antiVision } = userData;
    return formatPrompt(sessionPrompts.stage2Summarize, {
      futureProjection: antiVision?.futureProjection || '未提供',
      letterContent: `${antiVision?.letterToFuture || ''}\n\n---\n\n${antiVision?.letterFromFuture || ''}`,
      antiVisionStatement: antiVision?.antiVisionStatement || '未提供',
    });
  }

  return '请为用户提炼核心发现。';
}

function getGeneratePrompt(userData: any): string {
  const { answers, antiVision } = userData;

  return formatPrompt(sessionPrompts.stage3Generate, {
    soulSnapshot: `
状态评分：${answers?.statusScore ?? '?'}/10
能量来源：${answers?.energySources || '未知'}
核心纠结：${answers?.choiceDilemma || '未知'}
恐惧事项：${answers?.fearVisualization || '未知'}
梦想碎片：${answers?.dreamFragments || '未知'}
核心价值观：${(answers?.values || []).join('、')}
理想一天：${answers?.idealDay || '未知'}
独特天赋：${answers?.uniqueTalent || '未知'}
    `.trim(),
    antiVision: antiVision?.antiVisionStatement || '未知',
  });
}

function getDialoguePrompt(stage: number | string | null, messages: any[], userData: any): string {
  const { integratedPlan } = userData;

  // Check for danger signals
  if (messages.length > 0) {
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    if (lastUserMessage && containsDangerSignal(lastUserMessage.content)) {
      return sessionPrompts.dangerSignal;
    }
  }

  if (stage === 4) {
    return formatPrompt(sessionPrompts.stage4Dialogue, {
      coreConcerns: integratedPlan?.reasoning || '帮助用户明确人生方向',
      integratedPlan: integratedPlan?.combinedElements?.join('、') || '探索中',
    });
  }

  const conversationHistory = messages
    .map((m: any) => `${m.role === 'user' ? '用户' : '我'}：${m.content}`)
    .join('\n');

  return `对话历史：
${conversationHistory}

请继续这个对话，以60岁"未来自我"的身份回应。`;
}

function getReflectPrompt(messages: any[]): string {
  const conversationHistory = messages
    .map((m: any) => `${m.role === 'user' ? '用户' : '我'}：${m.content}`)
    .join('\n');

  return `请基于以下对话，帮助用户提炼反思：

${conversationHistory}

请总结关键洞察，帮助用户更清晰地认识自己。`;
}

function getAntiVisionPrompt(messages: any[]): string {
  const { antiVision } = messages.length > 0 ? messages[messages.length - 1] : {};

  if (antiVision?.futureProjection) {
    return `基于用户在时间旅行中的描述：
"${antiVision.futureProjection}"

请提炼出清晰、有力的反愿景。
用户不想成为什么样的人？不想过什么样的生活？`;
  }

  return '请帮助用户明确反愿景。';
}

function getReportPrompt(userData: any): string {
  const { answers, antiVision, lifeVersions, integratedPlan, actionSuggestions } = userData;

  return formatPrompt(sessionPrompts.reportGenerate, {
    soulSnapshot: `
状态评分：${answers?.statusScore ?? '?'}/10
能量来源：${answers?.energySources || '未知'}
核心纠结：${answers?.choiceDilemma || '未知'}
恐惧事项：${answers?.fearVisualization || '未知'}
梦想碎片：${answers?.dreamFragments || '未知'}
核心价值观：${(answers?.values || []).join('、')}
理想一天：${answers?.idealDay || '未知'}
独特天赋：${answers?.uniqueTalent || '未知'}
    `.trim(),
    antiVision: antiVision?.antiVisionStatement || '未知',
    lifeVersions: lifeVersions
      ?.map((v: { title: string; tagline: string }) => `${v.title}：${v.tagline}`)
      .join('\n') || '未知',
    integratedPlan: integratedPlan?.reasoning || '未知',
    actionPlan: actionSuggestions
      ?.map((a: { title: string; description: string }) => `${a.title}：${a.description}`)
      .join('\n') || '暂无建议',
  });
}

function getAdvicePrompt(userData: any): string {
  const { integratedPlan, actionSuggestions } = userData;

  return formatPrompt(sessionPrompts.stage4FinalAdvice, {
    integratedPlan: integratedPlan?.reasoning || '探索中',
    existingSuggestions: actionSuggestions?.length
      ? actionSuggestions.map((a: { title: string }) => a.title).join('、')
      : '暂无',
  });
}