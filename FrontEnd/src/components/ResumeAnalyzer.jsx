import React, { useRef, useState } from 'react'
import axios from 'axios';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const inputRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;  // VITE_API_URL=http://localhost:5000/api/v1/upload  not the real
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
    formData.append("role",role);

    setLoading(true);
    try {
      const response = await axios.post(API_URL, formData);
      setData(response.data);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || error.message || "Something went wrong.");
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

  return (
    <div className='min-h-screen bg-zinc-950 font-sans text-zinc-100 px-4 py-12'>
      <div className="max-w-2xl mx-auto">
        {/* header Section */}
        <div className='mb-10'>
          <p className='text-xs text-zinc-400 mb-2 '>AI-POWERED</p>
          <h1 className='text-3xl font-bold mb-2 text-white'>Resume Analyzer</h1>
          <p className='text-[16px] text-zinc-500 mb-2'>Upload your resume and we'll tell you which roles fit best and what skills to build next.</p>
        </div>
        {/* Error */}
        {error && (
          <div className="mb-6 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!data && (
          <div className='space-y-4'>
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${dragging ? "border-lime-400 bg-lime-400/5" : "border-zinc-700 hover:border-zinc-500"}
            ${file ? "border-lime-500 bg-lime-500/5" : ""}
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
                <div>
                  <div className='text-2xl mb-2 '>📄</div>
                  <p className='text-sm font-medium text-lime-400'>{file.name}</p>
                  <p className='text-xs text-zinc-500 mt-1'>{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset() }}
                    className='mt-3 text-xs underline text-zinc-500'
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className='text-2xl mb-2'>☁️</div>
                  <p className='text-sm font-medium text-white'>Drop your Resume here</p>
                  <p className='text-xs text-zinc-500 mt-1'>or click here to browse. PDF,DOCX</p>
                </div>
              )}

            </div>
            <div>
              <select name="role" className='text-red-400' onChange={selectHandler}>
                <option value="frontend">Frontend developer</option>
                <option value="backend">Backend developer</option>
                <option value="fullstack">Full stack developer</option>
                <option value="ds">Data Science</option>
                <option value="ml">Machine learning</option>
              </select>

            </div>

            {/* Analyze Button */}
            <button
              onClick={submitHandler}
              disabled={!file || loading}
              className="w-full py-3 rounded-xl bg-lime-400 text-zinc-900 font-semibold text-sm transition-all
                hover:bg-lime-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Analyzing…
                </span>
              ) : "Analyze Resume"}
            </button>
          </div>
        )}
        {/* Results */}
        {data && (
          < div className='space-y-5'>
            {/* Top Roles */}
            <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-5'>
              <p className='text-xs text-zinc-500 uppercase tracking-widest mb-4'>Best-fit Roles</p>
              <div className='space-y-2'>
                {(data?.aiResult?.topRoles ?? []).map((role, i) => (
                  <div key={i} className='flex items-center border-b gap-3 py-2 border-zinc-800 last:border-0'>
                    <span className='text-xs font-bold text-lime-400 w-5 shrink-0'>#{i + 1}</span>
                    <span className='text-sm text-zinc-100 '>{role}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Missing Skills */}
            <div className='bg-zinc-800 border-zinc-800 rounded-xl p-5'>
              <p className='text-xs text-zinc-500 uppercase tracking-widest mb-4'>Skill Gaps</p>
              <div className='flex flex-wrap gap-2'>
                {(data?.aiResult?.missingSkills ?? []).map((skill, i) => (
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
            {data?.aiResult?.briefAdvice && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Advice</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{data.aiResult.briefAdvice}</p>
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
    </div >
  )
}

export default ResumeAnalyzer
