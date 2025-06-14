
import React from 'react';

type MessageStatus = 'sending' | 'sent' | 'error';

interface MessageStatusProps {
  status: MessageStatus;
  onRetry?: () => void;
}

export const MessageStatus = ({ status, onRetry }: MessageStatusProps) => {
  if (status === 'sending') {
    return (
      <div className="flex items-center justify-end mt-1">
        <svg className="animate-spin h-3 w-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center justify-end mt-1">
        <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-end mt-1 space-x-2">
        <svg className="h-3 w-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
};
