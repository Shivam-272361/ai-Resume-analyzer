import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const scores = [
  { key: "skillScore",     label: "Skill score",     color: "#7F77DD" },
  { key: "structureScore", label: "Structure score",  color: "#1D9E75" },
  { key: "contentScore",   label: "Content score",    color: "#D85A30" },
];

function ScoreBar({ value, color }) {
  const pct = Math.round((value / 100) * 100);
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ScoreCard({ resumeId }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch(`${API_URL}/${resumeId}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to fetch");
        setData(json.ATSbreakDown);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, [resumeId]);

  if (loading) return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
      <div className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
      Fetching scores...
    </div>
  );

  if (error) return (
    <div className="text-sm text-red-500 py-2">Error: {error}</div>
  );

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 max-w-sm w-full">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
        ATS breakdown
      </p>

      <div className="flex flex-col gap-4">
        {scores.map(({ key, label, color }) => {
          const raw   = data?.[key] ?? 0;
          const outOf10 = (raw / 10).toFixed(1);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">{label}</span>
                <span className="text-sm font-medium" style={{ color }}>
                  {outOf10}
                  <span className="text-xs text-gray-400 font-normal"> / 10</span>
                </span>
              </div>
              <ScoreBar value={raw} color={color} />
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-100 mt-5 pt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">Overall ATS</span>
        <span className="text-lg font-medium text-gray-800">
          {data
            ? (
                (data.skillScore + data.structureScore + data.contentScore) /
                30
              ).toFixed(1)
            : "—"}
          <span className="text-xs text-gray-400 font-normal"> / 10</span>
        </span>
      </div>
    </div>
  );
}