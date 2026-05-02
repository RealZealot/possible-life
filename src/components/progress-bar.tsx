'use client';

import { Sparkles, Target, Eye, MessageCircle } from 'lucide-react';
import { Stage } from '@/lib/types';

interface ProgressBarProps {
  currentStage: Stage;
  progress: {
    stage1Completed: boolean;
    stage2Completed: boolean;
    stage3Completed: boolean;
    stage4Completed: boolean;
  };
}

const stages = [
  { id: 1, label: '灵魂快照', icon: Sparkles, duration: '12分钟' },
  { id: 2, label: '反愿景', icon: Eye, duration: '8分钟' },
  { id: 3, label: '三种可能', icon: Target, duration: '15分钟' },
  { id: 4, label: '未来对话', icon: MessageCircle, duration: '10分钟' },
];

export function ProgressBar({ currentStage, progress }: ProgressBarProps) {
  const currentStageNum = typeof currentStage === 'number' ? currentStage : currentStage === 'report' ? 5 : 0;
  const progressMap = {
    stage1Completed: progress.stage1Completed,
    stage2Completed: progress.stage2Completed,
    stage3Completed: progress.stage3Completed,
    stage4Completed: progress.stage4Completed,
  };

  return (
    <div className="w-full px-4 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile: Simplified view */}
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stages[currentStageNum - 1] && (
              <>
                {(() => {
                  const Icon = stages[currentStageNum - 1].icon;
                  return <Icon className="w-5 h-5 text-accent-primary" />;
                })()}
                <span className="text-sm font-medium text-text-primary">
                  {stages[currentStageNum - 1].label}
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-text-muted">
            {currentStageNum > 0 && currentStageNum <= 4
              ? stages[currentStageNum - 1].duration
              : ''}
          </span>
        </div>

        {/* Desktop: Full progress bar */}
        <div className="hidden lg:flex items-center justify-between gap-4">
          {stages.map((stage, index) => {
            const isActive = currentStageNum === stage.id;
            const isCompleted =
              progressMap[`stage${stage.id}Completed` as keyof typeof progressMap];
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-accent-success text-white'
                        : isActive
                          ? 'bg-accent-primary text-white animate-pulse'
                          : 'bg-bg-elevated text-text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-medium transition-colors ${
                        isActive ? 'text-text-primary' : 'text-text-muted'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-xs text-text-muted">{stage.duration}</span>
                  </div>
                </div>

                {index < stages.length - 1 && (
                  <div className="flex-1 h-px bg-bg-elevated min-w-[60px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress indicator for active stage */}
        <div className="hidden lg:block mt-4">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{
                width: `${((currentStageNum - 1) / 4) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
