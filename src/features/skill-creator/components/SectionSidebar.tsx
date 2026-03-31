/**
 * SectionSidebar.tsx -- Section navigation sidebar for the skill creator.
 *
 * Displays a vertical list of all skill sections with completion status
 * indicators. Styled like a clinical checklist with progress tracking.
 */

import type { SkillSection } from '../types';

interface SectionSidebarProps {
  sections: SkillSection[];
  activeSectionId: string;
  onSectionSelect: (id: string) => void;
  onAddSection: () => void;
  onRemoveSection: (id: string) => void;
}

const STATUS_ICONS: Record<SkillSection['status'], { icon: string; color: string }> = {
  empty: { icon: '', color: 'border-slate-700' },
  draft: { icon: '', color: 'border-amber-500 bg-amber-500/20' },
  refined: { icon: '', color: 'border-cyan-500 bg-cyan-500/20' },
  accepted: { icon: '', color: 'border-emerald-500 bg-emerald-500' },
};

function StatusDot({ status }: { status: SkillSection['status'] }) {
  const config = STATUS_ICONS[status];
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold ${config.color}`}
      aria-label={`Status: ${status}`}
    >
      {status === 'accepted' && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'refined' && (
        <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {status === 'draft' && (
        <span className="block w-1.5 h-1.5 rounded-full bg-amber-400" />
      )}
    </span>
  );
}

export default function SectionSidebar({
  sections,
  activeSectionId,
  onSectionSelect,
  onAddSection,
  onRemoveSection,
}: SectionSidebarProps) {
  const standardSections = sections.filter(
    (s) => !s.customTitle && s.id !== 'custom'
  );
  const customSections = sections.filter(
    (s) => s.customTitle || (!['title', 'description', 'quick-install', 'what-it-does', 'clinical-use-cases', 'safety-evidence', 'example-usage', 'technical-details', 'references'].includes(s.id))
  );

  return (
    <aside className="w-56 shrink-0 border-r border-slate-800 bg-gray-950 overflow-y-auto lg:w-64">
      <nav className="flex flex-col h-full p-3">
        <h2 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Skill Sections
        </h2>

        <ul className="flex-1 space-y-0.5" role="list">
          {standardSections.map((section, idx) => {
            const isActive = section.id === activeSectionId;
            return (
              <li key={section.id}>
                <button
                  onClick={() => onSectionSelect(section.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? 'bg-cyan-950/50 text-white'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <StatusDot status={section.status} />
                  <span className="truncate">
                    <span className="text-slate-600 text-xs mr-1.5">{idx + 1}.</span>
                    {section.displayName}
                  </span>
                  {section.required && (
                    <span className="ml-auto text-[9px] text-red-400/60">*</span>
                  )}
                </button>
              </li>
            );
          })}

          {customSections.length > 0 && (
            <>
              <li className="pt-3 pb-1">
                <span className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Custom
                </span>
              </li>
              {customSections.map((section) => {
                const isActive = section.id === activeSectionId;
                return (
                  <li key={section.id}>
                    <div className="flex items-center group">
                      <button
                        onClick={() => onSectionSelect(section.id)}
                        className={`flex flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-cyan-950/50 text-white'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <StatusDot status={section.status} />
                        <span className="truncate">{section.customTitle ?? section.displayName}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSection(section.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all"
                        title="Remove section"
                        aria-label={`Remove ${section.displayName}`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </>
          )}
        </ul>

        <button
          onClick={onAddSection}
          className="mt-3 w-full rounded-lg border border-dashed border-slate-700 py-2 text-xs text-slate-500 hover:border-cyan-600 hover:text-cyan-400 transition-colors"
        >
          + Add Section
        </button>
      </nav>
    </aside>
  );
}
