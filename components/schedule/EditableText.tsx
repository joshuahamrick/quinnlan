'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

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
    // Match **bold** or *italic* segments
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;
    let partKey = 0;

    while ((match = regex.exec(content)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      if (match[2] !== undefined) {
        // **bold**
        parts.push(<strong key={partKey++}>{match[2]}</strong>);
      } else if (match[3] !== undefined) {
        // *italic*
        parts.push(<em key={partKey++}>{match[3]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    // If no parts were created, use the content as-is
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

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

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

  const applyFormatting = (type: 'bold' | 'italic' | 'bullet') => {
    const textarea = inputRef.current as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = draft;

    let newText: string;
    let cursorPos: number;

    if (type === 'bullet') {
      // Find the start of the current line
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineContent = text.slice(lineStart);
      if (lineContent.startsWith('• ')) {
        // Remove bullet
        newText = text.slice(0, lineStart) + text.slice(lineStart + 2);
        cursorPos = Math.max(start - 2, lineStart);
      } else {
        newText = text.slice(0, lineStart) + '• ' + text.slice(lineStart);
        cursorPos = start + 2;
      }
    } else {
      const wrapper = type === 'bold' ? '**' : '*';
      if (start === end) {
        // No selection — insert empty wrapper
        newText = text.slice(0, start) + wrapper + wrapper + text.slice(end);
        cursorPos = start + wrapper.length;
      } else {
        const selected = text.slice(start, end);
        newText = text.slice(0, start) + wrapper + selected + wrapper + text.slice(end);
        cursorPos = end + wrapper.length * 2;
      }
    }

    setDraft(newText);
    // Restore focus and cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  };

  // Extract alignment from [&_input]:text-* patterns and pass them to the input directly
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
      <div>
        <div
          className="flex items-center gap-0.5 mb-1"
          data-export-hide
        >
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('bold'); }}
            className="px-1.5 py-0.5 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('italic'); }}
            className="px-1.5 py-0.5 text-xs italic text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); applyFormatting('bullet'); }}
            className="px-1.5 py-0.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            title="Bullet point"
          >
            •
          </button>
        </div>
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          className={`w-full border border-blue-400 rounded px-1 py-0.5 text-sm outline-none resize-y min-h-[3em] ${className} ${inputAlign}`}
          placeholder={placeholder}
        />
      </div>
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
