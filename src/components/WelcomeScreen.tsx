
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onToggleSidebar: () => void;
}

export const WelcomeScreen = ({ onToggleSidebar }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Sorachio</h1>
        <div className="w-8"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center max-w-sm">
          <img 
            src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
            alt="Sorachio Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Halo! Aku Sorachio 👋 ada yang bisa kubantu?
          </h2>
        </div>
      </div>
    </div>
  );
};
