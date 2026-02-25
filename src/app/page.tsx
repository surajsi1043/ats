"use client";

import React, { useState } from "react";
import { AnalysisResponse } from "@/types";

export default function IndianATSAnalyzer() {
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jdText) {
      setError("Please provide both a Job Description and a Resume PDF.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd_text", jdText);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to analyze resume.");

      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError("An error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Indian ATS AI Analyzer 🇮🇳
          </h1>
          <p className="text-lg text-gray-600">
            Optimize your resume for Naukri, LinkedIn, and Hirist in seconds.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Description Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste Job Description
              </label>
              <textarea
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-800"
                placeholder="Paste the JD from LinkedIn, Naukri, etc..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                maxLength={5000}
                required
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Resume (PDF)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">{file ? file.name : "PDF Only (Max 5MB)"}</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg transition-all ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg"
              }`}
            >
              {loading ? "Analyzing Context..." : "Analyze Resume"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white shadow-2xl rounded-2xl p-8 border-t-4 border-blue-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Roadmap</h2>
                <p className="text-gray-500">Verdict: <span className="font-semibold text-blue-600">{result.verdict}</span></p>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black text-blue-600">{result.score}%</div>
                <div className="text-xs font-bold uppercase text-gray-400">Match Score</div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Keywords */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">🔍</span> Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Indian Market Tips */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <span className="mr-2">💡</span> Desi Market Edge
                </h3>
                <ul className="space-y-2">
                  {result.indian_market_tips.map((tip, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600 bg-orange-50 p-3 rounded-lg border border-orange-100">
                      <span className="text-orange-500 mr-2">📌</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}