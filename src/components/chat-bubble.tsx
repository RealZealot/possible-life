'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTyping?: boolean;
}

export function ChatBubble({ role, content, isTyping }: ChatBubbleProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (role === 'assistant' && !isTyping) {
      setIsAnimating(true);
      let index = 0;
      const timer = setInterval(() => {
        if (index <= content.length) {
          setDisplayedContent(content.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setIsAnimating(false);
        }
      }, 20);

      return () => clearInterval(timer);
    } else {
      setDisplayedContent(content);
    }
  }, [content, role, isTyping]);

  if (role === 'system') {
    return null;
  }

  const isUser = role === 'user';

  return (
    <div
      ref={containerRef}
      className={`flex items-start gap-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-accent-primary/20 text-accent-primary'
            : 'bg-bg-elevated text-text-secondary'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div
        className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-accent-primary text-white rounded-tr-md'
              : 'bg-bg-card text-text-primary rounded-tl-md border border-accent-primary/10'
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">
            {displayedContent}
            {isAnimating && (
              <span className="inline-block w-2 h-4 ml-1 bg-accent-primary animate-pulse" />
            )}
          </p>
          {isTyping && !displayedContent && (
            <div className="flex items-center gap-1 mt-2">
              <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
