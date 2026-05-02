'use client';

import { useState } from 'react';

interface ScoreInputProps {
  value: number | null;
  onChange: (value: number) => void;
  onSubmit: (score: number) => void;
}

export function ScoreInput({ value, onChange, onSubmit }: ScoreInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (score: number) => {
    onChange(score);
    // Pass score directly to avoid closure issues
    onSubmit(score);
  };

  return (
    <div className="py-8">
      <div className="flex items-center justify-center gap-2 lg:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
          const isSelected = value !== null && score <= value;
          const isHovered = hoverValue !== null && score <= hoverValue;
          const isExact = value === score;

          return (
            <button
              key={score}
              onClick={() => handleClick(score)}
              onMouseEnter={() => setHoverValue(score)}
              onMouseLeave={() => setHoverValue(null)}
              className={`
                w-10 h-10 lg:w-12 lg:h-12 rounded-xl font-display text-lg
                transition-all duration-300
                ${
                  isExact
                    ? 'bg-accent-primary text-white scale-110 glow-border'
                    : isSelected || isHovered
                      ? 'bg-accent-primary/30 text-accent-primary scale-105'
                      : 'bg-bg-elevated text-text-muted hover:bg-bg-card hover:text-text-secondary'
                }
              `}
            >
              {score}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-6 text-sm text-text-muted px-4">
        <span>最低谷</span>
        <span>巅峰状态</span>
      </div>

      {value !== null && (
        <p className="text-center mt-4 text-text-secondary animate-fade-in">
          你选择了 <span className="text-accent-primary font-display text-xl">{value}</span> 分
        </p>
      )}
    </div>
  );
}
