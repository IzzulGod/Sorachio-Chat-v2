
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
  
  // Enhanced logging for mobile debugging
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    console.log('🔍 MessageBubble Debug:', {
      role: message.role,
      contentLength: message.content?.length || 0,
      contentPreview: message.content?.substring(0, 100),
      hasImage: !!message.image,
      isMobile,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });
    
    if (!isUser && message.content) {
      console.log('📝 Full AI message content:', message.content);
    }
  }, [message, isUser]);
  
  // Load KaTeX for math rendering
  useEffect(() => {
    if (isUser || katexReady) return;
    
    const loadKaTeX = async () => {
      try {
        if ((window as any).katex && (window as any).renderMathInElement) {
          console.log('✅ KaTeX already loaded');
          setKatexReady(true);
          return;
        }

        console.log('⏳ Loading KaTeX...');

        // Load CSS first
        if (!document.querySelector('link[href*="katex"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          document.head.appendChild(link);
          console.log('📄 KaTeX CSS loaded');
        }

        // Load KaTeX JS
        if (!(window as any).katex) {
          await new Promise((resolve) => {
            const script1 = document.createElement('script');
            script1.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script1.onload = () => {
              console.log('📜 KaTeX JS loaded');
              const script2 = document.createElement('script');
              script2.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';
              script2.onload = () => {
                console.log('🔧 KaTeX auto-render loaded');
                resolve(true);
              };
              document.head.appendChild(script2);
            };
            document.head.appendChild(script1);
          });
        }
        
        setKatexReady(true);
        console.log('✅ KaTeX fully ready');
      } catch (error) {
        console.warn('❌ KaTeX loading failed:', error);
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
          console.log('🔢 Rendering math...');
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
          console.log('✅ Math rendering complete');
        }
      } catch (error) {
        console.warn('❌ Math rendering failed:', error);
      }
    };

    setTimeout(renderMath, 100);
  }, [katexReady, message.content, isUser]);

  // Balanced content processing for both desktop and mobile
  const processContent = (content: string) => {
    const isMobile = window.innerWidth <= 768;
    console.log('🔄 Processing content:', {
      originalLength: content.length,
      contentPreview: content.substring(0, 100),
      isMobile,
      hasCodeBlocks: content.includes('```')
    });
    
    let processed = content;

    // Process code blocks with responsive styles
    processed = processed.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'plaintext';
      const cleanCode = code.trim();
      console.log('📦 Processing code block:', { 
        language, 
        codeLength: cleanCode.length, 
        isMobile
      });
      
      const escapedCode = cleanCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      // Responsive design with CSS classes + inline styles for reliability
      const result = `
        <div class="code-block-container" style="
          margin: 12px 0; 
          border-radius: 6px; 
          overflow: hidden; 
          background: #f8f9fa; 
          border: 1px solid #e9ecef; 
          font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
          width: 100%;
          box-sizing: border-box;
        ">
          <div class="code-header" style="
            padding: 8px 12px; 
            background: #e9ecef; 
            border-bottom: 1px solid #dee2e6; 
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            color: #6c757d;
            letter-spacing: 0.5px;
          ">${language}</div>
          <div class="code-content" style="
            background: #fff;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            width: 100%;
            box-sizing: border-box;
          ">
            <pre style="
              padding: ${isMobile ? '10px' : '12px'}; 
              margin: 0; 
              background: #fff; 
              color: #24292e; 
              font-size: ${isMobile ? '13px' : '14px'}; 
              line-height: 1.5;
              white-space: pre;
              overflow-x: auto;
              -webkit-overflow-scrolling: touch;
              font-family: inherit;
            "><code style="
              background: none; 
              padding: 0; 
              border-radius: 0; 
              font-family: inherit; 
              font-size: inherit; 
              color: inherit;
              white-space: pre;
            ">${escapedCode}</code></pre>
          </div>
        </div>
      `;
      
      console.log('✅ Code block processed');
      return result;
    });

    // Process inline code
    processed = processed.replace(/(?<!`)`([^`\n]+)`(?!`)/g, 
      '<code style="background: #f1f3f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 0.9em; color: #d73a49;">$1</code>');

    // Headers
    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      const fontSize = level === 1 ? '1.5em' : level === 2 ? '1.3em' : '1.1em';
      return `<h${level} style="font-size: ${fontSize}; font-weight: bold; margin: 16px 0 8px 0; color: #1a202c;">${text.trim()}</h${level}>`;
    });

    // Bold and italic
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');

    // Lists
    processed = processed.replace(/^[-*]\s+(.+)$/gm, '<li style="margin: 4px 0; padding-left: 4px;">$1</li>');
    processed = processed.replace(/(<li.*?>.*<\/li>)/gs, '<ul style="padding-left: 20px; margin: 8px 0; list-style-type: disc;">$1</ul>');

    // Links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" style="color: #2563eb; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks
    processed = processed.replace(/\n/g, '<br>');

    console.log('✅ Content processing complete:', {
      processedLength: processed.length,
      hasCodeElements: processed.includes('<pre'),
      isMobile
    });

    return processed;
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
        px-4 py-3 rounded-lg relative overflow-hidden
        ${isUser 
          ? 'bg-gray-500 text-white rounded-br-sm max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]' 
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
            className="text-sm break-words prose prose-sm max-w-none"
            style={{ 
              wordWrap: 'break-word', 
              overflowWrap: 'break-word',
              width: '100%',
              maxWidth: '100%'
            }}
            dangerouslySetInnerHTML={{ __html: processContent(message.content) }}
          />
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
