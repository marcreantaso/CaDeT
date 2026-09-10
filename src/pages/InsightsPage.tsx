import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, ChevronDown, AlertTriangle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useInsights } from '../hooks/useInsights';
import { useForecasts } from '../hooks/useForecasts';
import { ConfidenceBadge } from '../components/shared/ConfidenceBadge';
import { ExplanationCard } from '../components/shared/ExplanationCard';

const DIRECTION_COLORS: Record<string, string> = {
  'Full-Stack Development': 'hsl(262, 83%, 58%)',
  'AI Engineering': 'hsl(172, 66%, 50%)',
  'Frontend Engineering': 'hsl(200, 83%, 55%)',
  'Cybersecurity': 'hsl(0, 72%, 51%)',
  'Data Engineering': 'hsl(45, 93%, 55%)',
};

export function InsightsPage() {
  const { insights, isLoading: insightsLoading } = useInsights();
  const { forecasts, isLoading: forecastsLoading } = useForecasts();
  const [expandedForecast, setExpandedForecast] = useState<string | null>(null);

  if (insightsLoading || forecastsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[hsl(262,83%,58%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback static chart data for now since we don't have a trajectory history hook yet
  const chartData = [
    { date: 'Jul 1', 'Full-Stack Development': 20, 'AI Engineering': 10 },
    { date: 'Aug 1', 'Full-Stack Development': 45, 'AI Engineering': 15 },
    { date: 'Sep 1', 'Full-Stack Development': 68, 'AI Engineering': 35 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          Career Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(215, 20%, 65%)' }}>
          Explainable career trajectory analysis based on your evidence, behavior, and experiments
        </p>
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'hsl(45, 93%, 55%, 0.06)', border: '1px solid hsl(45, 93%, 55%, 0.15)' }}
      >
        <HelpCircle size={16} style={{ color: 'hsl(45, 93%, 55%)', marginTop: 1, flexShrink: 0 }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: 'hsl(45, 93%, 55%)', fontFamily: 'var(--font-heading)' }}>
            These are hypotheses, not predictions
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 65%)' }}>
            Trajectory forecasts are based on your evidence and behavioral signals. They are recommendations, not guarantees. Confidence reflects data strength, not certainty.
          </p>
        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="glass-card p-5">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
        >
          Career Trajectory Over Time
        </h3>
        <p className="text-xs mb-4" style={{ color: 'hsl(var(--text-muted))' }}>
          How your career direction confidence has evolved based on accumulated evidence
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
          {Object.entries(DIRECTION_COLORS).map(([dir, color]) => (
            <div key={dir} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>{dir}</span>
            </div>
          ))}
        </div>

        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(DIRECTION_COLORS).map(([dir, color]) => (
                  <linearGradient key={dir} id={`insight-gradient-${dir.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 14%)" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--text-muted))', fontSize: 10 }} axisLine={{ stroke: 'hsl(222, 25%, 14%)' }} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--text-muted))', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(222, 35%, 10%)',
                  border: '1px solid hsl(222, 25%, 18%)',
                  borderRadius: 12,
                  fontSize: 11,
                  boxShadow: '0 8px 32px hsl(0, 0%, 0%, 0.4)',
                }}
                labelStyle={{ color: 'hsl(210, 40%, 96%)', fontWeight: 600 }}
              />
              {Object.entries(DIRECTION_COLORS).map(([dir, color]) => (
                <Area
                  key={dir}
                  type="monotone"
                  dataKey={dir}
                  stroke={color}
                  fill={`url(#insight-gradient-${dir.replace(/\s/g, '')})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: 'hsl(222, 47%, 6%)' }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Career Direction Forecasts */}
      <div>
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          Direction Forecasts
        </h2>

        {forecasts.length === 0 ? (
          <div className="text-center py-10 glass-card">
            <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>Not enough data to generate forecasts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {forecasts.map((forecast, index) => {
              const isExpanded = expandedForecast === forecast.id;
              const dirColor = DIRECTION_COLORS[forecast.direction] || 'hsl(262, 83%, 58%)';
              const TrendIcon = forecast.trend === 'rising' ? TrendingUp : forecast.trend === 'declining' ? TrendingDown : Minus;

              return (
                <motion.div
                  key={forecast.id}
                  className="glass-card overflow-hidden"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  {/* Header */}
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`forecast-panel-${forecast.id}`}
                    className="p-4 sm:p-5 w-full text-left"
                    onClick={() => setExpandedForecast(isExpanded ? null : forecast.id)}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `color-mix(in srgb, ${dirColor} 7.06%, transparent)` }}
                      >
                        <Brain size={22} style={{ color: dirColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-bold"
                            style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                          >
                            {forecast.direction}
                          </p>
                          <TrendIcon size={14} style={{
                            color: forecast.trend === 'rising' ? 'hsl(150, 70%, 45%)' :
                              forecast.trend === 'declining' ? 'hsl(0, 72%, 51%)' : 'hsl(var(--text-muted))'
                          }} />
                        </div>
                        <ConfidenceBadge value={forecast.confidence} />
                      </div>

                      {/* Confidence bar */}
                      <div className="hidden md:block w-32">
                        <div className="progress-bar" style={{ height: 8 }}>
                          <motion.div
                            className="progress-bar-fill"
                            style={{ background: dirColor }}
                            initial={{ width: 0 }}
                            animate={{ width: `${forecast.confidence}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={18} style={{ color: 'hsl(var(--text-muted))' }} />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div id={`forecast-panel-${forecast.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}>
                          <div className="pt-4">
                            <h4
                              className="text-xs font-semibold uppercase tracking-wider mb-2"
                              style={{ color: dirColor, fontFamily: 'var(--font-heading)' }}
                            >
                              Why This Trajectory?
                            </h4>
                            <p className="text-xs leading-relaxed" style={{ color: 'hsl(215, 20%, 65%)' }}>
                              {forecast.explanation}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Positive Signals */}
                            {forecast.positiveSignals && forecast.positiveSignals.length > 0 && (
                              <div className="p-3 rounded-xl" style={{ background: 'hsl(150, 70%, 45%, 0.06)' }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <CheckCircle size={12} style={{ color: 'hsl(150, 70%, 45%)' }} />
                                  <p className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: 'hsl(150, 70%, 45%)', fontFamily: 'var(--font-heading)' }}
                                  >
                                    Positive Signals
                                  </p>
                                </div>
                                <ul className="space-y-1">
                                  {forecast.positiveSignals.map((s: string, i: number) => (
                                    <li key={i} className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Negative Signals */}
                            {forecast.negativeSignals && forecast.negativeSignals.length > 0 && (
                              <div className="p-3 rounded-xl" style={{ background: 'hsl(0, 72%, 51%, 0.06)' }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <XCircle size={12} style={{ color: 'hsl(0, 72%, 51%)' }} />
                                  <p className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: 'hsl(0, 72%, 51%)', fontFamily: 'var(--font-heading)' }}
                                  >
                                    Negative Signals
                                  </p>
                                </div>
                                <ul className="space-y-1">
                                  {forecast.negativeSignals.map((s: string, i: number) => (
                                    <li key={i} className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Behavioral Evidence */}
                            {forecast.behavioralEvidence && forecast.behavioralEvidence.length > 0 && (
                              <div className="p-3 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                                  style={{ color: 'hsl(262, 83%, 68%)', fontFamily: 'var(--font-heading)' }}
                                >
                                  Behavioral Evidence
                                </p>
                                <ul className="space-y-1">
                                  {forecast.behavioralEvidence.map((s: string, i: number) => (
                                    <li key={i} className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Experiment Results */}
                            {forecast.experimentResults && forecast.experimentResults.length > 0 && (
                              <div className="p-3 rounded-xl col-span-1 md:col-span-2" style={{ background: 'hsl(222, 30%, 12%)' }}>
                                <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                                  style={{ color: 'hsl(45, 93%, 55%)', fontFamily: 'var(--font-heading)' }}
                                >
                                  Experiment Results
                                </p>
                                <ul className="space-y-1">
                                  {forecast.experimentResults.map((s: string, i: number) => (
                                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'hsl(215, 20%, 65%)' }}>
                                      <span className="text-xs mt-0.5">•</span>
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Missing Evidence */}
                            {forecast.missingEvidence && forecast.missingEvidence.length > 0 && (
                              <div className="p-3 rounded-xl" style={{ background: 'hsl(45, 93%, 55%, 0.06)' }}>
                                <div className="flex items-center gap-1.5 mb-2">
                                  <AlertTriangle size={12} style={{ color: 'hsl(45, 93%, 55%)' }} />
                                  <p className="text-xs font-semibold uppercase tracking-wider"
                                    style={{ color: 'hsl(45, 93%, 55%)', fontFamily: 'var(--font-heading)' }}
                                  >
                                    Missing Evidence
                                  </p>
                                </div>
                                <ul className="space-y-1">
                                  {forecast.missingEvidence.map((s: string, i: number) => (
                                    <li key={i} className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Skill Evidence */}
                          {forecast.skillEvidence && forecast.skillEvidence.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                                style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
                              >
                                Skill Evidence
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {forecast.skillEvidence.map((s: string, i: number) => (
                                  <span key={i} className="text-xs px-2 py-1 rounded-lg"
                                    style={{ background: 'hsl(222, 30%, 14%)', color: 'hsl(215, 20%, 65%)', border: '1px solid hsl(222, 25%, 18%)' }}
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div>
        <h2
          className="text-lg font-bold mb-4"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          AI-Generated Insights
        </h2>

        {insights.length === 0 ? (
          <div className="text-center py-10 glass-card">
            <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>No AI insights generated yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <ExplanationCard
                key={insight.id}
                title={insight.title}
                explanation={insight.explanation}
                evidence={insight.evidence}
                actions={insight.actionItems}
                accentColor={
                  insight.type === 'pattern_detected' ? 'hsl(262, 83%, 58%)' :
                  insight.type === 'skill_gap' ? 'hsl(0, 72%, 51%)' :
                  'hsl(172, 66%, 50%)'
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
