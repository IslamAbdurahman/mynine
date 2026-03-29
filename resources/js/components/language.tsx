import AppearanceTabs from '@/components/appearance-tabs';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageBar = () => {
    const { i18n, t } = useTranslation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
        <div className="relative flex justify-end" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="rounded border border-gray-300 bg-white px-3 py-1 text-sm shadow hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
                🌐 {t('lang.title') ?? 'Language'}
            </button>

            {open && (
                <div className="absolute right-0 z-50 mt-2 w-36 rounded border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button
                        onClick={() => changeLanguage('uz')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                        🇺🇿 {t('lang.uz')}
                    </button>
                    <button
                        onClick={() => changeLanguage('en')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                        🇬🇧 {t('lang.en')}
                    </button>
                    <button
                        onClick={() => changeLanguage('ru')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                    >
                        🇷🇺 {t('lang.ru')}
                    </button>
                    <AppearanceTabs className={'flex flex-col gap-1'} />
                </div>
            )}
        </div>
    );
};

export default LanguageBar;
