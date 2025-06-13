
import { Message } from '@/types/chat';
import { User } from 'lucide-react';
import { useEffect, useRef } from 'react';

// Import KaTeX for math rendering
declare global {
  interface Window {
    katex: any;
    renderMathInElement: any;
    Prism: any;
  }
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (contentRef.current && !isUser) {
      // Render math expressions with KaTeX
      if (window.renderMathInElement) {
        try {
          window.renderMathInElement(contentRef.current, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
              { left: '\\[', right: '\\]', display: true },
              { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false,
            errorColor: '#cc0000',
            macros: {
              '\\RR': '\\mathbb{R}',
              '\\NN': '\\mathbb{N}',
              '\\ZZ': '\\mathbb{Z}',
              '\\QQ': '\\mathbb{Q}',
              '\\CC': '\\mathbb{C}'
            }
          });
        } catch (error) {
          console.warn('KaTeX rendering failed:', error);
        }
      }

      // Highlight code blocks with Prism
      if (window.Prism) {
        try {
          window.Prism.highlightAllUnder(contentRef.current);
        } catch (error) {
          console.warn('Prism highlighting failed:', error);
        }
      }
    }
  }, [message.content, isUser]);

  // Enhanced content processing for better markdown support and clickable links
  const processContent = (content: string) => {
    let processedContent = content;

    // Handle code blocks first (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    processedContent = processedContent.replace(codeBlockRegex, (match, language, code) => {
      const lang = language || 'text';
      return `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Handle inline code (`code`)
    const inlineCodeRegex = /`([^`\n]+)`/g;
    processedContent = processedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // Handle headers (# ## ###)
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    processedContent = processedContent.replace(headerRegex, (match, hashes, text) => {
      const level = hashes.length;
      return `<h${level} class="markdown-header markdown-h${level}">${text.trim()}</h${level}>`;
    });

    // Handle bold text (**text** or __text__)
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    processedContent = processedContent.replace(boldRegex, '<strong class="markdown-bold">$2</strong>');

    // Handle italic text (*text* or _text_)
    const italicRegex = /(\*|_)(.*?)\1/g;
    processedContent = processedContent.replace(italicRegex, '<em class="markdown-italic">$2</em>');

    // Handle strikethrough (~~text~~)
    const strikethroughRegex = /~~(.*?)~~/g;
    processedContent = processedContent.replace(strikethroughRegex, '<del class="markdown-strikethrough">$1</del>');

    // Handle blockquotes (> text)
    const blockquoteRegex = /^>\s+(.+)$/gm;
    processedContent = processedContent.replace(blockquoteRegex, '<blockquote class="markdown-blockquote">$1</blockquote>');

    // Handle unordered lists (- item or * item)
    const unorderedListRegex = /^[\-\*]\s+(.+)$/gm;
    let listItems: string[] = [];
    processedContent = processedContent.replace(unorderedListRegex, (match, item) => {
      listItems.push(`<li class="markdown-list-item">${item.trim()}</li>`);
      return '___LIST_ITEM___';
    });

    // Group consecutive list items
    if (listItems.length > 0) {
      const listContent = `<ul class="markdown-list">${listItems.join('')}</ul>`;
      processedContent = processedContent.replace(/___LIST_ITEM___(\n___LIST_ITEM___)*/g, listContent);
    }

    // Handle ordered lists (1. item)
    const orderedListRegex = /^\d+\.\s+(.+)$/gm;
    let orderedListItems: string[] = [];
    processedContent = processedContent.replace(orderedListRegex, (match, item) => {
      orderedListItems.push(`<li class="markdown-list-item">${item.trim()}</li>`);
      return '___ORDERED_LIST_ITEM___';
    });

    // Group consecutive ordered list items
    if (orderedListItems.length > 0) {
      const orderedListContent = `<ol class="markdown-ordered-list">${orderedListItems.join('')}</ol>`;
      processedContent = processedContent.replace(/___ORDERED_LIST_ITEM___(\n___ORDERED_LIST_ITEM___)*/g, orderedListContent);
    }

    // Handle horizontal rules (--- or ***)
    const hrRegex = /^(---|\*\*\*)$/gm;
    processedContent = processedContent.replace(hrRegex, '<hr class="markdown-hr">');

    // Handle markdown links [text](url) first
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    processedContent = processedContent.replace(markdownLinkRegex, '<a href="$2" class="markdown-link clickable-link" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle standalone URLs (http, https, www)
    const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/g;
    processedContent = processedContent.replace(urlRegex, (url) => {
      const fullUrl = url.startsWith('www.') ? `https://${url}` : url;
      const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
      return `<a href="${fullUrl}" class="markdown-link clickable-link auto-link" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
    });

    // Convert remaining newlines to <br> but preserve block elements
    processedContent = processedContent.replace(/\n(?![<])/g, '<br>');

    return processedContent;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  return (
    <>
      {/* Load required CSS and JS if not already loaded */}
      {!isUser && (
        <>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.css"
            crossOrigin="anonymous"
          />
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css"
          />
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.min.js"
            crossOrigin="anonymous"
          />
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/contrib/auto-render.min.js"
            crossOrigin="anonymous"
          />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js" />
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js" />
        </>
      )}

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
      </div>

      <style>{`
        .message-content {
          line-height: 1.6;
          word-wrap: break-word;
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

        /* Links - Enhanced styling with hover effects */
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

        /* Math expressions styling */
        .message-content .katex {
          font-size: 1.1em;
        }

        .message-content .katex-display {
          margin: 12px 0;
          text-align: center;
        }

        /* Dark theme support for user messages */
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
        }

        /* Enhanced Prism theme */
        .message-content .token.comment,
        .message-content .token.prolog,
        .message-content .token.doctype,
        .message-content .token.cdata {
          color: #708090;
        }

        .message-content .token.punctuation {
          color: #999;
        }

        .message-content .token.property,
        .message-content .token.tag,
        .message-content .token.boolean,
        .message-content .token.number,
        .message-content .token.constant,
        .message-content .token.symbol,
        .message-content .token.deleted {
          color: #905;
        }

        .message-content .token.selector,
        .message-content .token.attr-name,
        .message-content .token.string,
        .message-content .token.char,
        .message-content .token.builtin,
        .message-content .token.inserted {
          color: #690;
        }

        .message-content .token.operator,
        .message-content .token.entity,
        .message-content .token.url,
        .message-content .language-css .token.string,
        .message-content .style .token.string {
          color: #9a6e3a;
        }

        .message-content .token.atrule,
        .message-content .token.attr-value,
        .message-content .token.keyword {
          color: #07a;
        }

        .message-content .token.function,
        .message-content .token.class-name {
          color: #dd4a68;
        }
      `}</style>
    </>
  );
};
