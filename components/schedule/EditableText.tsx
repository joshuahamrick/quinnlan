'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFormatting } from '@/lib/formatting-context';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}

function renderFormattedText(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const isBullet = line.startsWith('• ');
    const content = isBullet ? line.slice(2) : line;

    // Parse inline formatting: **bold** and *italic*
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;
    let partKey = 0;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      if (match[2] !== undefined) {
        parts.push(<strong key={partKey++}>{match[2]}</strong>);
      } else if (match[3] !== undefined) {
        parts.push(<em key={partKey++}>{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    if (parts.length === 0) {
      parts.push(content);
    }

    return (
      <span key={lineIdx}>
        {lineIdx > 0 && '\n'}
        {isBullet && <span className="mr-1">•</span>}
        {isBullet ? <span className="ml-0.5">{parts}</span> : parts}
      </span>
    );
  });
}

export default function EditableText({
  value,
  onChange,
  placeholder = 'Click to edit',
  className = '',
  multiline = false,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const { registerTextarea, unregisterTextarea } = useFormatting();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();

      // Register multiline textareas with the formatting context
      if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
        registerTextarea(inputRef.current, setDraft);
      }
    }
    if (!editing && multiline) {
      unregisterTextarea();
    }
  }, [editing, multiline, registerTextarea, unregisterTextarea]);

  const save = useCallback(() => {
    setEditing(false);
    if (draft !== value) {
      onChange(draft);
    }
  }, [draft, value, onChange]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancel();
    } else if (e.key === 'Enter' && !multiline) {
      save();
    }
  };

  // Extract alignment from [&_input]:text-* patterns
  const alignMatch = className.match(/\[&_input\]:text-(center|right|left)/);
  const inputAlign = alignMatch ? `text-${alignMatch[1]}` : '';
  const displayAlign = inputAlign;

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-blue-50 px-0.5 rounded transition-colors block ${multiline ? 'whitespace-pre-wrap' : ''} ${displayAlign} ${className}`}
        onClick={() => setEditing(true)}
      >
        {value ? (
          multiline ? renderFormattedText(value) : value
        ) : (
          <span className="text-gray-400 italic" data-export-hide>{placeholder}</span>
        )}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={`w-full border border-blue-400 rounded px-1 py-0.5 text-sm outline-none resize-y min-h-[3em] ${className} ${inputAlign}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={handleKeyDown}
      className={`border border-blue-400 rounded px-1 py-0.5 text-sm outline-none w-full ${className} ${inputAlign}`}
      placeholder={placeholder}
    />
  );
}
