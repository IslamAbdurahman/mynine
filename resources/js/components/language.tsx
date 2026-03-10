import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppearanceTabs from '@/components/appearance-tabs';
import { cn } from '@/lib/utils';

interface LanguageBarProps {
    variant?: 'default' | 'dark' | 'glass';
}

const LanguageBar = ({ variant = 'default' }: LanguageBarProps) => {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isForcedDark = variant === 'dark' || variant === 'glass';

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
        setOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex justify-end relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border-2 transition-all shadow-sm active:scale-95 min-w-[110px] whitespace-nowrap",
                    isForcedDark 
                        ? "border-white/20 bg-white/10 hover:bg-white/20 text-white" 
                        : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                )}
            >
                {t('lang.title') ?? 'Language'}
            </button>

            {open && (
                <div
                    className="absolute right-0 mt-3 w-64 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2 border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 z-[100] p-2 flex flex-col gap-1.5 anim-fade-in backdrop-blur-xl">
                    <div className="px-3 py-2.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest border-b-2 border-gray-100 dark:border-gray-800 mb-1 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {t('lang.title') ?? 'Select Language'}
                    </div>
                    <button
                        onClick={() => changeLanguage('uz')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white rounded transition-colors text-sm font-semibold"
                    >
                        <span className="text-base">🇺🇿</span> {t('lang.uz')}
                    </button>
                    <button
                        onClick={() => changeLanguage('en')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white rounded transition-colors text-sm font-semibold"
                    >
                        <span className="text-base">🇬🇧</span> {t('lang.en')}
                    </button>
                    <button
                        onClick={() => changeLanguage('ru')}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white rounded transition-colors text-sm font-semibold"
                    >
                        <span className="text-base">🇷🇺</span> {t('lang.ru')}
                    </button>
                    
                    <div className="px-3 py-2 mt-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest border-t border-gray-100 dark:border-gray-800 pt-3 mb-1">
                        {t('appearance.title') ?? 'Appearance'}
                    </div>
                    <div className="px-2">
                        <AppearanceTabs className="w-full" label={false} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageBar;
