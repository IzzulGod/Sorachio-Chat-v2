import { Button } from '@/components/ui/button';
import { Chat } from '@/types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  selectedChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export const Sidebar = ({ 
  isOpen, 
  onClose, 
  chats, 
  selectedChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat 
}: SidebarProps) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
      )}
      
      {/* Sidebar - Always render, but control visibility with transform */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out md:relative md:z-auto md:w-80 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
              <Button variant="ghost" size="sm" onClick={onClose} className="md:hidden">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </Button>
            </div>
            <Button
              onClick={onNewChat}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChatId === chat.id 
                    ? 'bg-gray-100' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {chat.title || 'New Chat'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 hover:text-red-600"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="m19,6v14a2,2 0,0 1,-2,2H7a2,2 0,0 1,-2,-2V6m3,0V4a2,2 0,0 1,2,-2h4a2,2 0,0 1,2,2V6"/>
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
            
            {chats.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No chats yet</p>
                <p className="text-xs mt-1">Start a new conversation!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
