'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
import { useJourney } from '@/context/journey-context';
import { ProgressBar } from '@/components/progress-bar';
import { QuestionCard } from '@/components/question-card';
import { ScoreInput } from '@/components/score-input';
import { MultiSelectInput } from '@/components/multi-select-input';
import { TextInputArea } from '@/components/text-input-area';
import { stage1Questions } from '@/lib/types';

export default function Stage1Page() {
  const router = useRouter();
  const { state, dispatch, submitAnswer, nextQuestion } = useJourney();
  const [inputValue, setInputValue] = useState('');
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize question if not set
  useEffect(() => {
    if (state.stage !== 1) {
      router.replace('/journey');
      return;
    }

    if (!state.currentQuestion) {
      dispatch({ type: 'SET_QUESTION', payload: stage1Questions[0] });
    }
  }, [state.stage, state.currentQuestion, dispatch, router]);

  const currentQuestion = state.currentQuestion;
  const currentIndex = stage1Questions.findIndex((q) => q.id === currentQuestion?.id);

  const handleSubmit = useCallback((directValue?: number | string[]) => {
    if (!currentQuestion) return;

    let answer: string | number | string[];

    switch (currentQuestion.type) {
      case 'score':
        // Use direct score if provided, otherwise fall back to state
        answer = (directValue as number) ?? selectedScore ?? 0;
        break;
      case 'multi-select':
        // Use direct values if provided, otherwise fall back to state
        answer = (directValue as string[]) ?? selectedValues;
        break;
      default:
        answer = inputValue.trim();
    }

    // Add message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `user-${Date.now()}`,
        role: 'user',
        content: String(answer),
        timestamp: Date.now(),
      },
    });

    // Clear inputs and submit
    setInputValue('');
    setSelectedScore(null);
    setSelectedValues([]);

    // Submit the answer
    submitAnswer(answer);
  }, [currentQuestion, selectedScore, selectedValues, inputValue, submitAnswer, dispatch]);

  const handleSkip = useCallback(() => {
    if (!currentQuestion?.skipable) return;

    // Clear inputs and move to next
    setInputValue('');
    setSelectedScore(null);
    setSelectedValues([]);
    
    nextQuestion();
  }, [currentQuestion, nextQuestion]);

  const handleBack = () => {
    router.push('/');
  };

  // Show loading when transitioning between stages
  if (!currentQuestion || state.stage !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">正在进入下一阶段...</p>
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
              <span className="text-sm font-medium text-text-primary">阶段一</span>
              <span className="text-text-muted text-sm ml-2">灵魂快照</span>
            </div>
            <div className="w-10" />
          </div>
        </div>
        <ProgressBar currentStage={1} progress={state.progress} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full">
          {/* Question Card */}
          <div
            className={`transition-all duration-400 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={stage1Questions.length}
              onSkip={handleSkip}
            />

            {/* Input based on question type */}
            {currentQuestion.type === 'score' && (
              <ScoreInput
                value={selectedScore}
                onChange={setSelectedScore}
                onSubmit={handleSubmit}
              />
            )}

            {currentQuestion.type === 'multi-select' && (
              <MultiSelectInput
                value={selectedValues}
                onChange={setSelectedValues}
                onSubmit={handleSubmit}
              />
            )}

            {(currentQuestion.type === 'input' || currentQuestion.type === 'dialogue') && (
              <TextInputArea
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSubmit}
                placeholder={currentQuestion.placeholder}
              />
            )}
          </div>

          {/* Completion hint */}
          <div className="mt-12 text-center">
            <div className="flex justify-center gap-2">
              {stage1Questions.map((q, i) => (
                <div
                  key={q.id}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < currentIndex
                      ? 'bg-accent-success'
                      : i === currentIndex
                        ? 'bg-accent-primary'
                        : 'bg-bg-elevated'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-orb gradient-orb-purple w-[400px] h-[400px] -bottom-48 -left-48 opacity-20" />
        <div className="gradient-orb gradient-orb-blue w-[300px] h-[300px] top-1/4 -right-32 opacity-10" />
      </div>
    </div>
  );
}
