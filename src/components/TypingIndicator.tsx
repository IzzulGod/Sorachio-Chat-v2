
import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator = ({ isVisible }: TypingIndicatorProps) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-start space-x-3 animate-fade-in">
      <img 
        src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
        alt="Sorachio" 
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 max-w-[90%] sm:max-w-[85%] lg:max-w-[75%]">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">Sorachio sedang mengetik</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
