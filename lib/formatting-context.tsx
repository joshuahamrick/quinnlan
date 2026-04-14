'use client';

import { createContext, useContext, useRef, useCallback, useState } from 'react';

interface FormattingContextValue {
  registerEditable: (ref: HTMLDivElement) => void;
  unregisterEditable: () => void;
  applyFormatting: (type: 'bold' | 'italic' | 'bullet') => void;
  isActive: boolean;
}

const FormattingContext = createContext<FormattingContextValue | null>(null);

export function FormattingProvider({ children }: { children: React.ReactNode }) {
  const editableRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  const registerEditable = useCallback((ref: HTMLDivElement) => {
    editableRef.current = ref;
    setIsActive(true);
  }, []);

  const unregisterEditable = useCallback(() => {
    editableRef.current = null;
    setIsActive(false);
  }, []);

  const applyFormatting = useCallback((type: 'bold' | 'italic' | 'bullet') => {
    const editable = editableRef.current;
    if (!editable) return;

    editable.focus();

    if (type === 'bold') {
      document.execCommand('bold');
    } else if (type === 'italic') {
      document.execCommand('italic');
    } else if (type === 'bullet') {
      // Handle empty or blank editable — insert a bullet div and place cursor
      if (editable.innerHTML === '' || editable.innerHTML === '<br>') {
        editable.innerHTML = '<div>• </div>';
        const sel = window.getSelection();
        const textNode = editable.querySelector('div')?.firstChild;
        if (textNode && sel) {
          const newRange = document.createRange();
          newRange.setStart(textNode, 2); // after "• "
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        editable.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let node: Node | null = range.startContainer;
      // Walk up to find the immediate child of the editable div
      while (node && node.parentNode !== editable) {
        node = node.parentNode;
      }

      if (node && node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const text = el.textContent || '';
        if (text.startsWith('• ')) {
          el.textContent = text.slice(2);
        } else {
          el.textContent = '• ' + text;
        }
      } else if (node && node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text.startsWith('• ')) {
          node.textContent = text.slice(2);
        } else {
          node.textContent = '• ' + text;
        }
      }

      // Trigger input event so React picks up the change
      editable.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, []);

  return (
    <FormattingContext.Provider value={{ registerEditable, unregisterEditable, applyFormatting, isActive }}>
      {children}
    </FormattingContext.Provider>
  );
}

export function useFormatting() {
  const ctx = useContext(FormattingContext);
  if (!ctx) throw new Error('useFormatting must be used within FormattingProvider');
  return ctx;
}

/** Convert markdown-style text to HTML for contentEditable */
export function markdownToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      // Convert **bold** and *italic*
      let html = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
      return `<div>${html || '<br>'}</div>`;
    })
    .join('');
}

/** Convert contentEditable HTML back to markdown-style text */
export function htmlToMarkdown(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  const lines: string[] = [];

  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    let inner = Array.from(el.childNodes).map(processNode).join('');

    if (tag === 'strong' || tag === 'b') return `**${inner}**`;
    if (tag === 'em' || tag === 'i') return `*${inner}*`;
    if (tag === 'br') return '\n';
    if (tag === 'div' || tag === 'p') {
      lines.push(inner);
      return '';
    }
    return inner;
  }

  // If the HTML has div/p children, process them as lines
  const children = Array.from(temp.childNodes);
  const hasDivs = children.some(
    (n) => n.nodeType === Node.ELEMENT_NODE && ['DIV', 'P'].includes((n as HTMLElement).tagName)
  );

  if (hasDivs) {
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === 'div' || tag === 'p') {
          let inner = Array.from(el.childNodes).map(processNode).join('');
          // Normalize bullet prefixes: ensure "• " (with space) consistently
          const trimmed = inner.trimStart();
          if (trimmed.startsWith('•') && !trimmed.startsWith('• ')) {
            inner = '• ' + trimmed.slice(1);
          }
          lines.push(inner);
        } else {
          // Inline element at top level
          const text = processNode(child);
          if (text) lines.push(text);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (text.trim()) lines.push(text);
      }
    });
  } else {
    // No divs — flat content, split on <br>
    const text = Array.from(temp.childNodes).map(processNode).join('');
    return text;
  }

  return lines.join('\n');
}
