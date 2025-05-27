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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      // Method 1: Scroll the messages container
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      
      // Method 2: Also use scrollIntoView as backup
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }, 50);
    }
  }, []);

  // Force scroll when messages change
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      // Immediate scroll
      scrollToBottom();
      
      // Also scroll after a brief delay to handle any rendering delays
      const timeoutId = setTimeout(scrollToBottom, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentChat?.messages, scrollToBottom]);

  // Force scroll when loading state changes
  useEffect(() => {
    if (!isLoading) {
      // When loading finishes, scroll to bottom
      setTimeout(scrollToBottom, 200);
    }
  }, [isLoading, scrollToBottom]);

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
      // Force scroll after sending message
      setTimeout(() => {
        sendMessage(content, image, newChatId).then(() => {
          // Double ensure scroll after message is sent
          setTimeout(scrollToBottom, 300);
        });
      }, 100);
    } else {
      // Force scroll after sending message
      sendMessage(content, image, selectedChatId).then(() => {
        // Double ensure scroll after message is sent
        setTimeout(scrollToBottom, 300);
      });
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
    // Scroll to bottom when switching chats
    setTimeout(scrollToBottom, 100);
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handleToggleSidebar = useCallback(() => {
    console.log('Toggling sidebar. Current state:', sidebarOpen, 'New state:', !sidebarOpen);
    setSidebarOpen(prev => !prev);
  }, [sidebarOpen]);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  console.log('Index render - sidebarOpen:', sidebarOpen);

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
      
      <div 
        ref={chatContainerRef}
        className="flex-1 flex flex-col relative chat-container w-full min-w-0"
      >
        {/* Sidebar overlay for mobile - positioned to only cover main content */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay md:hidden"
            onClick={handleCloseSidebar}
            aria-label="Close sidebar"
          />
        )}
        
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-hidden min-h-0 messages-container"
        >
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onToggleSidebar={handleToggleSidebar} sidebarOpen={sidebarOpen} />
          ) : (
            <ChatContainer
              messages={currentChat.messages}
              isLoading={isLoading}
              onToggleSidebar={handleToggleSidebar}
              sidebarOpen={sidebarOpen}
              messagesContainerRef={messagesContainerRef}
            />
          )}
          <div ref={messagesEndRef} className="h-1" />
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
