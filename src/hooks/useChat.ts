
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

  // Helper function to resize and compress image
  const processImageForAPI = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Resize image if too large
        const MAX_SIZE = 900;
        let { width, height } = img;
        
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = (height * MAX_SIZE) / width;
            width = MAX_SIZE;
          } else {
            width = (width * MAX_SIZE) / height;
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress image (0.7 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const sendMessage = useCallback(async (content: string, image?: File, chatId?: string) => {
    const targetChatId = chatId || selectedChatId;
    if (!targetChatId) return;

    console.log('🚀 Starting sendMessage with:', { content, targetChatId, hasImage: !!image });
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

      console.log('✅ Created user message:', userMessage);

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

      console.log('📝 Prepared messages:', messages);

      // Process image if provided
      let imageData = null;
      if (image) {
        console.log('🖼️ Processing image...');
        try {
          imageData = await processImageForAPI(image);
          console.log('✅ Image processed and compressed');
        } catch (error) {
          console.error('❌ Image processing failed:', error);
          throw new Error('Gagal memproses gambar');
        }
      }

      // Prepare the API payload
      const apiPayload: any = {
        model: 'meta-llama/llama-4-maverick:free ', // Use non-vision model for now
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      };

      // Add image to the latest user message if provided
      if (imageData) {
        // For vision models, we need to structure the content differently
        apiPayload.model = 'meta-llama/llama-4-maverick:free ';
        const lastMessage = apiPayload.messages[apiPayload.messages.length - 1];
        lastMessage.content = [
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
        ];
        console.log('🖼️ Added compressed image to payload');
      }

      console.log('📤 Sending request to Netlify function:', { ...apiPayload, messages: '...' });

      // Use Netlify function with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not ok:', errorText);
        
        // Handle timeout specifically
        if (response.status === 502 && errorText.includes('timed out')) {
          throw new Error('Request timeout - coba lagi dengan gambar yang lebih kecil atau tanpa gambar');
        }
        
        throw new Error(`Failed to get response from AI: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      
      const aiResponse = data.choices[0]?.message?.content || 'Maaf, aku lagi error nih. Coba lagi ya!';
      console.log('🤖 AI Response:', aiResponse);

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

      console.log('✅ Message sent successfully');

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      let errorMessage = "Gagal mengirim pesan. Coba lagi ya!";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timeout - coba lagi dengan gambar yang lebih kecil atau tanpa gambar";
        } else if (error.message.includes('timeout')) {
          errorMessage = "Request timeout - coba lagi dengan gambar yang lebih kecil atau tanpa gambar";
        } else if (error.message.includes('Gagal memproses gambar')) {
          errorMessage = "Gagal memproses gambar - coba dengan format JPG/PNG yang lebih kecil";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
