
import { Chat } from '@/types/chat';

export const exportChatAsJSON = (chat: Chat) => {
  const exportData = {
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    messages: chat.messages.map(msg => ({
      role: msg.role === 'user' ? 'User' : 'Sorachio',
      content: msg.content,
      timestamp: msg.timestamp
    }))
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${chat.title || 'Chat'}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportChatAsTXT = (chat: Chat) => {
  let txtContent = `Chat: ${chat.title}\n`;
  txtContent += `Created: ${new Date(chat.createdAt).toLocaleString()}\n`;
  txtContent += `Updated: ${new Date(chat.updatedAt).toLocaleString()}\n\n`;
  txtContent += '='.repeat(50) + '\n\n';

  chat.messages.forEach((msg, index) => {
    const role = msg.role === 'user' ? 'User' : 'Sorachio';
    txtContent += `${role}: ${msg.content}\n\n`;
  });

  const dataBlob = new Blob([txtContent], { type: 'text/plain' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${chat.title || 'Chat'}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
