import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios';
import Scorecard from './Scorecard';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [role, setRole] = useState("frontend");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef();
  const dropdownRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://ai-resume-analyzer-nm26.onrender.com/api/v1/upload";

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  }
  const selectHandler = (e) => {
    const value = e.target.value;
    setRole(value);
    console.log(value);
  }
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setFile(e.dataTransfer.files[0]);
  }
  const submitHandler = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    setLoading(true);
    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      });
      setData(response.data);
    } catch (error) {
      console.log(error);
      setError(
        error.response?.data?.message ||
        (error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again in a few seconds."
          : "") ||
        (error.message === "Network Error"
          ? "Cannot reach the backend server. Check that the Render backend is live and reachable."
          : "") ||
        error.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }
  console.log(data);
  const reset = () => {
    setFile(null);
    setData(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const roles = [
    { value: "frontend", label: "Frontend Developer", icon: "🎨" },
    { value: "backend", label: "Backend Developer", icon: "⚙️" },
    { value: "fullstack", label: "Full Stack Developer", icon: "🔗" },
    { value: "data", label: "Data Science", icon: "📊" },
    { value: "ml", label: "Machine Learning / AI", icon: "🤖" },
    { value: "devops", label: "DevOps / SRE", icon: "🚀" },
    { value: "mobile", label: "Mobile Developer", icon: "📱" },
    { value: "android", label: "Android Developer", icon: "🤖" },
    { value: "ios", label: "iOS Developer", icon: "🍎" },
    { value: "cloud", label: "Cloud Engineer", icon: "☁️" },
    { value: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
    { value: "uiux", label: "UI/UX Designer", icon: "✏️" },
    { value: "qa", label: "QA / Test Engineer", icon: "🧪" },
    { value: "blockchain", label: "Blockchain / Web3", icon: "⛓️" },
    { value: "gamedev", label: "Game Developer", icon: "🎮" },
    { value: "embedded", label: "Embedded / IoT", icon: "🔌" },
    { value: "productmanager", label: "Product Manager", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-fuchsia-600/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 py-12 sm:py-16">

        {/* Hero Section */}
        {!data && (
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold tracking-wide mb-6">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
              </svg>
              AI-POWERED RESUME ANALYSIS
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              Get your resume{' '}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                interview-ready
              </span>
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Upload your resume and we'll analyze it against ATS systems, identify skill gaps, and suggest the best-fit roles for your profile.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-5 py-4 flex items-start gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form */}
        {!data && (
          <div className="space-y-6 animate-fade-in-up-delay-1">

            {/* Drop Zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`glass-card glass-card-hover rounded-2xl text-center cursor-pointer transition-all duration-300 p-10 sm:p-14 group
                ${dragging ? "!border-violet-400 !bg-violet-500/5 scale-[1.01]" : ""}
                ${file ? "!border-emerald-500/40 !bg-emerald-500/5" : ""}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />

              {file ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset() }}
                    className="mt-2 text-xs text-zinc-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto group-hover:bg-violet-500/15 transition-colors animate-float">
                    <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Drop your resume here</p>
                    <p className="text-sm text-zinc-500 mt-1">or click to browse · PDF, DOCX</p>
                  </div>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="animate-fade-in-up-delay-2 relative z-20">
              <label className="block text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-3">
                Target Role
              </label>
              <div className="relative" ref={dropdownRef}>
                {/* Trigger button */}
                <button
                  type="button"
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="w-full glass-card rounded-xl px-5 py-3.5 text-sm text-zinc-200 cursor-pointer outline-none transition-all duration-200 hover:border-zinc-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base">{roles.find(r => r.value === role)?.icon}</span>
                    <span>{roles.find(r => r.value === role)?.label}</span>
                  </span>
                  <svg className={`w-4 h-4 text-violet-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-700/80 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
                      {roles.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            setRole(r.value);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors duration-150 cursor-pointer
                            ${r.value === role
                              ? "bg-violet-500/15 text-violet-300"
                              : "text-zinc-300 hover:bg-white/5 hover:text-white"
                            }
                          `}
                        >
                          <span className="text-base w-6 text-center shrink-0">{r.icon}</span>
                          <span className="font-medium">{r.label}</span>
                          {r.value === role && (
                            <svg className="w-4 h-4 text-violet-400 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={submitHandler}
              disabled={!file || loading}
              className="animate-fade-in-up-delay-3 w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden group
                bg-gradient-to-r from-violet-600 to-indigo-600 text-white
                hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25
                active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <span className="relative z-10 flex items-center justify-center gap-2.5">
                {loading ? (
                  <>
                    <svg className="animate-spin h-4.5 w-4.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing your resume…
                  </>
                ) : (
                  <>
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Analyze Resume
                  </>
                )}
              </span>
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 pt-2 animate-fade-in-up-delay-4">
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Files are not stored
              </span>
              <span className="text-xs text-zinc-600 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI-powered analysis
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="space-y-6">
            {/* Results header */}
            <div className="text-center mb-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-4">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                ANALYSIS COMPLETE
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Here's your resume report</h2>
            </div>

            {/* Scorecard */}
            <div className="animate-fade-in-up-delay-1">
              <Scorecard data={data} />
            </div>

            {/* Top Roles */}
            <div className="glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up-delay-2">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-sm">🏆</span>
                <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Best-fit Roles</p>
              </div>
              <div className="space-y-1">
                {(data?.aiResult?.topRoles ?? []).map((role, i) => (
                  <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-zinc-100">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Matched Skills */}
            {(data?.matchedSkills ?? []).length > 0 && (
              <div className="glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up-delay-2">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="text-sm">✅</span>
                  <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Matched Skills</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data?.matchedSkills ?? []).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {(data?.aiResult?.missingSkills ?? []).length > 0 && (
              <div className="glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up-delay-3">
                <div className="flex items-center gap-2.5 mb-5">
                  <span className="text-sm">📌</span>
                  <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">Skill Gaps to Fill</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(data?.aiResult?.missingSkills ?? []).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brief advice */}
            {data?.aiResult?.briefAdvice && (
              <div className="glass-card glass-card-hover rounded-2xl p-6 animate-fade-in-up-delay-4">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="text-sm">💡</span>
                  <p className="text-xs text-zinc-500 uppercase tracking-[0.2em] font-medium">AI Advice</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-1 self-stretch rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
                  <p className="text-sm text-zinc-300 leading-relaxed italic">{data.aiResult.briefAdvice}</p>
                </div>
              </div>
            )}

            {/* Analyze another */}
            <button
              onClick={reset}
              className="w-full py-4 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-medium hover:border-violet-500/30 hover:text-violet-400 hover:bg-violet-500/5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Analyze another resume
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeAnalyzer
