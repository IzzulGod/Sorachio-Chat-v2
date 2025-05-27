import { Button } from '@/components/ui/button';
import { MessageBubble } from '@/components/MessageBubble';
import { Message } from '@/types/chat';

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

export const ChatContainer = ({ messages, isLoading, onToggleSidebar, sidebarOpen = false }: ChatContainerProps) => {
  console.log('ChatContainer render - sidebarOpen:', sidebarOpen);
  
  const handleToggleClick = () => {
    console.log('Toggle button clicked! Current sidebarOpen:', sidebarOpen);
    onToggleSidebar();
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleClick}
          className={`p-2 hover:bg-gray-100 rounded-md z-50 relative ${
            sidebarOpen ? 'hidden md:block' : 'block'
          }`}
          style={{ zIndex: 9999 }}
        >
          {sidebarOpen ? (
            // Back/Close icon when sidebar is open (desktop only)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ) : (
            // Hamburger menu icon when sidebar is closed
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Sorachio</h1>
        <div className="w-8"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <img 
              src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
              alt="Sorachio" 
              className="w-8 h-8 rounded-full"
            />
            <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
