import { useState, useRef } from "react";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(f.type)) {
      setError("Please upload a PDF or Word document.");
      return;
    }
    setError("");
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">AI-Powered</p>
          <h1 className="text-3xl font-bold text-white">Resume Analyzer</h1>
          <p className="text-zinc-400 mt-2 text-sm leading-relaxed">
            Upload your resume and we'll tell you which roles fit best and what skills to build next.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Upload + Submit */}
        {!result && (
          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl px-6 py-10 text-center cursor-pointer transition-colors
                ${dragging ? "border-lime-400 bg-lime-400/5" : "border-zinc-700 hover:border-zinc-500"}
                ${file ? "border-lime-500 bg-lime-500/5" : ""}
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {file ? (
                <div>
                  <div className="text-2xl mb-2">📄</div>
                  <p className="text-sm font-medium text-lime-400">{file.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-2">☁️</div>
                  <p className="text-sm text-zinc-300 font-medium">Drop your resume here</p>
                  <p className="text-xs text-zinc-500 mt-1">or click to browse · PDF, DOC, DOCX</p>
                </div>
              )}
            </div>

            {/* Analyze button */}
            <button
              onClick={handleSubmit}
              disabled={!file || loading}
              className="w-full py-3 rounded-xl bg-lime-400 text-zinc-900 font-semibold text-sm transition-all
                hover:bg-lime-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Analyzing…
                </span>
              ) : "Analyze Resume"}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5">

            {/* Top roles */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Best-fit roles</p>
              <div className="space-y-2">
                {(result.topRoles ?? []).map((role, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-xs font-bold text-lime-400 w-5 shrink-0">#{i + 1}</span>
                    <span className="text-sm text-zinc-100">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Skill gaps</p>
              <div className="flex flex-wrap gap-2">
                {(result.missingSkills ?? []).map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Brief advice */}
            {result.briefAdvice && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Advice</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{result.briefAdvice}</p>
              </div>
            )}

            {/* Analyze another */}
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 hover:text-zinc-200 transition-colors"
            >
              ← Analyze another resume
            </button>

          </div>
        )}

      </div>
    </div>
  );
}