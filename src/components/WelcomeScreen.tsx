
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface WelcomeScreenProps {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
}

export const WelcomeScreen = ({ onToggleSidebar, sidebarOpen = false }: WelcomeScreenProps) => {
  console.log('WelcomeScreen render - sidebarOpen:', sidebarOpen);
  
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className={`p-2 hover:bg-accent rounded-md ${
            sidebarOpen ? 'hidden md:block' : 'block'
          }`}
        >
          {sidebarOpen ? (
            // Back/Close icon when sidebar is open (desktop only)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          ) : (
            // Hamburger menu icon when sidebar is closed
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Sorachio</h1>
        <ThemeToggle />
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
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Halo! Aku Sorachio 👋
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Ada yang bisa kubantu?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
