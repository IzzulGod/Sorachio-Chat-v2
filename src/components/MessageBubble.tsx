
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

  // Process message content to handle code blocks and inline code
  const processContent = (content: string) => {
    // Handle code blocks first (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let processedContent = content.replace(codeBlockRegex, (match, language, code) => {
      const lang = language || 'text';
      return `<pre class="code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Handle inline code (`code`)
    const inlineCodeRegex = /`([^`]+)`/g;
    processedContent = processedContent.replace(inlineCodeRegex, (match, code) => {
      return `<code class="inline-code">${escapeHtml(code)}</code>`;
    });

    // Convert newlines to <br> for remaining text
    processedContent = processedContent.replace(/\n/g, '<br>');

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
          line-height: 1.5;
        }

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

        /* Dark theme support for math in user messages */
        .bg-gray-900 .katex {
          color: white;
        }

        /* Responsive code blocks */
        @media (max-width: 640px) {
          .message-content .code-block {
            font-size: 12px;
            padding: 8px;
          }
        }

        /* Prism theme overrides for better readability */
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
