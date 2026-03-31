/**
 * SkillOutputModal.tsx -- Modal displaying the generated skill files.
 *
 * Shows two tabs (SKILL.md and Content YAML) with download and copy actions.
 */

import { useState, useCallback, useEffect } from 'react';

interface SkillOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillMd: string;
  contentYaml: string;
  skillName: string;
}

type Tab = 'skillmd' | 'yaml';

export default function SkillOutputModal({
  isOpen,
  onClose,
  skillMd,
  contentYaml,
  skillName,
}: SkillOutputModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('skillmd');
  const [copiedTab, setCopiedTab] = useState<Tab | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleCopy = useCallback(
    (tab: Tab) => {
      const text = tab === 'skillmd' ? skillMd : contentYaml;
      navigator.clipboard.writeText(text).then(() => {
        setCopiedTab(tab);
        setTimeout(() => setCopiedTab(null), 2000);
      });
    },
    [skillMd, contentYaml]
  );

  const handleDownload = useCallback(
    (tab: Tab) => {
      const text = tab === 'skillmd' ? skillMd : contentYaml;
      const filename =
        tab === 'skillmd' ? 'SKILL.md' : `${skillName || 'skill'}.yaml`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    [skillMd, contentYaml, skillName]
  );

  const handleDownloadBoth = useCallback(() => {
    handleDownload('skillmd');
    setTimeout(() => handleDownload('yaml'), 200);
  }, [handleDownload]);

  if (!isOpen) return null;

  const activeContent = activeTab === 'skillmd' ? skillMd : contentYaml;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-gray-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Generated Skill Files
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {skillName ? `${skillName}/` : ''}SKILL.md + content YAML
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('skillmd')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'skillmd'
                ? 'border-b-2 border-cyan-500 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SKILL.md
          </button>
          <button
            onClick={() => setActiveTab('yaml')}
            className={`px-5 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'yaml'
                ? 'border-b-2 border-cyan-500 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Content YAML
          </button>

          {/* Tab actions */}
          <div className="ml-auto flex items-center gap-2 px-4">
            <button
              onClick={() => handleCopy(activeTab)}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {copiedTab === activeTab ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => handleDownload(activeTab)}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Download
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <pre className="p-5 text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
            {activeContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3">
          <p className="text-xs text-slate-600">
            Files are ready for review. Submit via PR for physician review.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadBoth}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Download Both
            </button>
            <a
              href="/submit"
              className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors inline-flex items-center gap-1.5"
            >
              Submit to OMS
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
