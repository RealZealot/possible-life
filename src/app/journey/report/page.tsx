'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Home, Sparkles, Eye, Target, MessageCircle, 
  Download, Share2, ChevronDown, ChevronUp, RefreshCw,
  FileText, Clock, Heart, Rocket
} from 'lucide-react';
import { useJourney } from '@/context/journey-context';
import { Report } from '@/lib/types';

const sectionIcons: Record<string, React.ReactNode> = {
  'soul-snapshot': <Sparkles className="w-5 h-5" />,
  'anti-vision': <Eye className="w-5 h-5" />,
  'life-versions': <Target className="w-5 h-5" />,
  'action-plan': <Rocket className="w-5 h-5" />,
};

export default function ReportPage() {
  const router = useRouter();
  const { state, dispatch, resetJourney } = useJourney();
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['soul-snapshot', 'anti-vision', 'life-versions', 'action-plan'])
  );
  const [report, setReport] = useState<Report | null>(null);

  // Initialize
  useEffect(() => {
    if (state.stage !== 'report') {
      if (state.progress.stage4Completed) {
        dispatch({ type: 'SET_STAGE', payload: 'report' });
        generateReport();
      } else {
        router.replace('/journey');
      }
    } else if (!report && !state.userData.report) {
      generateReport();
    } else if (state.userData.report) {
      setReport(state.userData.report);
    }
  }, [state.stage, state.progress.stage4Completed, state.userData.report, dispatch, router, report]);

  const generateReport = async () => {
    setIsLoading(true);

    try {
      // In production, call API to generate report
      // For now, generate locally
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const generatedReport: Report = {
        generatedAt: Date.now(),
        soulSnapshotSummary: generateSoulSnapshotSummary(),
        antiVisionSummary: state.userData.antiVision.antiVisionStatement || 
          '你希望活出真实、有意义的人生，不愿被固定模式所束缚。',
        lifeVersionsSummary: generateLifeVersionsSummary(),
        integratedPlanSummary: state.userData.integratedPlan.reasoning ||
          '你选择了一条结合稳定与冒险的人生道路，在可控的风险中追求成长。',
        actionPlan: state.userData.actionSuggestions.length > 0
          ? state.userData.actionSuggestions
          : defaultActionSuggestions,
      };

      setReport(generatedReport);
      dispatch({ type: 'SET_REPORT', payload: generatedReport });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSoulSnapshotSummary = () => {
    const { answers } = state.userData;
    const highlights: string[] = [];

    if (answers.statusScore) {
      highlights.push(`当前状态评分 ${answers.statusScore}/10，处于${answers.statusScore >= 7 ? '较好' : answers.statusScore >= 4 ? '中等' : '需要调整'}的能量水平`);
    }

    if (answers.values.length > 0) {
      highlights.push(`核心价值观：${answers.values.slice(0, 3).join('、')}`);
    }

    if (answers.uniqueTalent) {
      highlights.push(`独特优势：${answers.uniqueTalent.slice(0, 50)}...`);
    }

    if (answers.dreamFragments) {
      highlights.push(`内心渴望：${answers.dreamFragments.slice(0, 50)}...`);
    }

    return highlights.length > 0
      ? highlights.join('。\n') + '。'
      : '你是一个正在寻求突破和自我实现的个体。';
  };

  const generateLifeVersionsSummary = () => {
    const { lifeVersions } = state.userData;
    if (lifeVersions.length === 0) return '';

    return lifeVersions
      .map((v) => `${v.title}：${v.tagline}`)
      .join('\n');
  };

  const defaultActionSuggestions = [
    {
      id: '1',
      title: '立即行动',
      description: '从今天开始，每周留出2小时专门思考人生方向',
      steps: ['确定每周固定的时间段', '关闭所有干扰', '回顾今天的发现'],
      priority: 'high' as const,
    },
    {
      id: '2',
      title: '30天挑战',
      description: '选择一个整合方案中的元素，开始小范围尝试',
      steps: ['确定尝试的具体行动', '设定可衡量的目标', '记录过程中的感受'],
      priority: 'medium' as const,
    },
  ];

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleDownload = () => {
    if (!report) return;

    const content = `
可能人生设计报告
================

生成时间：${new Date(report.generatedAt).toLocaleString('zh-CN')}

一、灵魂快照
${'='.repeat(20)}
${report.soulSnapshotSummary}

二、反愿景
${'='.repeat(20)}
${report.antiVisionSummary}

三、三种可能人生
${'='.repeat(20)}
${report.lifeVersionsSummary}

四、整合方案
${'='.repeat(20)}
${report.integratedPlanSummary}

五、行动建议
${'='.repeat(20)}
${report.actionPlan
  .map((a, i) => `${i + 1}. ${a.title}\n   ${a.description}\n   步骤：${a.steps.join(' → ')}`)
  .join('\n\n')}

---
这是你的人生，由你来设计。
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '可能人生设计报告.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const shareData = {
      title: '可能人生设计报告',
      text: '我刚刚完成了一次深度的人生探索，发现了三种可能的人生方向！',
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  const handleRestart = () => {
    if (confirm('确定要重新开始吗？这将清除当前所有进度。')) {
      resetJourney();
      router.push('/');
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  const sections = [
    { id: 'soul-snapshot', title: '灵魂快照', content: report?.soulSnapshotSummary || '' },
    { id: 'anti-vision', title: '反愿景', content: report?.antiVisionSummary || '' },
    { id: 'life-versions', title: '三种可能', content: report?.lifeVersionsSummary || '' },
    { id: 'action-plan', title: '行动建议', content: '', isActionPlan: true },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-6 animate-pulse">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-serif text-text-primary mb-2">正在生成报告</h2>
          <p className="text-text-secondary">整合你的全部探索成果...</p>
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
              <span className="text-sm font-medium text-text-primary">人生设计报告</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="btn btn-ghost p-2"
                title="下载报告"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="btn btn-ghost p-2"
                title="分享"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold mb-4">
            <span className="text-gradient">你的人生设计报告</span>
          </h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            基于45分钟的深度探索，这是一份关于你的可能人生的蓝图
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(report?.generatedAt || Date.now()).toLocaleDateString('zh-CN')}
            </span>
            <span className="badge badge-success">
              <Heart className="w-3 h-3" />
              完整
            </span>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="card animate-fade-in-up"
              style={{ opacity: 0 }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                    {sectionIcons[section.id]}
                  </div>
                  <h2 className="text-lg font-medium text-text-primary">
                    {section.title}
                  </h2>
                </div>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </button>

              {/* Section Content */}
              {expandedSections.has(section.id) && (
                <div className="animate-fade-in">
                  {section.isActionPlan ? (
                    <div className="space-y-4">
                      {report?.actionPlan.map((action) => (
                        <div
                          key={action.id}
                          className={`p-4 rounded-xl border ${
                            action.priority === 'high'
                              ? 'border-accent-primary/30 bg-accent-primary/5'
                              : action.priority === 'medium'
                                ? 'border-accent-secondary/30 bg-accent-secondary/5'
                                : 'border-bg-elevated bg-bg-elevated/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                action.priority === 'high'
                                  ? 'bg-accent-primary/20 text-accent-primary'
                                  : action.priority === 'medium'
                                    ? 'bg-accent-secondary/20 text-accent-secondary'
                                    : 'bg-bg-card text-text-muted'
                              }`}
                            >
                              <Rocket className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-text-primary mb-1">
                                {action.title}
                                <span
                                  className={`ml-2 text-xs ${
                                    action.priority === 'high'
                                      ? 'text-accent-primary'
                                      : action.priority === 'medium'
                                        ? 'text-accent-secondary'
                                        : 'text-text-muted'
                                  }`}
                                >
                                  {action.priority === 'high'
                                    ? '立即行动'
                                    : action.priority === 'medium'
                                      ? '短期目标'
                                      : '长期方向'}
                                </span>
                              </h3>
                              <p className="text-sm text-text-secondary mb-2">
                                {action.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {action.steps.map((step, i) => (
                                  <span
                                    key={i}
                                    className="text-xs px-2 py-1 rounded bg-bg-card text-text-muted"
                                  >
                                    {i + 1}. {step}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-text-secondary whitespace-pre-wrap leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center animate-fade-in-up" style={{ opacity: 0 }}>
          <p className="text-text-secondary mb-6">
            记住：这是你的可能人生，由你来设计
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleRestart} className="btn btn-secondary px-6">
              <RefreshCw className="w-4 h-4" />
              重新开始
            </button>
            <button onClick={handleDownload} className="btn btn-primary px-6">
              <Download className="w-4 h-4" />
              下载报告
            </button>
          </div>
        </div>
      </main>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="gradient-orb gradient-orb-purple w-[600px] h-[600px] -top-64 -right-64 opacity-10" />
        <div className="gradient-orb gradient-orb-blue w-[400px] h-[400px] bottom-0 -left-48 opacity-10" />
      </div>
    </div>
  );
}
