'use client';

import { createContext, useContext, useRef, useCallback, useState } from 'react';

interface FormattingContextValue {
  registerTextarea: (ref: HTMLTextAreaElement, setDraft: (text: string) => void) => void;
  unregisterTextarea: () => void;
  applyFormatting: (type: 'bold' | 'italic' | 'bullet') => void;
  isActive: boolean;
}

const FormattingContext = createContext<FormattingContextValue | null>(null);

export function FormattingProvider({ children }: { children: React.ReactNode }) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftSetterRef = useRef<((text: string) => void) | null>(null);
  const [isActive, setIsActive] = useState(false);

  const registerTextarea = useCallback((ref: HTMLTextAreaElement, setDraft: (text: string) => void) => {
    textareaRef.current = ref;
    draftSetterRef.current = setDraft;
    setIsActive(true);
  }, []);

  const unregisterTextarea = useCallback(() => {
    textareaRef.current = null;
    draftSetterRef.current = null;
    setIsActive(false);
  }, []);

  const applyFormatting = useCallback((type: 'bold' | 'italic' | 'bullet') => {
    const textarea = textareaRef.current;
    const setDraft = draftSetterRef.current;
    if (!textarea || !setDraft) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    let newText: string;
    let cursorPos: number;

    if (type === 'bullet') {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineContent = text.slice(lineStart);
      if (lineContent.startsWith('• ')) {
        newText = text.slice(0, lineStart) + text.slice(lineStart + 2);
        cursorPos = Math.max(start - 2, lineStart);
      } else {
        newText = text.slice(0, lineStart) + '• ' + text.slice(lineStart);
        cursorPos = start + 2;
      }
    } else {
      const wrapper = type === 'bold' ? '**' : '*';
      if (start === end) {
        newText = text.slice(0, start) + wrapper + wrapper + text.slice(end);
        cursorPos = start + wrapper.length;
      } else {
        const selected = text.slice(start, end);
        newText = text.slice(0, start) + wrapper + selected + wrapper + text.slice(end);
        cursorPos = end + wrapper.length * 2;
      }
    }

    setDraft(newText);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }, []);

  return (
    <FormattingContext.Provider value={{ registerTextarea, unregisterTextarea, applyFormatting, isActive }}>
      {children}
    </FormattingContext.Provider>
  );
}

export function useFormatting() {
  const ctx = useContext(FormattingContext);
  if (!ctx) throw new Error('useFormatting must be used within FormattingProvider');
  return ctx;
}
