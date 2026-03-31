/**
 * SectionPreview.tsx -- Real-time markdown preview for the current section.
 *
 * Renders the accepted/refined content as formatted markdown. Supports
 * editing, copying, and live updates.
 */

import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';

interface SectionPreviewProps {
  sectionId: string;
  content: string;
  onEdit: (newContent: string) => void;
}

export default function SectionPreview({
  sectionId,
  content,
  onEdit,
}: SectionPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handleStartEdit = useCallback(() => {
    setEditContent(content);
    setIsEditing(true);
  }, [content]);

  const handleSaveEdit = useCallback(() => {
    onEdit(editContent);
    setIsEditing(false);
  }, [editContent, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent('');
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <aside className="hidden w-80 shrink-0 border-l border-slate-800 bg-gray-950 lg:block xl:w-96">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Preview
          </h3>
          {content && (
            <div className="flex items-center gap-1">
              {!isEditing && (
                <>
                  <button
                    onClick={handleStartEdit}
                    className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                    title="Edit content"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isEditing ? (
            <div className="flex flex-col h-full gap-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="flex-1 min-h-[200px] rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-white font-mono resize-none focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : content ? (
            <div className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 prose-blockquote:border-cyan-500/50 prose-blockquote:text-slate-400">
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-600 italic text-center px-4">
                Complete this section to see a preview. Write your content or use{' '}
                <span className="text-cyan-500">Refine with AI</span> to generate it.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
