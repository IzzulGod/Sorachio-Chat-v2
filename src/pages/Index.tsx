import { useState, useRef, useEffect, useCallback } from 'react';
import { ChatContainer } from '@/components/ChatContainer';
import { Sidebar } from '@/components/Sidebar';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { ChatInput } from '@/components/ChatInput';
import { useChat } from '@/hooks/useChat';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { chats, currentChat, createNewChat, deleteChat, sendMessage, isLoading } = useChat(selectedChatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, scrollToBottom]);

  // Handle viewport height changes (mobile keyboard)
  useEffect(() => {
    const handleResize = () => {
      // Force a scroll to bottom when viewport changes (keyboard open/close)
      setTimeout(scrollToBottom, 100);
    };

    const handleOrientationChange = () => {
      // Handle orientation changes
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [scrollToBottom]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleSendMessage = async (content: string, image?: File) => {
    if (!selectedChatId) {
      const newChatId = createNewChat();
      setSelectedChatId(newChatId);
      await sendMessage(content, image, newChatId);
    } else {
      await sendMessage(content, image, selectedChatId);
    }
  };

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setSelectedChatId(newChatId);
    setSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden full-height">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      
      {/* Sidebar overlay for mobile - transparent for easy closing */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay md:hidden"
          onClick={handleCloseSidebar}
          aria-label="Close sidebar"
        />
      )}
      
      <div 
        ref={chatContainerRef}
        className="flex-1 flex flex-col relative chat-container w-full min-w-0"
      >
        <div className="flex-1 overflow-hidden min-h-0 messages-container">
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onToggleSidebar={handleToggleSidebar} />
          ) : (
            <ChatContainer
              messages={currentChat.messages}
              isLoading={isLoading}
              onToggleSidebar={handleToggleSidebar}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-area flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
