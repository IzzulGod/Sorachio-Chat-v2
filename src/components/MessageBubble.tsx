
import { Message } from '@/types/chat';
import { User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [mathLoaded, setMathLoaded] = useState(false);
  
  // Load KaTeX resources once
  useEffect(() => {
    const loadMathResources = async () => {
      if (mathLoaded) return;
      
      try {
        // Check if KaTeX is already loaded
        if (window.katex && window.renderMathInElement) {
          setMathLoaded(true);
          return;
        }

        // Load CSS first
        if (!document.querySelector('link[href*="katex.min.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          cssLink.crossOrigin = 'anonymous';
          document.head.appendChild(cssLink);
        }

        // Load KaTeX script
        if (!window.katex) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Load auto-render extension
        if (!window.renderMathInElement) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        setMathLoaded(true);
      } catch (error) {
        console.error('Failed to load KaTeX:', error);
      }
    };

    if (!isUser) {
      loadMathResources();
    }
  }, [isUser, mathLoaded]);

  // Render math after content changes
  useEffect(() => {
    if (!mathLoaded || !contentRef.current || isUser) return;

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
            errorColor: '#cc0000',
            strict: false,
            trust: (context) => ['\\htmlId', '\\href'].includes(context.command),
            macros: {
              '\\RR': '\\mathbb{R}',
              '\\NN': '\\mathbb{N}',
              '\\ZZ': '\\mathbb{Z}',
              '\\QQ': '\\mathbb{Q}',
              '\\CC': '\\mathbb{C}',
              '\\FF': '\\mathbb{F}'
            }
          });
        }
      } catch (error) {
        console.error('KaTeX rendering error:', error);
      }
    };

    // Use multiple attempts to ensure rendering
    const timeouts = [50, 200, 500];
    timeouts.forEach(delay => {
      setTimeout(renderMath, delay);
    });
  }, [mathLoaded, message.content, isUser]);

  const processContent = (content: string) => {
    // First, protect math expressions by replacing them with placeholders
    const mathExpressions: { placeholder: string; original: string; type: 'display' | 'inline' }[] = [];
    let processedContent = content;
    let mathIndex = 0;

    // Protect display math $$...$$
    processedContent = processedContent.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
      const placeholder = `__MATH_DISPLAY_${mathIndex}__`;
      mathExpressions.push({ placeholder, original: match, type: 'display' });
      mathIndex++;
      return placeholder;
    });

    // Protect LaTeX display math \[...\]
    processedContent = processedContent.replace(/\\\[([\s\S]*?)\\\]/g, (match) => {
      const placeholder = `__MATH_DISPLAY_${mathIndex}__`;
      mathExpressions.push({ placeholder, original: match, type: 'display' });
      mathIndex++;
      return placeholder;
    });

    // Protect inline math $...$
    processedContent = processedContent.replace(/\$([^$\n\r]+)\$/g, (match) => {
      const placeholder = `__MATH_INLINE_${mathIndex}__`;
      mathExpressions.push({ placeholder, original: match, type: 'inline' });
      mathIndex++;
      return placeholder;
    });

    // Protect LaTeX inline math \(...\)
    processedContent = processedContent.replace(/\\\(([\s\S]*?)\\\)/g, (match) => {
      const placeholder = `__MATH_INLINE_${mathIndex}__`;
      mathExpressions.push({ placeholder, original: match, type: 'inline' });
      mathIndex++;
      return placeholder;
    });

    // Process markdown for other elements
    processedContent = processMarkdown(processedContent);

    // Restore math expressions
    mathExpressions.forEach(({ placeholder, original, type }) => {
      const mathClass = type === 'display' ? 'math-display' : 'math-inline';
      processedContent = processedContent.replace(
        placeholder, 
        `<span class="${mathClass}">${escapeHtml(original)}</span>`
      );
    });

    return processedContent;
  };

  const processMarkdown = (content: string) => {
    let processedContent = content;

    // Handle code blocks first (```language\ncode\n```)
    processedContent = processedContent.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
      const lang = language || 'text';
      return `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Handle inline code (`code`)
    processedContent = processedContent.replace(/`([^`\n]+)`/g, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // Handle headers (# ## ###)
    processedContent = processedContent.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="markdown-header markdown-h${level}">${text.trim()}</h${level}>`;
    });

    // Handle bold text (**text** or __text__)
    processedContent = processedContent.replace(/(\*\*|__)(.*?)\1/g, '<strong class="markdown-bold">$2</strong>');

    // Handle italic text (*text* or _text_)
    processedContent = processedContent.replace(/(\*|_)(.*?)\1/g, '<em class="markdown-italic">$2</em>');

    // Handle strikethrough (~~text~~)
    processedContent = processedContent.replace(/~~(.*?)~~/g, '<del class="markdown-strikethrough">$1</del>');

    // Handle blockquotes (> text)
    processedContent = processedContent.replace(/^>\s+(.+)$/gm, '<blockquote class="markdown-blockquote">$1</blockquote>');

    // Handle unordered lists (- item or * item)
    const listRegex = /^[\-\*]\s+(.+)$/gm;
    const listItems: string[] = [];
    processedContent = processedContent.replace(listRegex, (match, item) => {
      listItems.push(`<li class="markdown-list-item">${item.trim()}</li>`);
      return '___LIST_ITEM___';
    });

    if (listItems.length > 0) {
      const listContent = `<ul class="markdown-list">${listItems.join('')}</ul>`;
      processedContent = processedContent.replace(/___LIST_ITEM___(\n___LIST_ITEM___)*/g, listContent);
    }

    // Handle ordered lists (1. item)
    const orderedListRegex = /^\d+\.\s+(.+)$/gm;
    const orderedListItems: string[] = [];
    processedContent = processedContent.replace(orderedListRegex, (match, item) => {
      orderedListItems.push(`<li class="markdown-list-item">${item.trim()}</li>`);
      return '___ORDERED_LIST_ITEM___';
    });

    if (orderedListItems.length > 0) {
      const orderedListContent = `<ol class="markdown-ordered-list">${orderedListItems.join('')}</ol>`;
      processedContent = processedContent.replace(/___ORDERED_LIST_ITEM___(\n___ORDERED_LIST_ITEM___)*/g, orderedListContent);
    }

    // Handle horizontal rules (--- or ***)
    processedContent = processedContent.replace(/^(---|\*\*\*)$/gm, '<hr class="markdown-hr">');

    // Handle markdown links [text](url)
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link clickable-link" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle standalone URLs (http, https, www)
    processedContent = processedContent.replace(/(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g, (url) => {
      const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
      const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
      return `<a href="${fullUrl}" class="markdown-link clickable-link auto-link" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
    });

    // Convert remaining newlines to <br>
    processedContent = processedContent.replace(/\n(?![<])/g, '<br>');

    return processedContent;
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
        .message-content .math-display {
          display: block;
          margin: 16px 0;
          text-align: center;
          overflow-x: auto;
        }

        .message-content .math-inline {
          display: inline;
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
          font-family: monospace;
        }

        /* Headers */
        .message-content .markdown-header {
          margin: 12px 0 8px 0;
          font-weight: bold;
          line-height: 1.3;
        }
        
        .message-content .markdown-h1 { font-size: 1.5em; }
        .message-content .markdown-h2 { font-size: 1.3em; }
        .message-content .markdown-h3 { font-size: 1.2em; }
        .message-content .markdown-h4 { font-size: 1.1em; }
        .message-content .markdown-h5 { font-size: 1em; }
        .message-content .markdown-h6 { font-size: 0.9em; }

        /* Text formatting */
        .message-content .markdown-bold {
          font-weight: bold;
        }

        .message-content .markdown-italic {
          font-style: italic;
        }

        .message-content .markdown-strikethrough {
          text-decoration: line-through;
        }

        /* Lists */
        .message-content .markdown-list,
        .message-content .markdown-ordered-list {
          margin: 8px 0;
          padding-left: 20px;
        }

        .message-content .markdown-list {
          list-style-type: disc;
        }

        .message-content .markdown-ordered-list {
          list-style-type: decimal;
        }

        .message-content .markdown-list-item {
          margin: 4px 0;
          line-height: 1.5;
        }

        /* Blockquotes */
        .message-content .markdown-blockquote {
          border-left: 4px solid #ccc;
          margin: 8px 0;
          padding: 8px 12px;
          background: #f9f9f9;
          font-style: italic;
        }

        /* Horizontal rules */
        .message-content .markdown-hr {
          border: none;
          border-top: 2px solid #ddd;
          margin: 16px 0;
        }

        /* Links */
        .message-content .markdown-link {
          color: #0066cc;
          text-decoration: underline;
          transition: all 0.2s ease;
          border-radius: 2px;
          padding: 1px 2px;
        }

        .message-content .markdown-link:hover {
          color: #0052a3;
          background-color: rgba(0, 102, 204, 0.1);
          text-decoration: none;
        }

        .message-content .clickable-link {
          cursor: pointer;
          display: inline-block;
        }

        .message-content .auto-link {
          font-family: monospace;
          font-size: 0.9em;
          background: rgba(0, 102, 204, 0.05);
          padding: 2px 4px;
          border-radius: 3px;
          border: 1px solid rgba(0, 102, 204, 0.2);
        }

        .message-content .auto-link:hover {
          background: rgba(0, 102, 204, 0.15);
          border-color: rgba(0, 102, 204, 0.4);
          transform: translateY(-1px);
        }

        /* Code blocks */
        .message-content .code-block {
          background: #f8f8f8;
          border: 1px solid #e1e1e1;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.4;
        }

        .message-content .inline-code {
          background: #f1f1f1;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
          font-size: 0.9em;
          color: #e91e63;
        }

        .message-content pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .message-content code {
          font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
        }

        /* Dark theme support */
        .bg-gray-900 .katex {
          color: white;
        }

        .bg-gray-900 .markdown-link {
          color: #66b3ff;
        }

        .bg-gray-900 .markdown-link:hover {
          color: #4da6ff;
          background-color: rgba(102, 179, 255, 0.2);
        }

        .bg-gray-900 .auto-link {
          background: rgba(102, 179, 255, 0.1);
          border-color: rgba(102, 179, 255, 0.3);
        }

        .bg-gray-900 .auto-link:hover {
          background: rgba(102, 179, 255, 0.2);
          border-color: rgba(102, 179, 255, 0.5);
        }

        .bg-gray-900 .markdown-blockquote {
          background: rgba(255, 255, 255, 0.1);
          border-left-color: rgba(255, 255, 255, 0.3);
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .message-content .code-block {
            font-size: 12px;
            padding: 8px;
          }
          
          .message-content .markdown-header {
            margin: 8px 0 6px 0;
          }

          .message-content .katex-display {
            font-size: 0.9em;
            margin: 12px 0;
          }
        }
      `}</style>
    </div>
  );
};
