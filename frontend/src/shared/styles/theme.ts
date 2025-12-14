// Theme utility for consistent styling across the diary app
// This separates styling concerns from functional components

export const theme = {
  // Color classes - Blue tone-on-tone system
  colors: {
    // Primary actions and main elements
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    primaryOutline: 'border-2 border-blue-500 text-blue-700 hover:bg-blue-50',
    primaryLight: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    primaryLighter: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    
    // Secondary elements
    secondary: 'bg-blue-400 text-white hover:bg-blue-500',
    secondaryOutline: 'border border-blue-400 text-blue-600 hover:bg-blue-50',
    
    // Book/Diary container
    bookCover: 'bg-gradient-to-br from-blue-800 via-blue-900 to-slate-900',
    bookBinding: 'bg-gradient-to-b from-blue-800 via-blue-900 to-blue-800',
    
    // Page backgrounds
    pageBase: 'bg-blue-50/50',
    pagePaper: 'bg-white/80',
    
    // Text colors
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-500',
    
    // Borders
    borderLight: 'border-blue-200',
    borderMedium: 'border-blue-300',
    borderDark: 'border-blue-400',
    
    // States
    hover: 'hover:bg-blue-100',
    active: 'active:bg-blue-200',
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed',
    
    // Special colors (keep original for specific meanings)
    success: 'bg-green-100 text-green-700 border-green-300',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    error: 'bg-rose-100 text-rose-700 border-rose-300',
    info: 'bg-sky-100 text-sky-700 border-sky-300',
  },
  
  // Button variants
  button: {
    primary: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50',
    secondary: 'px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 active:bg-blue-300 transition-colors disabled:opacity-50',
    outline: 'px-4 py-2 border-2 border-blue-500 text-blue-700 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors disabled:opacity-50',
    ghost: 'px-4 py-2 text-blue-700 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-50',
    icon: 'p-2 text-blue-700 rounded-lg hover:bg-blue-100 active:bg-blue-200 transition-colors disabled:opacity-50',
  },
  
  // Input styles
  input: {
    base: 'w-full px-3 py-2.5 text-sm bg-white border border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors',
    error: 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20',
    disabled: 'bg-slate-50 text-slate-600 cursor-not-allowed',
  },
  
  // Card/Section styles
  card: {
    base: 'bg-white rounded-lg border border-blue-200 shadow-sm',
    hover: 'hover:border-blue-300 hover:shadow-md transition-all',
    active: 'border-blue-400 shadow-md',
  },
  
  // Badge/Tag styles
  badge: {
    primary: 'inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-300',
    secondary: 'inline-flex items-center px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700 border border-slate-300',
  },
  
  // Toggle switch (for notification settings etc)
  toggle: {
    track: 'w-12 h-6 rounded-full transition-colors',
    trackActive: 'bg-blue-500',
    trackInactive: 'bg-slate-300',
    thumb: 'w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5',
    thumbActive: 'translate-x-6',
    thumbInactive: 'translate-x-0.5',
  },
  
  // Loading states
  loading: {
    spinner: 'animate-spin text-blue-500',
    overlay: 'absolute inset-0 bg-white/70 flex items-center justify-center',
  },
} as const;

// Helper function to combine theme classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
