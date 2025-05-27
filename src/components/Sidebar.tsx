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
  console.log('Sidebar render - isOpen:', isOpen);

  if (!isOpen) {
    console.log('Sidebar hidden because isOpen is false');
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose} />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 md:w-80 bg-white border-r border-gray-200 z-50 md:relative">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="md:hidden"
              >
                ✕
              </Button>
            </div>
            <Button
              onClick={onNewChat}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
            >
              + New Chat
            </Button>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chats.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No chats yet</p>
                <p className="text-xs mt-1">Start a new conversation!</p>
              </div>
            ) : (
              chats.map((chat) => (
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
                      🗑️
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
