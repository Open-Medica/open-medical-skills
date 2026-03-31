/**
 * MetadataEditor.tsx -- Structured form for skill metadata fields.
 *
 * Shown in the chat interface when the user is editing the "Technical Details"
 * section. Provides dropdowns for category, evidence level, and safety classification
 * along with text inputs for author, tags, license, etc.
 */

import type { SkillMetadata, MedicalCategory, EvidenceLevel, SafetyClassification } from '../types';
import { MEDICAL_CATEGORIES } from '../lib/skill-templates';

interface MetadataEditorProps {
  metadata: SkillMetadata;
  onUpdate: (partial: Partial<SkillMetadata>) => void;
}

const EVIDENCE_LEVELS: { value: EvidenceLevel; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'low', label: 'Low' },
  { value: 'expert-opinion', label: 'Expert Opinion' },
];

const SAFETY_LEVELS: { value: SafetyClassification; label: string }[] = [
  { value: 'safe', label: 'Safe' },
  { value: 'caution', label: 'Caution' },
  { value: 'restricted', label: 'Restricted' },
];

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-400 mb-1">
      {children}
    </label>
  );
}

function InputField({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-colors"
    />
  );
}

function SelectField({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-sm text-white focus:border-cyan-600 focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-colors appearance-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function MetadataEditor({ metadata, onUpdate }: MetadataEditorProps) {
  return (
    <div className="border-b border-slate-800 bg-slate-900/30 px-5 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
        Skill Metadata
      </h3>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-3">
        {/* Author */}
        <div>
          <FieldLabel htmlFor="meta-author">Author</FieldLabel>
          <InputField
            id="meta-author"
            value={metadata.author}
            onChange={(val) => onUpdate({ author: val })}
            placeholder="Dr. Jane Smith"
          />
        </div>

        {/* Category */}
        <div>
          <FieldLabel htmlFor="meta-category">Category</FieldLabel>
          <SelectField
            id="meta-category"
            value={metadata.category}
            onChange={(val) => onUpdate({ category: val as MedicalCategory })}
            options={MEDICAL_CATEGORIES}
          />
        </div>

        {/* Evidence Level */}
        <div>
          <FieldLabel htmlFor="meta-evidence">Evidence Level</FieldLabel>
          <SelectField
            id="meta-evidence"
            value={metadata.evidenceLevel}
            onChange={(val) => onUpdate({ evidenceLevel: val as EvidenceLevel })}
            options={EVIDENCE_LEVELS}
          />
        </div>

        {/* Safety */}
        <div>
          <FieldLabel htmlFor="meta-safety">Safety Classification</FieldLabel>
          <SelectField
            id="meta-safety"
            value={metadata.safetyClassification}
            onChange={(val) => onUpdate({ safetyClassification: val as SafetyClassification })}
            options={SAFETY_LEVELS}
          />
        </div>

        {/* License */}
        <div>
          <FieldLabel htmlFor="meta-license">License</FieldLabel>
          <InputField
            id="meta-license"
            value={metadata.license}
            onChange={(val) => onUpdate({ license: val })}
            placeholder="MIT"
          />
        </div>

        {/* Version */}
        <div>
          <FieldLabel htmlFor="meta-version">Version</FieldLabel>
          <InputField
            id="meta-version"
            value={metadata.version}
            onChange={(val) => onUpdate({ version: val })}
            placeholder="1.0.0"
          />
        </div>

        {/* Repository */}
        <div className="col-span-2">
          <FieldLabel htmlFor="meta-repo">Repository URL</FieldLabel>
          <InputField
            id="meta-repo"
            value={metadata.repository}
            onChange={(val) => onUpdate({ repository: val })}
            placeholder="https://github.com/..."
          />
        </div>

        {/* Tags */}
        <div className="col-span-2 lg:col-span-1">
          <FieldLabel htmlFor="meta-tags">Tags (comma-separated)</FieldLabel>
          <InputField
            id="meta-tags"
            value={metadata.tags.join(', ')}
            onChange={(val) =>
              onUpdate({
                tags: val
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="drug-interactions, medication-safety"
          />
        </div>

        {/* Specialty */}
        <div className="col-span-2 lg:col-span-3">
          <FieldLabel htmlFor="meta-specialty">Specialty (comma-separated)</FieldLabel>
          <InputField
            id="meta-specialty"
            value={metadata.specialty.join(', ')}
            onChange={(val) =>
              onUpdate({
                specialty: val
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Pharmacy, Clinical Pharmacology"
          />
        </div>
      </div>
    </div>
  );
}
