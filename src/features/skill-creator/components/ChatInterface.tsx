/**
 * ChatInterface.tsx -- Main chat UI for the skill creator.
 *
 * Center panel containing:
 * - Section header with guidance text
 * - Chat message history for the active section
 * - Metadata editor (for technical-details section)
 * - Text input with Refine with AI button
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { SkillSection, ChatMessage, SkillMetadata, MedicalCategory, EvidenceLevel, SafetyClassification } from '../types';
import { SECTION_PLACEHOLDERS, MEDICAL_CATEGORIES } from '../lib/skill-templates';
import type { SectionId } from '../types';
import MagicButton from './MagicButton';
import MetadataEditor from './MetadataEditor';

interface ChatInterfaceProps {
  section: SkillSection;
  messages: ChatMessage[];
  isGenerating: boolean;
  streamingContent: string;
  onRefine: (content: string) => void;
  onAccept: (content: string) => void;
  metadata: SkillMetadata;
  onUpdateMetadata: (metadata: Partial<SkillMetadata>) => void;
}

export default function ChatInterface({
  section,
  messages,
  isGenerating,
  streamingContent,
  onRefine,
  onAccept,
  metadata,
  onUpdateMetadata,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load section content into input when switching sections
  useEffect(() => {
    if (section.content && section.status === 'empty') {
      setInputValue(section.content);
    } else if (messages.length === 0 && !section.content) {
      setInputValue('');
    }
  }, [section.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputValue.trim() && !isGenerating) {
          onRefine(inputValue.trim());
        }
      }
    },
    [inputValue, isGenerating, onRefine]
  );

  const handleSubmit = useCallback(() => {
    if (inputValue.trim() && !isGenerating) {
      onRefine(inputValue.trim());
    }
  }, [inputValue, isGenerating, onRefine]);

  const placeholder =
    SECTION_PLACEHOLDERS[section.id as SectionId] ??
    SECTION_PLACEHOLDERS.custom;

  // Determine if the latest assistant message can be accepted
  const lastAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && !m.content.startsWith('Error:'));
  const canAccept = lastAssistantMsg && !isGenerating;

  const showMetadata = section.id === 'technical-details';

  return (
    <main className="flex flex-1 flex-col min-w-0 bg-gray-950">
      {/* Section header */}
      <div className="border-b border-slate-800 bg-gray-950 px-5 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">{section.displayName}</h2>
          {section.required && (
            <span className="rounded bg-red-900/30 px-1.5 py-0.5 text-[10px] font-medium text-red-400">
              Required
            </span>
          )}
          {section.status !== 'empty' && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                section.status === 'accepted' || section.status === 'refined'
                  ? 'bg-emerald-900/30 text-emerald-400'
                  : 'bg-amber-900/30 text-amber-400'
              }`}
            >
              {section.status}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-2xl">
          {placeholder}
        </p>
      </div>

      {/* Metadata editor (shown only for technical-details section) */}
      {showMetadata && (
        <MetadataEditor metadata={metadata} onUpdate={onUpdateMetadata} />
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && !streamingContent && !isGenerating && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-2xl bg-slate-800/30 p-6 max-w-md">
              <div className="text-2xl mb-3">
                <svg className="w-8 h-8 mx-auto text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <p className="text-sm text-slate-400">
                Write your rough content below, then click{' '}
                <span className="text-cyan-400 font-medium">Refine with AI</span>{' '}
                to transform it into physician-grade documentation.
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Ctrl+Enter to send
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onAccept={
              msg === lastAssistantMsg && canAccept
                ? () => onAccept(msg.content)
                : undefined
            }
          />
        ))}

        {/* Streaming indicator */}
        {isGenerating && streamingContent && (
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-cyan-400">
                AI Response
              </span>
              <span className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </span>
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
              {streamingContent}
            </div>
          </div>
        )}

        {isGenerating && !streamingContent && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Refining your content...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-800 bg-gray-950 p-4">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-colors"
          />
          <div className="flex flex-col gap-1.5">
            <MagicButton
              onClick={handleSubmit}
              isLoading={isGenerating}
              disabled={!inputValue.trim()}
            />
            {inputValue.trim() && !isGenerating && (
              <button
                onClick={() => {
                  onAccept(inputValue.trim());
                  setInputValue('');
                }}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Save as-is without AI refinement"
              >
                Save Raw
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/** Individual chat message bubble. */
function MessageBubble({
  message,
  onAccept,
}: {
  message: ChatMessage;
  onAccept?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === 'user';
  const isError = message.role === 'assistant' && message.content.startsWith('Error:');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-cyan-900/30 border border-cyan-800/40'
            : isError
              ? 'bg-red-950/30 border border-red-800/40'
              : 'bg-slate-800/50 border border-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${
              isUser ? 'text-cyan-400' : isError ? 'text-red-400' : 'text-slate-500'
            }`}
          >
            {isUser ? 'You' : 'AI'}
          </span>
          <span className="text-[10px] text-slate-600">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div
          className={`text-sm whitespace-pre-wrap leading-relaxed ${
            isUser ? 'text-slate-200' : isError ? 'text-red-300' : 'text-slate-300'
          } ${!isUser ? 'font-mono' : ''}`}
        >
          {message.content}
        </div>

        {!isUser && !isError && (
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/30">
            {onAccept && (
              <button
                onClick={onAccept}
                className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-500 transition-colors"
              >
                Accept
              </button>
            )}
            <button
              onClick={handleCopy}
              className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
