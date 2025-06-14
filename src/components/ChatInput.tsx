
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Send } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { AutoResizeTextarea } from '@/components/AutoResizeTextarea';
import { VoiceRecording } from '@/components/VoiceRecording';

interface ChatInputProps {
  onSendMessage: (content: string, image?: File) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [showRecordingFeedback, setShowRecordingFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, startListening, stopListening, transcript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setMessage(transcript);
      setShowRecordingFeedback(true);
      setTimeout(() => setShowRecordingFeedback(false), 3000);
    }
  }, [transcript]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isListening) {
      setRecordingProgress(0);
      intervalId = setInterval(() => {
        setRecordingProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(intervalId);
            return 100;
          }
          return prevProgress + 10;
        });
      }, 300);
    } else {
      clearInterval(intervalId);
      setRecordingProgress(0);
    }

    return () => clearInterval(intervalId);
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    
    // Add sending animation
    const messageContainer = document.querySelector('.chat-messages');
    if (messageContainer) {
      messageContainer.classList.add('animate-pulse');
      setTimeout(() => messageContainer.classList.remove('animate-pulse'), 300);
    }
    
    onSendMessage(message.trim(), selectedImage || undefined);
    setMessage('');
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      {/* Enhanced Recording Feedback */}
      {isListening && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-30"></div>
              </div>
              <span className="text-sm font-medium text-red-700">🎤 Recording voice...</span>
            </div>
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-red-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-3 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
          <Progress value={recordingProgress} className="h-2 mb-2" />
          <p className="text-xs text-red-600">💡 Speak clearly, tap mic again to stop</p>
        </div>
      )}

      {/* Enhanced Success Feedback */}
      {showRecordingFeedback && transcript && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-700">✨ Voice captured successfully!</span>
          </div>
          <p className="text-xs text-green-600 bg-green-100 p-2 rounded italic">"{transcript.substring(0, 80)}..."</p>
        </div>
      )}

      {/* Enhanced Image Preview */}
      {imagePreview && (
        <div className="relative mb-4 animate-scale-in">
          <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 w-full object-contain shadow-lg" />
          <Button
            type="button"
            onClick={removeImage}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full shadow-lg backdrop-blur-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <AutoResizeTextarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ketik pesan kamu di sini... ✨"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            
            <VoiceRecording 
              isListening={isListening}
              onToggleRecording={toggleVoiceRecording}
            />
          </div>
          
          {/* Image Upload Button - aligned to center */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 self-center"
            title="Upload gambar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </Button>
          
          {/* Send Button - default styling, aligned to center */}
          <Button
            type="submit"
            disabled={isLoading || (!message.trim() && !selectedImage)}
            size="icon"
            className="shrink-0 self-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};
