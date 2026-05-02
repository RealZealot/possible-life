'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Clock, BookOpen, Heart, Target } from 'lucide-react';
import { useJourney } from '@/context/journey-context';

export default function HomePage() {
  const router = useRouter();
  const { startJourney, loadProgress, state } = useJourney();
  const [mounted, setMounted] = useState(false);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasProgress = loadProgress();
    setShowResume(hasProgress);
  }, [loadProgress]);

  const handleStart = () => {
    startJourney();
    router.push('/journey');
  };

  const handleResume = () => {
    router.push('/journey');
  };

  const features = [
    {
      icon: Clock,
      title: '约45分钟',
      description: '轻松完成的对话式体验',
    },
    {
      icon: BookOpen,
      title: '四阶段探索',
      description: '从自我认知到行动计划',
    },
    {
      icon: Heart,
      title: 'AI陪伴',
      description: '温暖而有洞察的引导',
    },
    {
      icon: Target,
      title: '三种可能',
      description: '发现属于你的整合方案',
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="stars-bg" />
      <div className="gradient-orb gradient-orb-purple w-[600px] h-[600px] -top-48 -left-48 opacity-30" />
      <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] top-1/2 -right-32 opacity-20" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-5xl lg:text-7xl font-serif font-bold mb-4">
            <span className="text-gradient">可能人生</span>
          </h1>
          <p className="text-xl lg:text-2xl text-text-secondary max-w-2xl mx-auto">
            一场45分钟的AI引导式对话
            <br />
            帮助你发现三种可能的人生方向
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`
                  card text-center animate-fade-in-up
                  ${mounted ? `stagger-${index + 1}` : ''}
                `}
                style={{ opacity: 0 }}
              >
                <Icon className="w-6 h-6 text-accent-primary mx-auto mb-3" />
                <h3 className="font-medium text-text-primary mb-1">{feature.title}</h3>
                <p className="text-xs text-text-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
          {showResume ? (
            <>
              <button onClick={handleResume} className="btn btn-primary px-8 py-4 text-lg">
                <span>继续我的旅程</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={handleStart} className="btn btn-secondary px-8 py-4 text-lg">
                重新开始
              </button>
            </>
          ) : (
            <button onClick={handleStart} className="btn btn-primary px-10 py-5 text-lg group">
              <span>开始探索</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Journey Stages Preview */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 text-sm text-text-muted">
            <span className="badge">阶段一：灵魂快照</span>
            <span className="badge">阶段二：反愿景</span>
            <span className="badge">阶段三：三种可能</span>
            <span className="badge">阶段四：未来对话</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-12 text-center text-sm text-text-muted">
          <p>没有对错，只有发现</p>
          <p className="mt-1">准备好与自己来一场深度对话了吗？</p>
        </div>
      </div>
    </div>
  );
}
