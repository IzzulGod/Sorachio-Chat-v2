
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
      const escapedCode = escapeHtml(code.trim());
      const codeForCopy = code.trim().replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
      
      return `<div class="code-block-container mb-4">
        <div class="code-block-header">
          <span class="code-language">${language}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText('${codeForCopy}').then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 2000); }).catch(() => { this.textContent = 'Failed'; setTimeout(() => this.textContent = 'Copy', 2000); })">Copy</button>
        </div>
        <pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>
      </div>`;
    });

    // Inline code
    processed = processed.replace(/(?<!`)`([^`\n]+)`(?!`)/g, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // Headers
    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="header-${level} mb-2 mt-4">${text.trim()}</h${level}>`;
    });

    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    processed = processed.replace(/^[\-\*]\s+(.+)$/gm, '<li class="list-item">$1</li>');
    processed = processed.replace(/(<li class="list-item">.*?<\/li>)/gs, '<ul class="list mb-2">$1</ul>');

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

  // CSS styles as string
  const styles = `
    .message-content {
      line-height: 1.6;
      word-wrap: break-word;
    }

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

    .message-content .header-1 { 
      font-size: 1.4em; 
      font-weight: bold; 
      color: #1a1a1a; 
    }
    .message-content .header-2 { 
      font-size: 1.25em; 
      font-weight: bold; 
      color: #1a1a1a; 
    }
    .message-content .header-3 { 
      font-size: 1.15em; 
      font-weight: bold; 
      color: #1a1a1a; 
    }

    .dark .message-content .header-1,
    .dark .message-content .header-2,
    .dark .message-content .header-3 { 
      color: #e5e5e5; 
    }

    .message-content strong { font-weight: bold; }
    .message-content em { font-style: italic; }

    .message-content .list {
      padding-left: 20px;
      list-style-type: disc;
    }
    .message-content .list-item {
      margin: 4px 0;
    }

    .message-content .link {
      color: #2563eb;
      text-decoration: underline;
      transition: color 0.2s;
    }
    .message-content .link:hover {
      color: #1d4ed8;
    }

    .dark .message-content .link {
      color: #60a5fa;
    }
    .dark .message-content .link:hover {
      color: #93c5fd;
    }

    .message-content .code-block-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background: #f8f9fa;
    }

    .dark .message-content .code-block-container {
      background: #1e293b;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .message-content .code-block-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #e5e7eb;
      padding: 8px 12px;
      border-bottom: 1px solid #d1d5db;
      font-size: 12px;
    }

    .dark .message-content .code-block-header {
      background: #334155;
      border-bottom-color: #475569;
      color: #e2e8f0;
    }

    .message-content .code-language {
      font-weight: 600;
      text-transform: uppercase;
      color: #6b7280;
      font-size: 11px;
    }

    .dark .message-content .code-language {
      color: #94a3b8;
    }

    .message-content .copy-btn {
      background: #ffffff;
      border: 1px solid #d1d5db;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      transition: all 0.2s;
      color: #374151;
    }

    .message-content .copy-btn:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .dark .message-content .copy-btn {
      background: #475569;
      color: #e2e8f0;
      border-color: #64748b;
    }

    .dark .message-content .copy-btn:hover {
      background: #64748b;
      border-color: #94a3b8;
    }

    .message-content .code-block {
      background: #ffffff;
      padding: 16px;
      margin: 0;
      overflow-x: auto;
      font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      border: none;
      color: #24292e;
    }

    .dark .message-content .code-block {
      background: #0f172a;
      color: #e2e8f0;
    }

    .message-content .inline-code {
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
      color: #e11d48;
      font-weight: 500;
    }

    .dark .message-content .inline-code {
      background: #374151;
      color: #fbbf24;
    }

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
  `;

  // Inject styles once
  useEffect(() => {
    const styleId = 'message-bubble-styles';
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
  }, []);
  
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
    </div>
  );
};
