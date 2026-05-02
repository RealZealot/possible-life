'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Send, MessageCircle } from 'lucide-react';
import { useJourney } from '@/context/journey-context';
import { ProgressBar } from '@/components/progress-bar';
import { ChatBubble } from '@/components/chat-bubble';
import { containsDangerSignal } from '@/lib/prompts';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const initialMessages: Message[] = [
  {
    id: 'intro',
    role: 'assistant',
    content: `欢迎来到最后一个环节——「与未来的自己对话」。

接下来的10分钟，你将与60岁的「未来自我」进行一次深度对话。

那个经历过人生风雨、做出了许多选择的你，会以怎样的视角回望今天？会给你什么样的建议？

我会扮演60岁的你，一个充满智慧、对自己的人生感到满意和感恩的长者。

首先，请告诉我——你现在最想问我（60岁的你）什么问题？`,
  },
];

export default function Stage4Page() {
  const router = useRouter();
  const { state, dispatch, goToStage } = useJourney();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    if (state.stage !== 4) {
      if (state.stage === 3 && state.progress.stage3Completed) {
        dispatch({ type: 'SET_STAGE', payload: 4 });
        setMessages(initialMessages);
      } else {
        router.replace('/journey');
      }
    } else if (messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [state.stage, state.progress.stage3Completed, dispatch, router, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check for danger signals
    if (containsDangerSignal(inputValue)) {
      setMessages((prev) => [
        ...prev,
        { id: `user-${Date.now()}`, role: 'user', content: inputValue.trim() },
        {
          id: `danger-${Date.now()}`,
          role: 'assistant',
          content: `我注意到你分享的内容可能透露出一些深层的困惑或压力。

我想让你知道，你的感受是被看见的，你的困惑是完全正常的。

如果你愿意，我们可以继续探索这个话题。或者，如果你现在感觉不太好，也可以选择暂时休息一下。

记住，你不必独自面对这些。如果需要更专业的支持，这里有一些资源可能会帮助到你：
- 全国心理援助热线：400-161-9995
- 北京心理危机研究与干预中心：010-82951332

你希望怎么做？`,
        },
      ]);
      setInputValue('');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { id: `user-${Date.now()}`, role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 4,
          step: 0,
          messages: [{ role: 'user', content: userMessage }],
          userData: {
            answers: state.userData.answers,
            antiVision: state.userData.antiVision,
            integratedPlan: state.userData.integratedPlan,
          },
          action: 'dialogue',
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'chunk') {
                assistantMessage += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    id: newMessages[newMessages.length - 1].id,
                    role: 'assistant',
                    content: assistantMessage,
                  };
                  return newMessages;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Check if conversation should end
      if (messages.length >= 8) {
        // After enough exchanges, prompt for final action
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `final-${Date.now()}`,
              role: 'assistant',
              content: `我们的对话接近尾声了。在结束之前，我想给你一份最后的礼物——一个清晰、可行的行动建议。

请思考：基于今天的全部探索，你接下来最想做的第一件事是什么？

或者，如果你已经想好了，我们可以直接进入生成你的完整人生设计报告。`,
            },
          ]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，我需要一点时间来思考。让我们继续这个对话。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, state.userData, messages.length]);

  const handleFinish = () => {
    dispatch({ type: 'COMPLETE_STAGE', payload: 4 });
    setIsComplete(true);

    // Generate final action suggestions
    const suggestions = [
      {
        id: '1',
        title: '立即行动',
        description: '从今天开始，每周留出2小时专门思考人生方向',
        steps: ['确定每周固定的时间段', '关闭所有干扰', '回顾今天的发现'],
        priority: 'high' as const,
      },
      {
        id: '2',
        title: '30天挑战',
        description: '选择一个整合方案中的元素，开始小范围尝试',
        steps: ['确定尝试的具体行动', '设定可衡量的目标', '记录过程中的感受'],
        priority: 'medium' as const,
      },
      {
        id: '3',
        title: '长期方向',
        description: '寻找志同道合的社群或导师，获得支持',
        steps: ['搜索相关社群或组织', '联系可能的导师', '建立支持系统'],
        priority: 'low' as const,
      },
    ];

    dispatch({ type: 'SET_ACTION_SUGGESTIONS', payload: suggestions });

    setTimeout(() => {
      goToStage('report');
    }, 2000);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (state.stage !== 4) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">正在加载...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <Home className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-sm font-medium text-text-primary">阶段四</span>
              <span className="text-text-muted text-sm ml-2">未来对话</span>
            </div>
            <div className="badge">
              <MessageCircle className="w-3 h-3" />
              <span>与60岁的自己</span>
            </div>
          </div>
        </div>
        <ProgressBar currentStage={4} progress={state.progress} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Future Self Avatar */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/30">
            <div className="w-8 h-8 rounded-full bg-accent-primary/30 flex items-center justify-center">
              <span className="text-sm font-serif text-accent-primary">60</span>
            </div>
            <span className="text-sm text-text-secondary">你的未来自我</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh] pb-4">
          {messages.map((msg, i) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isTyping={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isComplete && (
          <div className="mt-auto pt-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.metaKey) {
                        handleSubmit();
                      }
                    }}
                    placeholder="写下你想问未来自己的问题..."
                    className="input pr-12 min-h-[60px] resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-3 bottom-3 w-10 h-10 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:bg-accent-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-text-muted mt-2 text-center">
                  ⌘ + Enter 发送 · {messages.length >= 8 ? '可以生成报告了' : '继续对话'}
                </p>
              </div>
            </div>

            {messages.length >= 6 && (
              <div className="text-center mt-4">
                <button
                  onClick={handleFinish}
                  className="btn btn-primary px-8"
                >
                  生成我的人生设计报告
                </button>
              </div>
            )}
          </div>
        )}

        {isComplete && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-accent-success/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-2">对话完成</h3>
            <p className="text-text-secondary">正在生成你的人生设计报告...</p>
          </div>
        )}
      </main>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-orb gradient-orb-purple w-[500px] h-[500px] top-1/4 -left-64 opacity-15" />
        <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] bottom-0 -right-48 opacity-10" />
      </div>
    </div>
  );
}
