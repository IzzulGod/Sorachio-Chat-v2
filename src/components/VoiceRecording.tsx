
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface VoiceRecordingProps {
  isListening: boolean;
  onToggleRecording: () => void;
}

export const VoiceRecording = ({ isListening, onToggleRecording }: VoiceRecordingProps) => {
  const [recordingTime, setRecordingTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggleRecording}
      className={`absolute right-2 bottom-2 p-2 rounded-md transition-all duration-200 ${
        isListening 
          ? 'bg-red-100 hover:bg-red-200 text-red-600' 
          : 'hover:bg-accent text-foreground hover:scale-105'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isListening && (
          <span className="text-xs font-mono text-red-600">
            {formatTime(recordingTime)}
          </span>
        )}
        <div className="relative">
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            className={`transition-all duration-200 ${isListening ? 'text-red-600 scale-110' : 'text-foreground'}`}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          {isListening && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>
    </Button>
  );
};
