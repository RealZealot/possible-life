'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { lifeValuesOptions } from '@/lib/types';

interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  onSubmit: (selectedValues?: string[]) => void;
  maxSelect?: number;
}

export function MultiSelectInput({
  value,
  onChange,
  onSubmit,
  maxSelect = 5,
}: MultiSelectInputProps) {
  const [localValue, setLocalValue] = useState<string[]>(value);
  const [error, setError] = useState<string | null>(null);

  const toggleOption = (optionValue: string) => {
    setError(null);
    if (localValue.includes(optionValue)) {
      setLocalValue(localValue.filter((v) => v !== optionValue));
    } else {
      if (localValue.length >= maxSelect) {
        setError(`最多只能选择 ${maxSelect} 个`);
        return;
      }
      setLocalValue([...localValue, optionValue]);
    }
  };

  const handleSubmit = () => {
    if (localValue.length === 0) {
      setError('请至少选择一个');
      return;
    }
    onChange(localValue);
    // Pass localValue directly to avoid stale closure issue
    onSubmit(localValue);
  };

  return (
    <div className="py-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {lifeValuesOptions.map((option) => {
          const isSelected = localValue.includes(option.label);

          return (
            <button
              key={option.value}
              onClick={() => toggleOption(option.label)}
              className={`
                p-4 rounded-xl text-left transition-all duration-300
                ${
                  isSelected
                    ? 'bg-accent-primary/20 border-2 border-accent-primary text-text-primary'
                    : 'bg-bg-elevated border-2 border-transparent text-text-secondary hover:bg-bg-card hover:border-accent-primary/30'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-text-muted mt-1">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-accent-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-accent-danger text-sm mt-4 text-center animate-fade-in">
          {error}
        </p>
      )}

      <p className="text-center text-text-muted text-sm mt-6">
        已选择 {localValue.length}/{maxSelect} 个
      </p>

      {localValue.length > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            className="btn btn-primary px-8"
          >
            确认选择
          </button>
        </div>
      )}
    </div>
  );
}
