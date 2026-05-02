'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Wand2, ChevronRight, Sparkles, TrendingUp, RefreshCw, Heart } from 'lucide-react';
import { useJourney } from '@/context/journey-context';
import { ProgressBar } from '@/components/progress-bar';
import { LifeVersion, LifeVersionType } from '@/lib/types';

const defaultLifeVersions: LifeVersion[] = [
  {
    id: 'stable',
    type: 'stable',
    title: '稳定进阶版',
    tagline: '深耕当下，稳步前行',
    elements: ['在现有领域持续精进', '建立专业声誉', '稳步晋升或创业', '平衡工作与生活'],
    benefits: ['稳定的经济基础', '积累的专业经验', '可控的风险'],
    challenges: ['可能的舒适区陷阱', '成长天花板', '变化较少'],
    isCustomized: false,
  },
  {
    id: 'pivot',
    type: 'pivot',
    title: '转身切换版',
    tagline: '换个方向，依然精彩',
    elements: ['转向相关但不同的领域', '利用现有技能迁移', '开拓新的可能性', '适度冒险'],
    benefits: ['新的挑战与成长', '视野拓宽', '更多可能性'],
    challenges: ['需要学习新技能', '可能面临转型阵痛', '不确定结果'],
    isCustomized: false,
  },
  {
    id: 'wild',
    type: 'wild',
    title: '疯狂自由版',
    tagline: '追随内心，无限可能',
    elements: ['完全追随内心渴望', '创业或独立探索', '打破常规限制', '创造全新的路径'],
    benefits: ['极致的自我实现', '无尽可能', '深刻的人生体验'],
    challenges: ['高度不确定性', '需要强大的心理素质', '可能的经济压力'],
    isCustomized: false,
  },
];

const versionIcons: Record<LifeVersionType, React.ReactNode> = {
  stable: <TrendingUp className="w-6 h-6" />,
  pivot: <RefreshCw className="w-6 h-6" />,
  wild: <Sparkles className="w-6 h-6" />,
};

const versionColors: Record<LifeVersionType, string> = {
  stable: 'border-accent-success/30 bg-accent-success/5',
  pivot: 'border-accent-secondary/30 bg-accent-secondary/5',
  wild: 'border-accent-primary/30 bg-accent-primary/5',
};

