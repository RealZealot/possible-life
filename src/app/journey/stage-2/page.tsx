'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Send, ChevronRight } from 'lucide-react';
import { useJourney } from '@/context/journey-context';
import { ProgressBar } from '@/components/progress-bar';
import { ChatBubble } from '@/components/chat-bubble';
import { TextInputArea } from '@/components/text-input-area';
import { stage2Steps } from '@/lib/types';

export default function Stage2Page() {
  const router = useRouter();
  const { state, dispatch, goToStage } = useJourney();
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepData, setCurrentStepData] = useState({
    projection: '',
    letterToFuture: '',
    letterFromFuture: '',
    antiVisionStatement: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentStep = stage2Steps[step];

  // Initialize
  useEffect(() => {
    if (state.stage !== 2) {
      if (state.stage === 1 && state.progress.stage1Completed) {
        // Stage 1 just completed, show intro
        setIsLoading(true);
        setTimeout(() => {
          setMessages([
            {
              role: 'assistant',
              content: `欢迎来到「反愿景」环节。

接下来的8分钟，我们将通过一个特殊的练习，帮助你明确自己「不想成为」的样子。

有时候，明确知道自己不想要什么，反而能让我们更清楚地知道自己想要什么。

让我们开始第一步——时间旅行。`,
            },
          ]);
          setIsLoading(false);
        }, 1000);
        dispatch({ type: 'SET_STAGE', payload: 2 });
      } else {
        router.replace('/journey');
      }
    }
  }, [state.stage, state.progress.stage1Completed, dispatch, router]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    // Save step data based on current step
    if (step === 0) {
      setCurrentStepData((prev) => ({ ...prev, projection: userMessage }));
    } else if (step === 1) {
      if (!currentStepData.letterToFuture) {
        setCurrentStepData((prev) => ({ ...prev, letterToFuture: userMessage }));
        // Prompt for response
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `很好，请现在想象你收到了来自未来自己的回信。那个更成熟、更有智慧的你，会对现在的自己说什么？请描述这封回信的内容。`,
            },
          ]);
          setIsLoading(false);
        }, 500);
        return;
      } else {
        setCurrentStepData((prev) => ({ ...prev, letterFromFuture: userMessage }));
      }
    } else if (step === 2) {
      setCurrentStepData((prev) => ({ ...prev, antiVisionStatement: userMessage }));
    }

    // Generate AI response
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 2,
          step,
          messages: [{ role: 'user', content: userMessage }],
          userData: { antiVision: currentStepData },
          action: 'reflect',
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let assistantMessage = '';
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

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

      // Move to next step after delay
      setTimeout(() => {
        if (step < 2) {
          setStep(step + 1);
          const nextStepPrompt = getNextStepPrompt(step + 1);
          if (nextStepPrompt) {
            setMessages((prev) => [
              ...prev,
              { role: 'assistant', content: nextStepPrompt },
            ]);
          }
        } else {
          // Stage complete
          dispatch({ type: 'COMPLETE_STAGE', payload: 2 });
          dispatch({
            type: 'UPDATE_ANTI_VISION',
            payload: currentStepData,
          });
          setTimeout(() => {
            goToStage(3);
          }, 2000);
        }
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，我需要一点时间来思考。让我们继续这个练习。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, step, currentStepData, dispatch, goToStage]);

  const getNextStepPrompt = (nextStep: number): string => {
    if (nextStep === 1) {
      return `非常好，你已经描绘出了时间线上的自己。

现在，让我们进行一个更有趣的练习——「十年版对话」。

第一步：给10年后的自己写一封信。

请写下你想对未来的自己说的话：
- 你现在正在经历什么？
- 你对未来有什么期待或担忧？
- 你有什么问题想问未来的自己？`;
    }
    if (nextStep === 2) {
      return `很好。现在，请想象你收到了来自未来自己的回信。

那个更成熟、更有智慧、经历了更多人生的你，会对现在的自己说什么？

请描述这封回信的内容和情感。`;
    }
    return '';
  };

  const handleBack = () => {
    router.push('/');
  };

  if (state.stage !== 2) {
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
              <span className="text-sm font-medium text-text-primary">阶段二</span>
              <span className="text-text-muted text-sm ml-2">反愿景</span>
            </div>
            <div className="badge">
              <ChevronRight className="w-3 h-3" />
              <span>{currentStep?.title}</span>
            </div>
          </div>
        </div>
        <ProgressBar currentStage={2} progress={state.progress} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Progress */}
        <div className="flex gap-3 mb-6">
          {stage2Steps.map((s, i) => (
            <div
              key={s.id}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-accent-primary' : 'bg-bg-elevated'
              }`}
            />
          ))}
        </div>

        {/* Current Step Info */}
        {currentStep && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-xl font-serif font-medium text-text-primary">
              {currentStep.title}
            </h2>
            <p className="text-text-secondary mt-1">{currentStep.description}</p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto max-h-[50vh] pb-4">
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              role={msg.role}
              content={msg.content}
              isTyping={isLoading && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mt-auto pt-4">
          {step < 3 && (
            <div className="flex gap-3">
              <div className="flex-1">
                <TextInputArea
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSubmit}
                  placeholder={currentStep?.prompt?.split('\n')[0] || '写下你的想法...'}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-fade-in">
              <div className="card glow-border inline-block">
                <p className="text-text-primary font-medium mb-2">阶段二完成</p>
                <p className="text-text-secondary text-sm">
                  你的反愿景已记录，准备进入下一阶段...
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] -bottom-48 -right-48 opacity-20" />
      </div>
    </div>
  );
}
