import { NavigationTabs } from './navigation-tabs';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, activeTab, onTabChange, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Navigation */}
      <NavigationTabs activeTab={activeTab} onTabChange={onTabChange} onLogout={onLogout} />
      
      {/* Main Content Area */}
      <main className="w-full max-w-[1600px] mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Paper Background Container */}
        <div 
          className="bg-white rounded-xl shadow-2xl border-2 sm:border-4 border-slate-300 min-h-[calc(100vh-180px)] p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 overflow-x-hidden w-full"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 19px, rgba(200, 200, 200, 0.15) 20px),
              linear-gradient(90deg, transparent 19px, rgba(200, 200, 200, 0.1) 20px)
            `,
            backgroundSize: '20px 20px'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}