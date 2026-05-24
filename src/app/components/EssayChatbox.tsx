"use client";

import React, { useState } from "react";
import { 
  Keyboard, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  Upload, 
  ArrowRight, 
  X,
  FileText,
  AlertCircle
} from "lucide-react";

interface EssayChatboxProps {
  onSubmit?: (data: { essay: string; prompt: string; type: "type" | "phone" | "laptop"; files?: File[] }) => void;
}

export default function EssayChatbox({ onSubmit }: EssayChatboxProps) {
  // State management
  const [activeTab, setActiveTab] = useState<"type" | "phone" | "laptop">("type");
  const [essayText, setEssayText] = useState("");
  const [promptText, setPromptText] = useState("");
  
  // File upload state for scanner tabs
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Auto-calculate counts
  const wordCount = essayText.trim() === "" ? 0 : essayText.trim().split(/\s+/).length;
  const charCount = essayText.length;

  // List of high-quality sample essays to try
  const SAMPLE_ESSAYS = [
    {
      title: "The Impact of AI on Modern Education",
      content: "Artificial intelligence is fundamentally transforming the landscape of modern education. By offering personalized learning pathways, automating tedious administrative tasks, and providing instant feedback systems, AI has the potential to make high-quality education more accessible than ever before. However, the integration of AI tools in schools also presents substantial challenges, particularly regarding the digital divide and academic integrity. To ensure AI serves as an equalizer rather than a wedge, policymakers must establish clear ethical guidelines while investing in digital infrastructure for underprivileged communities."
    },
    {
      title: "Sustainable Urban Design in the 21st Century",
      content: "As global urban populations continue to swell, the need for sustainable urban design has become an existential imperative. Twentieth-century cities, designed primarily around the private automobile, are no longer viable in an era defined by climate change and resource depletion. Modern urban planners must pivot toward public transport-oriented developments, dense mixed-use zoning, and extensive green infrastructure. By integrating vertical forests, permeable pavements, and decentralized solar grids, cities can transition from carbon-intensive sinks into resilient, circular ecosystems that actively support human well-being."
    }
  ];

  // Pick a random sample essay and pre-fill it
  const handleTrySample = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_ESSAYS.length);
    const sample = SAMPLE_ESSAYS[randomIndex];
    setEssayText(sample.content);
    setPromptText(sample.title);
  };

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setEssayText("");
    setPromptText("");
    setUploadedFiles([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "type" && !essayText.trim()) return;
    if (activeTab !== "type" && uploadedFiles.length === 0) return;

    if (onSubmit) {
      onSubmit({
        essay: activeTab === "type" ? essayText : "",
        prompt: promptText,
        type: activeTab,
        files: uploadedFiles
      });
    } else {
      alert(
        activeTab === "type" 
          ? `Submitted Essay:\nWord Count: ${wordCount}\nPrompt: ${promptText || "None"}`
          : `Submitted Files: ${uploadedFiles.map(f => f.name).join(", ")}\nPrompt: ${promptText || "None"}`
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl border border-solid border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-xs overflow-hidden transition-all duration-300">
      
      {/* HEADER TABS & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3 border-b border-solid border-[var(--border-subtle)] bg-[var(--surface-secondary)]/50">
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-[var(--surface-tertiary)] p-1 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("type")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "type"
                ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Keyboard size={15} />
            <span>Type essay</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("phone")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "phone"
                ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Smartphone size={15} />
            <span>Phone scan</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("laptop")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "laptop"
                ? "bg-[var(--surface-primary)] text-[var(--text-primary)] shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Laptop size={15} />
            <span>Laptop scan</span>
          </button>
        </div>

        {/* Sample Actions */}
        <button
          type="button"
          onClick={handleTrySample}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-solid border-[var(--brand-200)] hover:border-[var(--brand-600)] dark:border-[var(--border-default)] bg-[var(--surface-primary)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-tertiary)] text-[var(--brand-600)] dark:text-[var(--text-primary)] text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-2xs group"
        >
          <Sparkles size={14} className="text-[var(--brand-600)] dark:text-[var(--brand-600)] group-hover:rotate-12 transition-transform duration-300" />
          <span>Try a sample essay</span>
        </button>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        
        {/* INPUT CONTENT WINDOW */}
        <div className="relative p-6 min-h-[220px]">
          
          {/* Option 1: Direct Text Area ("Type essay") */}
          {activeTab === "type" && (
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste or write your essay here..."
              className="w-full min-h-[160px] max-h-[400px] border-none outline-hidden resize-y bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[15px] leading-relaxed transition-all duration-200"
              style={{ fontFamily: "inherit" }}
            />
          )}

          {/* Option 2: Phone Upload ("Phone scan") */}
          {activeTab === "phone" && (
            <div className="flex flex-col items-center justify-center min-h-[180px] p-4 text-center rounded-xl border-2 border-dashed border-[var(--border-default)] bg-[var(--surface-secondary)]/30">
              <Smartphone size={32} className="text-[var(--text-tertiary)] mb-3 animate-pulse" />
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
                Scan with your Smartphone
              </h4>
              <p className="text-[12.5px] text-[var(--text-secondary)] max-w-sm mb-4">
                Scan your handwritten paper directly. You can also upload captured photos from your library.
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center w-full max-w-md">
                <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--gray-900)] dark:bg-white text-white dark:text-black hover:opacity-90 text-[12.5px] font-medium cursor-pointer shadow-xs transition-all">
                  <Upload size={14} />
                  Upload Images
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*,application/pdf" 
                    onChange={handleFileChange}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          )}

          {/* Option 3: Laptop Upload ("Laptop scan") */}
          {activeTab === "laptop" && (
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center min-h-[180px] p-6 text-center rounded-xl border-2 border-dashed transition-all duration-300 ${
                dragActive 
                  ? "border-[var(--brand-600)] bg-[var(--brand-50)] dark:bg-[var(--brand-900)]/20" 
                  : "border-[var(--border-default)] bg-[var(--surface-secondary)]/30 hover:bg-[var(--surface-secondary)]/50"
              }`}
            >
              <Upload size={32} className={`mb-3 transition-transform ${dragActive ? "translate-y-[-4px] text-[var(--brand-600)]" : "text-[var(--text-tertiary)]"}`} />
              <h4 className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
                Drag and drop your document
              </h4>
              <p className="text-[12.5px] text-[var(--text-secondary)] mb-4">
                Supports PDF, DOCX, JPEG, and PNG up to 20MB.
              </p>
              
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--surface-primary)] border border-solid border-[var(--border-default)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] text-[12.5px] font-medium cursor-pointer transition-all">
                <span>Browse Files</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,application/pdf" 
                  onChange={handleFileChange}
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* CLEAR ACTION BUTTON */}
          {(essayText || promptText || uploadedFiles.length > 0) && (
            <button
              type="button"
              onClick={clearAll}
              className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-tertiary)] hover:bg-[var(--color-danger-bg)] text-[var(--text-secondary)] hover:text-[var(--color-danger-text)] transition-all cursor-pointer shadow-3xs"
              title="Clear all"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* FILE PREVIEW CHIPS SECTION */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 pb-4 border-b border-solid border-[var(--border-subtle)]">
            {uploadedFiles.map((file, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-solid border-[var(--border-subtle)] text-[12px] text-[var(--text-primary)] group animate-fade-in"
              >
                <FileText size={14} className="text-[var(--brand-600)]" />
                <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="p-0.5 rounded-full hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:text-[var(--color-danger-text)] transition-all cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* INPUT 2: STIMULUS / PROMPT INPUT */}
        <div className="flex items-center px-6 py-4 border-t border-b border-solid border-[var(--border-subtle)] bg-[var(--surface-secondary)]/20 gap-3">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Essay question, prompt, or stimulus (optional)"
            className="w-full border-none outline-hidden bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[13px] font-medium leading-none"
          />
        </div>

        {/* FOOTER COUNTERS & ACTION SUBMISSION */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--surface-secondary)]/50">
          
          {/* Counters Status */}
          <div className="flex items-center gap-4 text-[12px] text-[var(--text-tertiary)] font-medium">
            {activeTab === "type" ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-secondary)] font-semibold">{wordCount}</span>
                  <span>words</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[var(--text-disabled)]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-secondary)] font-semibold">{charCount}</span>
                  <span>characters</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-[var(--brand-600)]">
                <AlertCircle size={13} />
                <span>{uploadedFiles.length} file(s) attached</span>
              </div>
            )}
          </div>

          {/* Submission Button */}
          <button
            type="submit"
            disabled={activeTab === "type" ? !essayText.trim() : uploadedFiles.length === 0}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 shadow-md cursor-pointer select-none bg-[var(--brand-600)] hover:bg-[var(--brand-800)] text-white hover:translate-y-[-1px] active:translate-y-0 disabled:bg-[var(--text-disabled)] disabled:text-[var(--surface-primary)] disabled:hover:bg-[var(--text-disabled)] disabled:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <span>Get expert feedback</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </form>
    </div>
  );
}
