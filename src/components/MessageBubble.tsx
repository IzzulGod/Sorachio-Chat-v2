
import { Message } from '@/types/chat';
import { User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [katexReady, setKatexReady] = useState(false);
  
  // Simple KaTeX loader
  useEffect(() => {
    if (isUser || katexReady) return;
    
    const loadKaTeX = async () => {
      try {
        // Check if already loaded
        if ((window as any).katex && (window as any).renderMathInElement) {
          setKatexReady(true);
          return;
        }

        // Load CSS
        if (!document.querySelector('link[href*="katex"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          document.head.appendChild(link);
        }

        // Load KaTeX
        if (!(window as any).katex) {
          const script1 = document.createElement('script');
          script1.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
          script1.onload = () => {
            // Load auto-render after KaTeX
            const script2 = document.createElement('script');
            script2.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
            script2.onload = () => setKatexReady(true);
            document.head.appendChild(script2);
          };
          document.head.appendChild(script1);
        }
      } catch (error) {
        console.warn('KaTeX loading failed:', error);
      }
    };

    loadKaTeX();
  }, [isUser, katexReady]);

  // Render math when ready
  useEffect(() => {
    if (!katexReady || !contentRef.current || isUser) return;

    const renderMath = () => {
      try {
        if ((window as any).renderMathInElement && contentRef.current) {
          (window as any).renderMathInElement(contentRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false,
            errorColor: '#cc0000'
          });
        }
      } catch (error) {
        console.warn('Math rendering failed:', error);
      }
    };

    setTimeout(renderMath, 50);
    setTimeout(renderMath, 200);
    setTimeout(renderMath, 500);
  }, [katexReady, message.content, isUser]);

  const processContent = (content: string) => {
    let processed = content;

    // Code blocks with language detection
    processed = processed.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">${language}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText('${escapeHtml(code.trim()).replace(/'/g, "\\'")}')">Copy</button>
        </div>
        <pre class="code-block" data-language="${language}"><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>
      </div>`;
    });

    // Inline code
    processed = processed.replace(/`([^`\n]+)`/g, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // Headers
    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="header-${level}">${text.trim()}</h${level}>`;
    });

    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    processed = processed.replace(/^[\-\*]\s+(.+)$/gm, '<li class="list-item">$1</li>');
    processed = processed.replace(/(<li class="list-item">.*?<\/li>)/gs, '<ul class="list">$1</ul>');

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="link" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks
    processed = processed.replace(/\n/g, '<br>');

    return processed;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3 w-full`}>
      {!isUser && (
        <img 
          src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
          alt="Sorachio" 
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      
      <div className={`
        px-4 py-3 rounded-lg relative
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-sm max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]'
        }
      `}>
        {message.image && (
          <img 
            src={message.image} 
            alt="Uploaded image" 
            className="max-w-full rounded-lg mb-2"
          />
        )}
        
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div
            ref={contentRef}
            className="text-sm message-content break-words"
            dangerouslySetInnerHTML={{ __html: processContent(message.content) }}
          />
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}

      <style>{`
        .message-content {
          line-height: 1.6;
          word-wrap: break-word;
        }

        /* Math styling */
        .message-content .katex {
          font-size: 1.1em;
        }

        .message-content .katex-display {
          margin: 16px 0;
          text-align: center;
          overflow-x: auto;
        }

        .message-content .katex-error {
          color: #cc0000;
          background: #ffebee;
          padding: 2px 4px;
          border-radius: 3px;
        }

        /* Headers */
        .message-content .header-1 { font-size: 1.4em; font-weight: bold; margin: 12px 0 8px 0; color: #1a1a1a; }
        .message-content .header-2 { font-size: 1.25em; font-weight: bold; margin: 12px 0 8px 0; color: #1a1a1a; }
        .message-content .header-3 { font-size: 1.15em; font-weight: bold; margin: 12px 0 8px 0; color: #1a1a1a; }

        /* Dark mode headers */
        .dark .message-content .header-1,
        .dark .message-content .header-2,
        .dark .message-content .header-3 { 
          color: #e5e5e5; 
        }

        /* Text formatting */
        .message-content strong { font-weight: bold; }
        .message-content em { font-style: italic; }

        /* Lists */
        .message-content .list {
          margin: 8px 0;
          padding-left: 20px;
          list-style-type: disc;
        }
        .message-content .list-item {
          margin: 4px 0;
        }

        /* Links */
        .message-content .link {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .message-content .link:hover {
          color: #1d4ed8;
        }

        /* Dark mode links */
        .dark .message-content .link {
          color: #60a5fa;
        }
        .dark .message-content .link:hover {
          color: #93c5fd;
        }

        /* Code blocks container */
        .message-content .code-block-container {
          margin: 12px 0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        /* Code block header */
        .message-content .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          padding: 8px 12px;
          border-bottom: 1px solid #e9ecef;
          font-size: 12px;
        }

        .dark .message-content .code-block-header {
          background: #2d3748;
          border-bottom-color: #4a5568;
          color: #e2e8f0;
        }

        .message-content .code-language {
          font-weight: 600;
          text-transform: uppercase;
          color: #6b7280;
        }

        .dark .message-content .code-language {
          color: #9ca3af;
        }

        .message-content .copy-btn {
          background: #e5e7eb;
          border: none;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: background-color 0.2s;
        }

        .message-content .copy-btn:hover {
          background: #d1d5db;
        }

        .dark .message-content .copy-btn {
          background: #4a5568;
          color: #e2e8f0;
        }

        .dark .message-content .copy-btn:hover {
          background: #2d3748;
        }

        /* Code blocks */
        .message-content .code-block {
          background: #ffffff;
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          border: none;
        }

        .dark .message-content .code-block {
          background: #1a202c;
          color: #e2e8f0;
        }

        /* Syntax highlighting for light mode */
        .message-content .code-block .token.comment,
        .message-content .code-block .token.prolog,
        .message-content .code-block .token.doctype,
        .message-content .code-block .token.cdata {
          color: #6a737d;
          font-style: italic;
        }

        .message-content .code-block .token.punctuation {
          color: #586069;
        }

        .message-content .code-block .token.property,
        .message-content .code-block .token.tag,
        .message-content .code-block .token.boolean,
        .message-content .code-block .token.number,
        .message-content .code-block .token.constant,
        .message-content .code-block .token.symbol {
          color: #005cc5;
        }

        .message-content .code-block .token.selector,
        .message-content .code-block .token.attr-name,
        .message-content .code-block .token.string,
        .message-content .code-block .token.char,
        .message-content .code-block .token.builtin {
          color: #032f62;
        }

        .message-content .code-block .token.operator,
        .message-content .code-block .token.entity,
        .message-content .code-block .token.url {
          color: #d73a49;
        }

        .message-content .code-block .token.atrule,
        .message-content .code-block .token.attr-value,
        .message-content .code-block .token.keyword {
          color: #d73a49;
        }

        .message-content .code-block .token.function,
        .message-content .code-block .token.class-name {
          color: #6f42c1;
        }

        /* Syntax highlighting for dark mode */
        .dark .message-content .code-block .token.comment,
        .dark .message-content .code-block .token.prolog,
        .dark .message-content .code-block .token.doctype,
        .dark .message-content .code-block .token.cdata {
          color: #8b949e;
          font-style: italic;
        }

        .dark .message-content .code-block .token.punctuation {
          color: #c9d1d9;
        }

        .dark .message-content .code-block .token.property,
        .dark .message-content .code-block .token.tag,
        .dark .message-content .code-block .token.boolean,
        .dark .message-content .code-block .token.number,
        .dark .message-content .code-block .token.constant,
        .dark .message-content .code-block .token.symbol {
          color: #79c0ff;
        }

        .dark .message-content .code-block .token.selector,
        .dark .message-content .code-block .token.attr-name,
        .dark .message-content .code-block .token.string,
        .dark .message-content .code-block .token.char,
        .dark .message-content .code-block .token.builtin {
          color: #a5d6ff;
        }

        .dark .message-content .code-block .token.operator,
        .dark .message-content .code-block .token.entity,
        .dark .message-content .code-block .token.url {
          color: #ff7b72;
        }

        .dark .message-content .code-block .token.atrule,
        .dark .message-content .code-block .token.attr-value,
        .dark .message-content .code-block .token.keyword {
          color: #ff7b72;
        }

        .dark .message-content .code-block .token.function,
        .dark .message-content .code-block .token.class-name {
          color: #d2a8ff;
        }

        /* Inline code */
        .message-content .inline-code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
          color: #e11d48;
          font-weight: 500;
        }

        .dark .message-content .inline-code {
          background: #374151;
          color: #fbbf24;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .message-content .code-block {
            font-size: 13px;
            padding: 12px;
          }
          
          .message-content .code-block-header {
            padding: 6px 10px;
          }
          
          .message-content .header-1 { font-size: 1.25em; }
          .message-content .header-2 { font-size: 1.15em; }
          .message-content .header-3 { font-size: 1.1em; }
        }

        /* Scrollbar for code blocks */
        .message-content .code-block::-webkit-scrollbar {
          height: 6px;
        }

        .message-content .code-block::-webkit-scrollbar-track {
          background: #f1f3f4;
          border-radius: 3px;
        }

        .message-content .code-block::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 3px;
        }

        .dark .message-content .code-block::-webkit-scrollbar-track {
          background: #2d3748;
        }

        .dark .message-content .code-block::-webkit-scrollbar-thumb {
          background: #4a5568;
        }
      `}</style>
    </div>
  );
};