export default function Stage3Page() {
  const router = useRouter();
  const { state, dispatch, goToStage } = useJourney();
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lifeVersions, setLifeVersions] = useState<LifeVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [integratedPlan, setIntegratedPlan] = useState('');
  const [showIntegration, setShowIntegration] = useState(false);

  // Initialize
  useEffect(() => {
    if (state.stage !== 3) {
      if (state.stage === 2 && state.progress.stage2Completed) {
        // Show intro
        setIsLoading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
        dispatch({ type: 'SET_STAGE', payload: 3 });
      } else {
        router.replace('/journey');
      }
    } else {
      setIsLoading(false);
      // Load existing versions if any
      if (state.userData.lifeVersions.length > 0) {
        setLifeVersions(state.userData.lifeVersions);
      }
    }
  }, [state.stage, state.progress.stage2Completed, state.userData.lifeVersions, dispatch, router]);

  const handleGenerateVersions = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Call API to generate personalized versions
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: 3,
          step: 0,
          messages: [],
          userData: {
            answers: state.userData.answers,
            antiVision: state.userData.antiVision,
          },
          action: 'generate',
        }),
      });

      if (!response.ok) throw new Error('API error');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      let generatedContent = '';
      const decoder = new TextDecoder();

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
                generatedContent += data.content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // For now, use default versions (in production, parse generatedContent)
      setLifeVersions(defaultLifeVersions);
      dispatch({ type: 'SET_LIFE_VERSIONS', payload: defaultLifeVersions });
    } catch (error) {
      console.error('Error generating versions:', error);
      // Fallback to defaults
      setLifeVersions(defaultLifeVersions);
    } finally {
      setIsGenerating(false);
    }
  }, [state.userData, dispatch]);

  const toggleVersion = (versionId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(versionId)
        ? prev.filter((id) => id !== versionId)
        : [...prev, versionId]
    );
  };

  const handleCreateIntegration = () => {
    if (selectedVersions.length === 0) return;
    setShowIntegration(true);
  };

  const handleSubmitIntegration = () => {
    if (!integratedPlan.trim()) return;

    dispatch({
      type: 'SET_INTEGRATED_PLAN',
      payload: {
        selectedVersions,
        combinedElements: selectedVersions.flatMap(
          (id) => lifeVersions.find((v) => v.id === id)?.elements || []
        ),
        reasoning: integratedPlan,
      },
    });

    dispatch({ type: 'COMPLETE_STAGE', payload: 3 });
    setTimeout(() => {
      goToStage(4);
    }, 1500);
  };

  const handleBack = () => {
    router.push('/');
  };

  if (state.stage !== 3) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">正在加载...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-accent-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wand2 className="w-8 h-8 text-accent-primary" />
          </div>
          <h2 className="text-xl font-serif text-text-primary mb-2">三种可能人生</h2>
          <p className="text-text-secondary">正在为你生成专属的人生版本...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <Home className="w-5 h-5" />
            </button>
            <div className="text-center">
              <span className="text-sm font-medium text-text-primary">阶段三</span>
              <span className="text-text-muted text-sm ml-2">三种可能</span>
            </div>
            <div className="w-10" />
          </div>
        </div>
        <ProgressBar currentStage={3} progress={state.progress} />
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {!showIntegration ? (
          <>
            {/* Intro */}
            <div className="text-center mb-12 animate-fade-in-up">
              <h1 className="text-3xl lg:text-4xl font-serif font-medium mb-4">
                <span className="text-gradient">发现三种可能</span>
              </h1>
              <p className="text-text-secondary max-w-2xl mx-auto">
                基于你的灵魂快照和反愿景，我为你设计了三种不同的人生版本。
                请仔细审视，选择最吸引你的，或者组合多个版本的元素。
              </p>
            </div>

            {/* Generate Button */}
            {lifeVersions.length === 0 && (
              <div className="text-center mb-12">
                <button
                  onClick={handleGenerateVersions}
                  disabled={isGenerating}
                  className="btn btn-primary px-8 py-4 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>生成中...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>生成我的三种可能</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Life Version Cards */}
            {lifeVersions.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {lifeVersions.map((version, index) => {
                  const isSelected = selectedVersions.includes(version.id);
                  return (
                    <div
                      key={version.id}
                      className={`
                        card cursor-pointer transition-all duration-300 animate-fade-in-up
                        ${versionColors[version.type]}
                        ${isSelected ? 'glow-border scale-[1.02]' : ''}
                        ${index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : 'stagger-3'}
                      `}
                      style={{ opacity: 0 }}
                      onClick={() => toggleVersion(version.id)}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              version.type === 'stable'
                                ? 'bg-accent-success/20 text-accent-success'
                                : version.type === 'pivot'
                                  ? 'bg-accent-secondary/20 text-accent-secondary'
                                  : 'bg-accent-primary/20 text-accent-primary'
                            }`}
                          >
                            {versionIcons[version.type]}
                          </div>
                          <div>
                            <h3 className="font-medium text-text-primary">{version.title}</h3>
                            <p className="text-sm text-text-muted">{version.tagline}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Elements */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-text-muted mb-2">关键要素</p>
                          <ul className="space-y-1">
                            {version.elements.map((el, i) => (
                              <li key={i} className="text-sm text-text-secondary flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                                {el}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-xs text-accent-success mb-1">潜在收益</p>
                            <ul className="space-y-0.5">
                              {version.benefits.map((b, i) => (
                                <li key={i} className="text-xs text-text-muted">{b}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs text-accent-warning mb-1">可能挑战</p>
                            <ul className="space-y-0.5">
                              {version.challenges.map((c, i) => (
                                <li key={i} className="text-xs text-text-muted">{c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selection Action */}
            {lifeVersions.length > 0 && (
              <div className="text-center animate-fade-in">
                <p className="text-text-secondary mb-4">
                  已选择 {selectedVersions.length} 个版本
                </p>
                <button
                  onClick={handleCreateIntegration}
                  disabled={selectedVersions.length === 0}
                  className="btn btn-primary px-8 py-3"
                >
                  <Heart className="w-5 h-5" />
                  <span>创建我的整合方案</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Integration View */
          <div className="max-w-2xl mx-auto animate-fade-in-up">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-medium mb-2">整合方案</h2>
              <p className="text-text-secondary">
                基于你的选择，请描述你想要整合的个性化人生方向
              </p>
            </div>

            {/* Selected Versions Summary */}
            <div className="card mb-6">
              <p className="text-sm text-text-muted mb-3">你的选择</p>
              <div className="flex flex-wrap gap-2">
                {selectedVersions.map((id) => {
                  const version = lifeVersions.find((v) => v.id === id);
                  return (
                    <span key={id} className="badge">
                      {version?.title}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Integration Input */}
            <div className="card">
              <label className="block mb-4">
                <span className="text-text-primary font-medium">你的整合方案</span>
                <p className="text-sm text-text-muted mt-1">
                  请描述你想要的人生：结合了哪些版本的哪些元素？为什么这样选择？
                </p>
              </label>
              <textarea
                className="input min-h-[200px]"
                placeholder="比如：我想要在稳定的基础上增加一些冒险元素，具体来说..."
                value={integratedPlan}
                onChange={(e) => setIntegratedPlan(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowIntegration(false)}
                className="btn btn-secondary"
              >
                返回查看版本
              </button>
              <button
                onClick={handleSubmitIntegration}
                disabled={!integratedPlan.trim()}
                className="btn btn-primary px-8"
              >
                确认并继续
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-orb gradient-orb-purple w-[500px] h-[500px] top-0 -right-64 opacity-15" />
        <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] -bottom-48 -left-48 opacity-10" />
      </div>
    </div>
  );
}
