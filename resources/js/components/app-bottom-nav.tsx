import { router, usePage } from '@inertiajs/react';
import { LayoutGrid, Building2, Settings, Calendar, CalculatorIcon, ListCheck, Calculator } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AppBottomNav() {
    const page = usePage();
    const { t } = useTranslation();

    const mainNavItems = [
        {
            title: t('sidebar.dashboard'), // Asosiy
            href: '/dashboard',
            icon: LayoutGrid
        },
        {
            title: t('sidebar.all_tests'),
            href: '/all-test',
            icon: ListCheck
        },
        {
            title: t('sidebar.my_result'),
            href: '/attempt',
            icon: Calculator
        },
        {
            title: t('sidebar.profile'), // Oylik
            href: '/settings/profile',
            icon: Settings
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden">
            <div className="flex justify-around items-center py-2">
                {mainNavItems.map((item) => {
                    const isActive = item.href === page.url;

                    return (
                        <div key={item.title} className="flex-1">
                            <button
                                onClick={() => router.visit(item.href)}
                                className={`flex flex-col items-center w-full ${isActive ? 'text-blue-500' : 'text-gray-800'} dark:${isActive ? 'text-blue-300' : 'text-white'}`}
                            >
                                <div className="mb-1">
                                    {item.icon && <item.icon className="text-lg" />}
                                </div>
                                <span className="text-sm">{item.title}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
