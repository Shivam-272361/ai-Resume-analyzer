import React, { useEffect, useState } from "react";

const AnimatedBar = ({ value, color = "bg-lime-400", delay = 0 }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
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
  if (score >= 75) return { bar: "bg-lime-400", text: "text-lime-400", ring: "border-lime-400" };
  if (score >= 50) return { bar: "bg-yellow-400", text: "text-yellow-400", ring: "border-yellow-400" };
  return { bar: "bg-red-400", text: "text-red-400", ring: "border-red-400" };
};

const getScoreLabel = (score) => {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Moderate";
  return "Needs Work";
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
      delay: 200,
    },
    {
      label: "Structure",
      value: structureScore,
      description: "Resume layout, sections & readability",
      delay: 350,
    },
    {
      label: "Content Quality",
      value: contentScore,
      description: "Relevance & depth of your experience",
      delay: 500,
    },
  ];

  // SVG ring config
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [strokeDash, setStrokeDash] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStrokeDash(circumference - (atsScore / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [atsScore, circumference]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">ATS Analysis</p>
          <h2 className="text-white font-semibold text-lg">Score Breakdown</h2>
        </div>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${overall.text} ${overall.ring} bg-transparent`}
        >
          {getScoreLabel(atsScore)}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Main score ring + metrics side by side */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Ring */}
        <div className="relative shrink-0 flex items-center justify-center w-36 h-36">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#27272a"
              strokeWidth="10"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={atsScore >= 75 ? "#a3e635" : atsScore >= 50 ? "#facc15" : "#f87171"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDash}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${overall.text}`}>
              <AnimatedScore target={atsScore} delay={100} />
            </span>
            <span className="text-xs text-zinc-500 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Metric bars */}
        <div className="flex-1 w-full space-y-4">
          {metrics.map((m) => {
            const color = getScoreColor(m.value);
            return (
              <div key={m.label} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-zinc-200">{m.label}</span>
                    <p className="text-xs text-zinc-500">{m.description}</p>
                  </div>
                  <span className={`text-sm font-bold ${color.text} ml-4 shrink-0`}>{m.value}</span>
                </div>
                <AnimatedBar value={m.value} color={color.bar} delay={m.delay} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="border-t border-zinc-800 pt-4">
        <p className="text-xs text-zinc-600 text-center">
          ATS score is weighted across skill match, structure, and content quality.
        </p>
      </div>
    </div>
  );
};

export default ScoreCard;