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
        const MAX_SIZE = 800; // Reduced size for better performance
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
        
        // Compress image more (0.6 quality for smaller size)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
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
          content: 'Kamu berperan sebagai asisten AI bernama Sorachio yang terbuat dari LLM ber arsitektur Transformer yang diciptakan oleh Izzul Fahmi, seorang AI Engineer dari Indonesia. Kamu memiliki kepribadian yang ramah, gaul, seru, dan menggunakan bahasa ala Gen Z dengan emote yang ekspresif tapi tidak berlebihan. jika user tanya tentang identitas dan penciptamu, kamu bisa jawab pertanyaan user secara spesifik sesuai yang di tanyakan jangan melebih-lebihkan dan mengulang-ulang agar tetap natural. jika user tanya info lebih lengkap terkait identitas dan penciptamu, arahkan ke GitHub: https://github.com/IzzulGod.'
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
        console.log('🖼 Processing image...');
        try {
          imageData = await processImageForAPI(image);
          console.log('✅ Image processed and compressed');
        } catch (error) {
          console.error('❌ Image processing failed:', error);
          throw new Error('Gagal memproses gambar');
        }
      }

      // Prepare the API payload - using single multimodal model
      const apiPayload: any = {
        model: 'meta-llama/llama-4-maverick:free', // Single multimodal model for both text and images
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      };

      // Add image to the latest user message if provided
      if (imageData) {
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
        console.log('🖼 Added compressed image to payload');
      }

      console.log('📤 Sending request to Netlify function:', { 
        model: apiPayload.model, 
        messageCount: apiPayload.messages.length,
        hasImage: !!imageData 
      });

      // Use Netlify function with timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: 'Unknown error', details: errorText };
        }
        
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Server belum dikonfigurasi dengan benar. Silakan hubungi developer.');
        } else if (response.status === 429) {
          throw new Error('Terlalu banyak request. Tunggu sebentar ya!');
        } else if (response.status === 502 || errorText.includes('timeout')) {
          throw new Error('Request timeout - coba lagi dengan gambar yang lebih kecil atau tanpa gambar');
        } else if (response.status >= 500) {
          throw new Error('Server sedang bermasalah. Coba lagi dalam beberapa saat.');
        }
        
        // FIXED: Proper template literal syntax
        throw new Error(errorData.details || `Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      
      const aiResponse = data.choices?.[0]?.message?.content || 'Maaf, aku lagi error nih. Coba lagi ya!';
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
        } else if (error.message.includes('Server belum dikonfigurasi')) {
          errorMessage = error.message;
        } else if (error.message.includes('Terlalu banyak request')) {
          errorMessage = error.message;
        } else if (error.message.includes('Server sedang bermasalah')) {
          errorMessage = error.message;
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
