import React, { useEffect, useState } from "react";

const AnimatedBar = ({ value, color = "bg-violet-500", delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-2 w-full bg-zinc-800/80 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

const AnimatedScore = ({ target, delay = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = target / 40;
      const interval = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(interval);
        } else {
          setCount(Math.floor(start * 10) / 10);
        }
      }, 18);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return <span>{Math.round(count)}</span>;
};

const getScoreColor = (score) => {
  if (score >= 75) return { bar: "bg-emerald-400", text: "text-emerald-400", ring: "border-emerald-400", stroke: "#34d399", glow: "shadow-emerald-500/20" };
  if (score >= 50) return { bar: "bg-amber-400", text: "text-amber-400", ring: "border-amber-400", stroke: "#fbbf24", glow: "shadow-amber-500/20" };
  return { bar: "bg-rose-400", text: "text-rose-400", ring: "border-rose-400", stroke: "#fb7185", glow: "shadow-rose-500/20" };
};

const getScoreLabel = (score) => {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  return "Needs Work";
};

const getScoreEmoji = (score) => {
  if (score >= 75) return "🚀";
  if (score >= 50) return "📈";
  return "💪";
};

const ScoreCard = ({ data }) => {
  const atsScore = data?.ATSscore ?? 0;
  const breakdown = data?.ATSbreakDown ?? {};
  const { skillScore = 0, structureScore = 0, contentScore = 0 } = breakdown;

  const overall = getScoreColor(atsScore);

  const metrics = [
    {
      label: "Skill Match",
      value: skillScore,
      description: "How well your skills align with the role",
      icon: "🎯",
      delay: 300,
    },
    {
      label: "Structure",
      value: structureScore,
      description: "Resume layout, sections & readability",
      icon: "📐",
      delay: 450,
    },
    {
      label: "Content Quality",
      value: contentScore,
      description: "Relevance & depth of your experience",
      icon: "✍️",
      delay: 600,
    },
  ];

  // SVG ring config
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const [strokeDash, setStrokeDash] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStrokeDash(circumference - (atsScore / 100) * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [atsScore, circumference]);

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-8 animate-pulse-glow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium mb-1">ATS Analysis</p>
          <h2 className="text-white font-bold text-xl">Score Breakdown</h2>
        </div>
        <span
          className={`text-xs font-bold px-4 py-1.5 rounded-full border ${overall.text} ${overall.ring} bg-transparent flex items-center gap-1.5`}
        >
          {getScoreEmoji(atsScore)} {getScoreLabel(atsScore)}
        </span>
      </div>

      {/* Gradient Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* Main score ring + metrics side by side */}
      <div className="flex flex-col sm:flex-row items-center gap-10">
        {/* Ring */}
        <div className="relative shrink-0 flex items-center justify-center w-44 h-44">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-full ${overall.glow} shadow-2xl opacity-50`} />
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background track */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="8"
            />
            {/* Animated score arc */}
            <circle
              cx="70" cy="70" r={radius}
              fill="none"
              stroke={overall.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold ${overall.text}`}>
              <AnimatedScore target={atsScore} delay={200} />
            </span>
            <span className="text-xs text-zinc-500 mt-1 font-medium">out of 100</span>
          </div>
        </div>

        {/* Metric bars */}
        <div className="flex-1 w-full space-y-5">
          {metrics.map((m) => {
            const color = getScoreColor(m.value);
            return (
              <div key={m.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{m.icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-zinc-200">{m.label}</span>
                      <p className="text-xs text-zinc-500">{m.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${color.text} ml-4 shrink-0 tabular-nums`}>{m.value}%</span>
                </div>
                <AnimatedBar value={m.value} color={color.bar} delay={m.delay} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      <p className="text-xs text-zinc-600 text-center">
        Score is weighted: 50% skill match · 25% structure · 25% content quality
      </p>
    </div>
  );
};

export default ScoreCard;