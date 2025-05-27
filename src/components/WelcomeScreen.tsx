import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

export const WelcomeScreen = ({ onToggleSidebar, sidebarOpen = false }: WelcomeScreenProps) => {
  console.log('WelcomeScreen render - sidebarOpen:', sidebarOpen);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          {sidebarOpen ? (
            // Back/Close icon when sidebar is open
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ) : (
            // Hamburger menu icon when sidebar is closed
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">Sorachio</h1>
        <div className="w-8"></div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
              alt="Sorachio Logo" 
              className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full shadow-sm"
            />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              Halo! Aku Sorachio 👋
            </h2>
            <p className="text-lg text-gray-600 font-medium">
              Apa ada yang bisa kubantu?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
