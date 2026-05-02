'use client';

import { Clock, ChevronRight } from 'lucide-react';
import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSkip?: () => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSkip,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="badge">
            问题 {questionNumber}/{totalQuestions}
          </span>
          <div className="flex items-center gap-1 text-text-muted text-sm">
            <Clock className="w-4 h-4" />
            <span>约{question.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h2 className="text-2xl lg:text-3xl font-serif font-medium text-text-primary leading-relaxed">
          {question.text}
        </h2>
        {question.subtext && (
          <p className="mt-3 text-text-secondary leading-relaxed">
            {question.subtext}
          </p>
        )}
      </div>

      {/* Skip button */}
      {question.skipable && onSkip && (
        <button
          onClick={onSkip}
          className="flex items-center gap-1 text-text-muted text-sm hover:text-text-secondary transition-colors mt-4"
        >
          <ChevronRight className="w-4 h-4" />
          <span>跳过这个问题</span>
        </button>
      )}
    </div>
  );
}
