import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onToggleSidebar: () => void;
}

export const WelcomeScreen = ({ onToggleSidebar }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-lg">
          {/* Logo dengan ukuran lebih besar dan efek visual */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
            <img 
              src="/lovable-uploads/63083a92-c115-4af0-86c6-164b93752c8c.png" 
              alt="Sorachio Logo" 
              className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-lg border-4 border-white"
            />
          </div>
          
          {/* Greeting Text yang lebih rapi */}
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Halo! Aku Sorachio 👋
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium">
              Ada yang bisa kubantu?
            </p>
          </div>
          
          {/* Decorative elements */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          {/* Subtle hint text */}
          <p className="mt-6 text-sm text-gray-400 opacity-70">
            Mulai percakapan dengan mengetik pesan di bawah
          </p>
        </div>
      </div>
    </div>
  );
};
