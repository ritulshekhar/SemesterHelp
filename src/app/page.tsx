"use client";

import { useState } from "react";
import { uploadPdf, getPageSummary, getTopicSummary } from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [docId, setDocId] = useState<string>("");
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [firstTopic, setFirstTopic] = useState<string>("");
  const [firstRunEnd, setFirstRunEnd] = useState<number>(1);

  const [userPrompt, setUserPrompt] = useState("What did I learn in the first slide?");
  const [slideSummary, setSlideSummary] = useState<string>("");
  const [slideTldr, setSlideTldr] = useState<string>("");
  const [topicContinues, setTopicContinues] = useState(false);
  const [topicId, setTopicId] = useState<string>("");
  const [topicSummary, setTopicSummary] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const data = await uploadPdf(file);
      setDocId(data.doc_id);
      setPagesCount(data.pages_count);
      setFirstTopic(data.first_topic);
      setFirstRunEnd(data.first_topic_runs_to_page);
      // Reset view
      setSlideSummary("");
      setSlideTldr("");
      setTopicContinues(false);
      setTopicId("");
      setTopicSummary("");
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const askFirstSlide = async () => {
    if (!docId) return;
    try {
      const data = await getPageSummary(docId, 0, userPrompt);
      setSlideSummary(data.focused_summary);
      setSlideTldr(data.tldr);
      setTopicContinues(data.topic_continues);
      setTopicId(data.topic_id);
    } catch (e: any) {
      alert(e.message || "Summary failed");
    }
  };

  const fetchTopicSummary = async () => {
    if (!docId || !topicId) return;
    try {
      const data = await getTopicSummary(docId, topicId);
      setTopicSummary(data.summary);
    } catch (e: any) {
      alert(e.message || "Topic summary failed");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="px-6 md:px-10 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-400/30">
              BrainyBinder
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              Build your second brain for slides & notes
            </h1>
            <p className="text-slate-300 mt-3">
              Upload a PDF deck, ask what you learned in the first slide, and (if the topic continues)
              get a one-click summary of the entire topic.
            </p>
          </div>

          {/* Card: Upload */}
          <div className="card p-6 md:p-8">
            <label className="label">Upload PDF</label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="file"
                accept="application/pdf"
                className="input"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>

            {docId && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="col-span-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-slate-400">Slides</div>
                    <div className="text-2xl font-semibold">{pagesCount}</div>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-slate-400">Slide 1 Topic</div>
                    <div className="text-lg font-semibold">{firstTopic}</div>
                    {firstRunEnd > 1 && (
                      <div className="text-xs text-slate-400 mt-1">
                        Continues through slide {firstRunEnd}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: Slide 1 QA */}
          {docId && (
            <div className="card p-6 md:p-8 mt-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xl font-semibold">Slide 1 — Ask</h2>
                <span className="text-xs text-slate-400">Topic: {firstTopic}</span>
              </div>
              <div className="mt-3">
                <input
                  className="input"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder="What did I learn in the first slide?"
                />
                <div className="mt-3">
                  <button className="btn-primary" onClick={askFirstSlide}>
                    Summarize Slide 1
                  </button>
                </div>
              </div>

              {slideSummary && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-slate-300">Focused Summary</div>
                    <div className="prose prose-invert max-w-none mt-2 whitespace-pre-wrap">
                      {slideSummary}
                    </div>
                  </div>
                  <div className="md:col-span-1 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-sm text-slate-300">TL;DR</div>
                    <div className="mt-2 text-slate-200">{slideTldr || "—"}</div>
                  </div>
                </div>
              )}

              {slideSummary && topicContinues && (
                <div className="mt-6 p-4 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-medium text-fuchsia-200">
                        This topic continues on later slides.
                      </div>
                      <div className="text-sm text-fuchsia-200/80">
                        Do you want a summary of the entire <span className="font-semibold">{firstTopic}</span> topic?
                      </div>
                    </div>
                    <button className="btn-primary" onClick={fetchTopicSummary}>
                      Yes, summarize entire topic
                    </button>
                  </div>
                </div>
              )}

              {topicSummary && (
                <div className="mt-6 p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-sm text-slate-300">Full Topic Summary</div>
                  <div className="prose prose-invert max-w-none mt-2 whitespace-pre-wrap">
                    {topicSummary}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer tip */}
          <div className="text-xs text-slate-500 mt-8">
            Tip: very large decks are handled on-demand (slide-by-slide) so you can resume anytime.
          </div>
        </div>
      </section>
    </main>
  );
}
