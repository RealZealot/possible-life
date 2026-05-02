'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight } from 'lucide-react';

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function TextInputArea({
  value,
  onChange,
  onSubmit,
  placeholder = '在这里写下你的回答...',
  maxLength = 2000,
}: TextInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.9;
  const canSubmit = value.trim().length > 0;

  return (
    <div className="mt-6">
      <div
        className={`
          relative rounded-2xl transition-all duration-300
          ${isFocused ? 'ring-2 ring-accent-primary/50' : ''}
        `}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="input min-h-[120px] resize-none leading-relaxed"
          maxLength={maxLength}
        />

        {/* Bottom bar */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className={isNearLimit ? 'text-accent-warning' : ''}>
              {charCount}/{maxLength}
            </span>
            <span className="hidden sm:inline">⌘ + Enter 发送</span>
          </div>

          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="btn btn-primary px-4 py-2"
          >
            <span className="hidden sm:inline">发送</span>
            <span className="sm:hidden">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
