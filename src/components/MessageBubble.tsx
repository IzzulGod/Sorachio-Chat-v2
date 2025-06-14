
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
        if (window.katex && window.renderMathInElement) {
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
        if (!window.katex) {
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
        if (window.renderMathInElement && contentRef.current) {
          window.renderMathInElement(contentRef.current, {
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

    // Multiple render attempts for reliability
    setTimeout(renderMath, 50);
    setTimeout(renderMath, 200);
    setTimeout(renderMath, 500);
  }, [katexReady, message.content, isUser]);

  const processContent = (content: string) => {
    // Simple markdown processing without math interference
    let processed = content;

    // Code blocks
    processed = processed.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="code-block"><code>${escapeHtml(code.trim())}</code></pre>`;
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3`}>
      {!isUser && (
        <img 
          src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
          alt="Sorachio" 
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        isUser 
          ? 'bg-gray-900 text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        {message.image && (
          <img 
            src={message.image} 
            alt="Uploaded image" 
            className="max-w-full rounded-lg mb-2"
          />
        )}
        
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            ref={contentRef}
            className="text-sm message-content"
            dangerouslySetInnerHTML={{ __html: processContent(message.content) }}
          />
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
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
        .message-content .header-1 { font-size: 1.5em; font-weight: bold; margin: 12px 0 8px 0; }
        .message-content .header-2 { font-size: 1.3em; font-weight: bold; margin: 12px 0 8px 0; }
        .message-content .header-3 { font-size: 1.2em; font-weight: bold; margin: 12px 0 8px 0; }

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
          color: #0066cc;
          text-decoration: underline;
        }
        .message-content .link:hover {
          color: #0052a3;
        }

        /* Code */
        .message-content .code-block {
          background: #f8f8f8;
          border: 1px solid #e1e1e1;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: monospace;
        }

        .message-content .inline-code {
          background: #f1f1f1;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          color: #e91e63;
        }

        /* Dark theme */
        .bg-gray-900 .link {
          color: #66b3ff;
        }
      `}</style>
    </div>
  );
};
