
import { Message } from '@/types/chat';
import { User } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3`}>
      {!isUser && (
        <img 
          src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
          alt="Sorachio" 
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
      )}
      
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        isUser 
          ? 'bg-gray-900 text-white rounded-br-sm' 
          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
      }`}>
        {message.image && (
          <img 
            src={message.image} 
            alt="Uploaded image" 
            className="max-w-full rounded-lg mb-2"
          />
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};
