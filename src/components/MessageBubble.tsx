
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
  
  // Load KaTeX for math rendering
  useEffect(() => {
    if (isUser || katexReady) return;
    
    const loadKaTeX = async () => {
      try {
        if ((window as any).katex && (window as any).renderMathInElement) {
          setKatexReady(true);
          return;
        }

        // Load CSS first
        if (!document.querySelector('link[href*="katex"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          document.head.appendChild(link);
        }

        // Load KaTeX JS
        if (!(window as any).katex) {
          await new Promise((resolve) => {
            const script1 = document.createElement('script');
            script1.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script1.onload = () => {
              const script2 = document.createElement('script');
              script2.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
              script2.onload = () => resolve(true);
              document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
          });
        }
        
        setKatexReady(true);
      } catch (error) {
        console.warn('KaTeX loading failed:', error);
      }
    };

    loadKaTeX();
  }, [isUser, katexReady]);

  // Render math when content changes
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

    setTimeout(renderMath, 100);
  }, [katexReady, message.content, isUser]);

  // Copy function
  const copyToClipboard = (text: string, button: HTMLElement) => {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.style.backgroundColor = '#10b981';
      button.style.color = 'white';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
      }, 2000);
    }).catch(() => {
      button.textContent = 'Failed';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    });
  };

  // Improved content processing
  const processContent = (content: string) => {
    let processed = content;

    // Process code blocks first with better regex
    processed = processed.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      const cleanCode = code.trim();
      const escapedCode = cleanCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      const copyData = cleanCode.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const buttonId = `copy-btn-${Math.random().toString(36).substr(2, 9)}`;
      
      return `
        <div class="code-block-wrapper">
          <div class="code-header">
            <span class="code-lang">${language}</span>
            <button id="${buttonId}" class="copy-btn" onclick="copyCode('${copyData}', '${buttonId}')">Copy</button>
          </div>
          <pre class="code-content"><code>${escapedCode}</code></pre>
        </div>
      `;
    });

    // Process inline code
    processed = processed.replace(/(?<!`)`([^`\n]+)`(?!`)/g, '<code class="inline-code">$1</code>');

    // Headers
    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="header-${level}">${text.trim()}</h${level}>`;
    });

    // Bold and italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    processed = processed.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
    processed = processed.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks
    processed = processed.replace(/\n/g, '<br>');

    return processed;
  };

  // Add global copy function and styles
  useEffect(() => {
    // Add copy function to window
    (window as any).copyCode = (text: string, buttonId: string) => {
      const decodedText = text.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      const button = document.getElementById(buttonId);
      if (button) {
        copyToClipboard(decodedText, button);
      }
    };

    // Add styles if not present
    const styleId = 'message-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .code-block-wrapper {
          margin: 16px 0;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        }
        
        .dark .code-block-wrapper {
          background: #1e1e1e;
          border-color: #404040;
        }
        
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: #e9ecef;
          border-bottom: 1px solid #dee2e6;
          font-size: 12px;
        }
        
        .dark .code-header {
          background: #2d2d2d;
          border-bottom-color: #404040;
        }
        
        .code-lang {
          font-weight: 600;
          text-transform: uppercase;
          color: #6c757d;
        }
        
        .dark .code-lang {
          color: #9ca3af;
        }
        
        .copy-btn {
          background: #fff;
          border: 1px solid #ced4da;
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.2s;
        }
        
        .copy-btn:hover {
          background: #f8f9fa;
        }
        
        .dark .copy-btn {
          background: #404040;
          border-color: #606060;
          color: #e5e5e5;
        }
        
        .dark .copy-btn:hover {
          background: #505050;
        }
        
        .code-content {
          padding: 16px;
          margin: 0;
          overflow-x: auto;
          background: #fff;
          color: #24292e;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .dark .code-content {
          background: #0d1117;
          color: #f0f6fc;
        }
        
        .code-content code {
          background: none;
          padding: 0;
          border-radius: 0;
          font-family: inherit;
          font-size: inherit;
          color: inherit;
        }
        
        .inline-code {
          background: #f1f3f4;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 0.9em;
          color: #d73a49;
          border: 1px solid #e1e4e8;
        }
        
        .dark .inline-code {
          background: #282c34;
          color: #98c379;
          border-color: #444c56;
        }
        
        .header-1 { font-size: 1.5em; font-weight: bold; margin: 16px 0 8px 0; }
        .header-2 { font-size: 1.3em; font-weight: bold; margin: 14px 0 6px 0; }
        .header-3 { font-size: 1.1em; font-weight: bold; margin: 12px 0 4px 0; }
        
        ul { padding-left: 20px; margin: 8px 0; }
        li { margin: 4px 0; }
        
        @media (max-width: 640px) {
          .code-block-wrapper {
            margin: 12px 0;
            border-radius: 6px;
          }
          
          .code-header {
            padding: 6px 12px;
          }
          
          .code-content {
            padding: 12px;
            font-size: 13px;
          }
          
          .copy-btn {
            padding: 3px 6px;
            font-size: 10px;
          }
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
            className="text-sm break-words"
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
