'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFormatting, markdownToHtml, htmlToMarkdown } from '@/lib/formatting-context';

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

    if (isBullet) {
      return (
        <span key={lineIdx} className="block pl-4">
          {lineIdx > 0 && '\n'}
          <span className="mr-1">•</span>
          <span>{parts}</span>
        </span>
      );
    }

    return (
      <span key={lineIdx}>
        {lineIdx > 0 && '\n'}
        {parts}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const { registerEditable, unregisterEditable } = useFormatting();

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && multiline && editableRef.current) {
      const cleanDraft = draft.trim();
      editableRef.current.innerHTML = cleanDraft ? markdownToHtml(cleanDraft) : '';
      editableRef.current.focus();
      // Select all content
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editableRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      registerEditable(editableRef.current);
    } else if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
    if (!editing && multiline) {
      unregisterEditable();
    }
  }, [editing, multiline, registerEditable, unregisterEditable]);

  const save = useCallback(() => {
    if (multiline && editableRef.current) {
      let md = htmlToMarkdown(editableRef.current.innerHTML);
      // Trim whitespace/newlines; collapse runs of 3+ newlines to 2
      md = md.trim().replace(/\n{3,}/g, '\n\n');
      setEditing(false);
      if (md !== value) {
        setDraft(md);
        onChange(md);
      }
    } else {
      setEditing(false);
      if (draft !== value) {
        onChange(draft);
      }
    }
  }, [draft, value, onChange, multiline]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancel();
    } else if (e.key === 'Backspace' && multiline) {
      // Remove bullet prefix when backspacing on an empty bullet line
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      if (node === editableRef.current) {
        node = editableRef.current.childNodes[range.startOffset] ||
               editableRef.current.childNodes[range.startOffset - 1] || null;
      }
      while (node && node !== editableRef.current && node.parentNode !== editableRef.current) {
        node = node.parentNode;
      }
      if (node === editableRef.current) node = null;

      if (node) {
        const text = (node.textContent || '').replace(/\u200B/g, '');
        if (text === '• ' || text === '•') {
          e.preventDefault();
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Use <br> to keep the empty div alive in contentEditable
            (node as HTMLElement).innerHTML = '<br>';
          } else {
            node.textContent = '\u200B';
          }
          const newRange = document.createRange();
          newRange.setStart(node, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } else if (e.key === 'Enter' && !multiline) {
      save();
    } else if (e.key === 'Enter' && multiline && !e.shiftKey) {
      // Bullet continuation: when pressing Enter on a bullet line,
      // auto-insert a new bullet. If the bullet is empty, end the list.
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      // If the cursor is at the editable container level, pick the child at offset
      if (node === editableRef.current) {
        node = editableRef.current.childNodes[range.startOffset] ||
               editableRef.current.childNodes[range.startOffset - 1] || null;
      }
      // Walk up to find the immediate child div of the editable container
      while (node && node !== editableRef.current && node.parentNode !== editableRef.current) {
        node = node.parentNode;
      }
      // If we walked up to the editable itself, that's not a line node
      if (node === editableRef.current) node = null;

      if (node) {
        const text = (node.textContent || '').replace(/\u200B/g, '');
        if (text.startsWith('• ') || text.startsWith('•')) {
          // Check if cursor is at the very start of the line (before the bullet)
          const cursorOffset = range.startOffset;
          const isAtStart = cursorOffset === 0 && range.startContainer === node.firstChild;
          const isAtDivStart = range.startContainer === node && cursorOffset === 0;

          if (isAtStart || isAtDivStart) {
            e.preventDefault();
            // Insert a blank line ABOVE the current bullet
            const newDiv = document.createElement('div');
            newDiv.innerHTML = '<br>';
            editableRef.current!.insertBefore(newDiv, node);
            // Place cursor in the new blank line
            const newRange = document.createRange();
            newRange.setStart(newDiv, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            return;
          }

          e.preventDefault();
          // Always insert a new bullet line after the current one
          const newDiv = document.createElement('div');
          newDiv.textContent = '• ';
          if (node.nextSibling) {
            editableRef.current!.insertBefore(newDiv, node.nextSibling);
          } else {
            editableRef.current!.appendChild(newDiv);
          }
          // Place cursor after "• " using non-breaking space to prevent collapse
          const newRange = document.createRange();
          const textNode = newDiv.firstChild!;
          newRange.setStart(textNode, 2);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
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
        {value.trim() ? (
          multiline ? renderFormattedText(value) : value
        ) : (
          <span className="text-gray-400 italic" data-export-hide>{placeholder}</span>
        )}
      </span>
    );
  }

  if (multiline) {
    return (
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={`w-full border border-blue-400 rounded px-1 py-0.5 text-sm outline-none min-h-[3em] whitespace-pre-wrap ${className} ${inputAlign}`}
        style={{ resize: 'vertical', overflow: 'auto' }}
        data-placeholder={placeholder}
      />
    );
  }

  return (
    <input
      ref={inputRef}
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
