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

    // Code blocks - improved regex
    processed = processed.replace(/```([a-zA-Z]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      const cleanCode = code.trim();
      const escapedCode = cleanCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      
      const copyCode = cleanCode.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
      
      return `<div class="code-container">
        <div class="code-header">
          <span class="code-lang">${language}</span>
          <button class="copy-button" onclick="copyToClipboard('${copyCode}', this)">Copy</button>
        </div>
        <pre class="code-pre"><code class="code-content">${escapedCode}</code></pre>
      </div>`;
    });

    // Inline code - improved regex
    processed = processed.replace(/(?<!`)`([^`\n]+)`(?!`)/g, (match, code) => {
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<code class="inline-code">${escapedCode}</code>`;
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

  // Inject copy function and styles
  useEffect(() => {
    // Add copy function to window
    if (!(window as any).copyToClipboard) {
      (window as any).copyToClipboard = (text: string, button: HTMLElement) => {
        navigator.clipboard.writeText(text).then(() => {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.style.backgroundColor = '#10b981';
          setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
          }, 2000);
        }).catch(() => {
          button.textContent = 'Failed';
          setTimeout(() => {
            button.textContent = 'Copy';
          }, 2000);
        });
      };
    }

    // Inject styles
    const styleId = 'message-bubble-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .message-content {
          line-height: 1.6;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .message-content .code-container {
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .dark .message-content .code-container {
          background: #1a1b23;
          border-color: #333742;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .message-content .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #e9ecef;
          border-bottom: 1px solid #dee2e6;
          font-size: 12px;
        }

        .dark .message-content .code-header {
          background: #2d3748;
          border-bottom-color: #4a5568;
          color: #e2e8f0;
        }

        .message-content .code-lang {
          font-weight: 600;
          text-transform: uppercase;
          color: #6c757d;
          font-size: 11px;
        }

        .dark .message-content .code-lang {
          color: #a0aec0;
        }

        .message-content .copy-button {
          background: #ffffff;
          border: 1px solid #ced4da;
          padding: 4px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 500;
          color: #495057;
          transition: all 0.2s ease;
        }

        .message-content .copy-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        .dark .message-content .copy-button {
          background: #4a5568;
          color: #e2e8f0;
          border-color: #718096;
        }

        .dark .message-content .copy-button:hover {
          background: #718096;
          border-color: #a0aec0;
        }

        .message-content .code-pre {
          margin: 0;
          padding: 16px;
          overflow-x: auto;
          background: #ffffff;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
          font-size: 14px;
          line-height: 1.4;
          color: #24292e;
          white-space: pre;
        }

        .dark .message-content .code-pre {
          background: #0d1117;
          color: #f0f6fc;
        }

        .message-content .code-content {
          display: block;
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font-family: inherit;
          font-size: inherit;
          color: inherit;
          white-space: pre;
          overflow-x: auto;
        }

        .message-content .inline-code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-size: 0.9em;
          color: #d73a49;
          font-weight: 500;
          border: 1px solid #e1e4e8;
        }

        .dark .message-content .inline-code {
          background: #282c34;
          color: #98c379;
          border-color: #444c56;
        }

        /* Mobile responsive styles */
        @media (max-width: 640px) {
          .message-content .code-container {
            margin: 12px 0;
            border-radius: 6px;
          }
          
          .message-content .code-header {
            padding: 6px 12px;
            font-size: 11px;
          }
          
          .message-content .code-pre {
            padding: 12px;
            font-size: 13px;
            line-height: 1.3;
          }
          
          .message-content .copy-button {
            padding: 3px 8px;
            font-size: 10px;
          }
        }

        /* Headers styling */
        .message-content .header-1 { 
          font-size: 1.4em; 
          font-weight: bold; 
          color: #1a1a1a;
          margin: 16px 0 8px 0;
        }
        .message-content .header-2 { 
          font-size: 1.25em; 
          font-weight: bold; 
          color: #1a1a1a;
          margin: 14px 0 6px 0;
        }
        .message-content .header-3 { 
          font-size: 1.15em; 
          font-weight: bold; 
          color: #1a1a1a;
          margin: 12px 0 4px 0;
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
          margin: 8px 0;
        }
        .message-content .list-item {
          margin: 4px 0;
        }

        .message-content .link {
          color: #0366d6;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .message-content .link:hover {
          color: #0256cc;
        }

        .dark .message-content .link {
          color: #58a6ff;
        }
        .dark .message-content .link:hover {
          color: #79c0ff;
        }

        /* KaTeX styles */
        .message-content .katex {
          font-size: 1.1em;
        }

        .message-content .katex-display {
          margin: 16px 0;
          text-align: center;
          overflow-x: auto;
        }

        .message-content .katex-error {
          color: #d73a49;
          background: #ffeef0;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .dark .message-content .katex-error {
          color: #ff7b72;
          background: #490202;
        }
      `;
      document.head.appendChild(style);
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
        px-4 py-3 rounded-lg relative overflow-hidden
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-sm max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm max-w-[90%] sm:max-w-[80%] lg:max-w-[70%] xl:max-w-[65%]'
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
