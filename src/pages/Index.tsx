
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    console.log('🔄 Attempting to scroll to bottom...');
    
    // First try to scroll the messages container
    if (messagesContainerRef.current) {
      console.log('📜 Scrolling messages container');
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
    
    // Then scroll to the bottom element
    if (messagesEndRef.current) {
      console.log('📍 Scrolling to messagesEndRef');
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  }, []);

  // Force scroll when messages change
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      console.log('📨 Messages changed, scrolling...', currentChat.messages.length);
      // Use multiple timeouts to ensure scroll works
      setTimeout(scrollToBottom, 0);
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
    }
  }, [currentChat?.messages, scrollToBottom]);

  // Scroll when loading state changes
  useEffect(() => {
    if (!isLoading && currentChat?.messages && currentChat.messages.length > 0) {
      console.log('✅ Loading finished, scrolling...');
      setTimeout(scrollToBottom, 200);
      setTimeout(scrollToBottom, 500);
    }
  }, [isLoading, scrollToBottom, currentChat?.messages]);

  // Handle viewport changes
  useEffect(() => {
    const handleResize = () => {
      setTimeout(scrollToBottom, 100);
    };

    const handleOrientationChange = () => {
      setTimeout(scrollToBottom, 300);
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
    console.log('🚀 Sending message, will scroll to bottom after...');
    
    // Immediate scroll when send is clicked
    scrollToBottom();
    
    if (!selectedChatId) {
      const newChatId = createNewChat();
      setSelectedChatId(newChatId);
      await sendMessage(content, image, newChatId);
    } else {
      await sendMessage(content, image, selectedChatId);
    }
    
    // Force scroll after message sent
    setTimeout(scrollToBottom, 50);
    setTimeout(scrollToBottom, 200);
    setTimeout(scrollToBottom, 500);
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
    console.log('Toggling sidebar. Current state:', sidebarOpen, 'New state:', !sidebarOpen);
    setSidebarOpen(prev => !prev);
  }, [sidebarOpen]);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  console.log('Index render - sidebarOpen:', sidebarOpen);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden full-height">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <div className="flex-1 flex flex-col relative chat-container w-full min-w-0">
        {/* Sidebar overlay for mobile - positioned to only cover main content */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay md:hidden"
            onClick={handleCloseSidebar}
            aria-label="Close sidebar"
          />
        )}
        
        <div className="flex-1 overflow-hidden min-h-0 messages-container">
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
          {/* Messages end marker - always present */}
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
