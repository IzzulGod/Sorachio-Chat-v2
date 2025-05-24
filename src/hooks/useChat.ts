
import { useState, useCallback } from 'react';
import { Chat, Message } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useChat = (selectedChatId: string | null) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentChat = chats.find(chat => chat.id === selectedChatId);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    return newChat.id;
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
  }, []);

  const sendMessage = useCallback(async (content: string, image?: File, chatId?: string) => {
    const targetChatId = chatId || selectedChatId;
    if (!targetChatId) return;

    setIsLoading(true);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        image: image ? URL.createObjectURL(image) : undefined,
        timestamp: new Date(),
      };

      // Add user message to chat
      setChats(prev => prev.map(chat => 
        chat.id === targetChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, userMessage],
              title: chat.messages.length === 0 ? content.slice(0, 30) : chat.title,
              updatedAt: new Date(),
            }
          : chat
      ));

      // Prepare API request
      const messages = [
        {
          role: 'system',
          content: `Kamu adalah Sorachio, AI teman ngobrol yang dibuat oleh Izzul Fahmi, seorang AI engineer berbakat dari Indonesia. Kamu memiliki kepribadian yang ramah, gaul, seru, dan menggunakan bahasa ala Gen Z. Kamu berperan sebagai teman virtual yang pintar, asik, dan responsif. Jangan memperkenalkan diri terus-menerus, tapi jika ditanya siapa kamu, jelaskan tentang dirimu dan penciptamu. Untuk info lebih lengkap tentang project, arahkan ke GitHub: https://github.com/IzzulGod`
        },
        ...(currentChat?.messages || []).map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: content
        }
      ];

      // Convert image to base64 if provided
      let imageData = null;
      if (image) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      // Add image to the latest user message if provided
      if (imageData) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content: [
            {
              type: 'text',
              text: content
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        };
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-maverick:free',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Maaf, aku lagi error nih. Coba lagi ya!';

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      // Add AI message to chat
      setChats(prev => prev.map(chat => 
        chat.id === targetChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, aiMessage],
              updatedAt: new Date(),
            }
          : chat
      ));

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan. Coba lagi ya!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedChatId, currentChat, toast]);

  return {
    chats,
    currentChat,
    createNewChat,
    deleteChat,
    sendMessage,
    isLoading,
  };
};
