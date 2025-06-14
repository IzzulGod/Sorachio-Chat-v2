
import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/MessageBubble';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TypingIndicator } from '@/components/TypingIndicator';
import { Message } from '@/types/chat';
import { RefObject } from 'react';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
  messagesContainerRef?: RefObject<HTMLDivElement>;
}

export const ChatContainer = ({ 
  messages, 
  isLoading, 
  onToggleSidebar, 
  sidebarOpen = false,
  messagesContainerRef 
}: ChatContainerProps) => {
  console.log('ChatContainer render - sidebarOpen:', sidebarOpen);
  
  const handleToggleClick = () => {
    console.log('Toggle button clicked! Current sidebarOpen:', sidebarOpen);
    onToggleSidebar();
  };
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleClick}
          className={`p-2 hover:bg-accent rounded-md z-50 relative hover:scale-105 transition-all duration-200 ${
            sidebarOpen ? 'hidden md:block' : 'block'
          }`}
          style={{ zIndex: 9999 }}
        >
          {sidebarOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-lg font-semibold text-foreground">Sorachio AI</h1>
        </div>
        <ThemeToggle />
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6 chat-messages"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          <TypingIndicator isVisible={isLoading} />
        </div>
      </div>
    </div>
  );
};
