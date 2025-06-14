import { Message } from '@/types/chat';
import { User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { MessageStatus } from '@/components/MessageStatus';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [katexReady, setKatexReady] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'sending' | 'sent' | 'error'>('sent');
  const [showFullImage, setShowFullImage] = useState(false);
  
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
  
  // Simulate message status for user messages
  useEffect(() => {
    if (isUser) {
      setMessageStatus('sending');
      const timer = setTimeout(() => {
        setMessageStatus('sent');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUser]);
  
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

        if (!document.querySelector('link[href*="katex"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          document.head.appendChild(link);
          console.log('📄 KaTeX CSS loaded');
        }

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

  // Simplified content processing that works on both desktop and mobile
  const processContent = (content: string) => {
    const isMobile = window.innerWidth <= 768;
    console.log('🔄 Processing content:', {
      originalLength: content.length,
      contentPreview: content.substring(0, 100),
      isMobile,
      hasCodeBlocks: content.includes('```')
    });
    
    let processed = content;

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
      
      return `<div class="my-4 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">${language}</div>
        <div class="overflow-x-auto">
          <pre class="p-4 text-sm leading-relaxed text-gray-800 font-mono whitespace-pre overflow-x-auto"><code>${escapedCode}</code></pre>
        </div>
      </div>`;
    });

    processed = processed.replace(/(?<!`)`([^`\n]+)`(?!`)/g, 
      '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">$1</code>');

    processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, text) => {
      const level = hashes.length;
      const className = level === 1 ? 'text-xl font-bold' : level === 2 ? 'text-lg font-semibold' : 'text-base font-medium';
      return `<h${level} class="${className} mt-6 mb-3 text-gray-900">${text.trim()}</h${level}>`;
    });

    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    processed = processed.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>');
    processed = processed.replace(/(<li.*?>.*<\/li>)/gs, '<ul class="list-disc pl-5 my-3">$1</ul>');

    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
      '<a href="$2" class="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>');

    processed = processed.replace(/\n/g, '<br>');

    console.log('✅ Content processing complete:', {
      processedLength: processed.length,
      hasCodeElements: processed.includes('<pre'),
      isMobile
    });

    return processed;
  };
  
  const handleImageClick = () => {
    setShowFullImage(true);
  };

  const handleCloseFullImage = () => {
    setShowFullImage(false);
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3 w-full animate-fade-in`}>
      {!isUser && (
        <img 
          src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
          alt="Sorachio" 
          className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-blue-100"
        />
      )}
      
      <div className={`
        px-4 py-3 rounded-lg relative transition-all duration-200 hover:shadow-md
        ${isUser 
          ? 'bg-blue-500 text-white rounded-br-sm max-w-[85%] sm:max-w-[75%] lg:max-w-[60%]' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm max-w-[90%] sm:max-w-[85%] lg:max-w-[75%] border border-gray-200 dark:border-gray-700'
        }
      `}>
        {message.image && (
          <div className="mb-2">
            <AspectRatio ratio={16 / 9} className="w-full max-w-sm">
              <img 
                src={message.image} 
                alt="Uploaded image" 
                className="w-full h-full object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
              />
            </AspectRatio>
          </div>
        )}
        
        {isUser ? (
          <div>
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <MessageStatus status={messageStatus} />
          </div>
        ) : (
          <div
            ref={contentRef}
            className="text-sm break-words prose prose-sm max-w-none [&>div]:overflow-x-auto [&>div>div>pre]:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: processContent(message.content) }}
          />
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Full Image Modal */}
      {showFullImage && message.image && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={handleCloseFullImage}>
          <div className="relative max-w-full max-h-full">
            <img 
              src={message.image} 
              alt="Full size image" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={handleCloseFullImage}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
