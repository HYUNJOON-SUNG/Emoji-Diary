import { Home, Search, BarChart2, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: 'home' | 'list' | 'stats' | 'mypage') => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
    const navItems = [
        { id: 'home', icon: Home, label: '홈' },
        { id: 'list', icon: Search, label: '검색' },
        { id: 'stats', icon: BarChart2, label: '통계' },
        { id: 'mypage', icon: User, label: '마이' },
    ];

    return (
        <nav className="w-full bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-safe">
            <div className="flex items-center justify-between px-2 h-16">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id as any)}
                            className={cn(
                                "flex flex-col items-center justify-center w-1/4 h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                            )}
                        >
                            <Icon
                                className={cn(
                                    "w-6 h-6",
                                    isActive && "fill-current"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="text-[10px] font-medium">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
