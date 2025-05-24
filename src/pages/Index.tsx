
import { useState, useRef, useEffect } from 'react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

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

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        selectedChatId={selectedChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
      />
      
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-hidden">
          {!currentChat || currentChat.messages.length === 0 ? (
            <WelcomeScreen onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          ) : (
            <ChatContainer
              messages={currentChat.messages}
              isLoading={isLoading}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Index;
