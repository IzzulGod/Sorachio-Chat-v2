
import React, { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface AutoResizeTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
}

export const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  placeholder, 
  onKeyDown, 
  className 
}: AutoResizeTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Max height in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className={`min-h-[60px] max-h-[200px] resize-none pr-12 transition-all duration-200 ${className}`}
      style={{ overflow: 'auto' }}
    />
  );
};
