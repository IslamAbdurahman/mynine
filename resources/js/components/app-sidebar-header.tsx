import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import LanguageBar from '@/components/language';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <div className="fixed top-0 z-50 block w-full dark:bg-black bg-white">
            <header className="flex justify-between items-center h-14 px-6 border-b border-sidebar-border/50">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex-1"></div>
                <div className="fixed top-0 right-0 md:right-30 p-3">
                    <LanguageBar />
                </div>
            </header>
        </div>

    );
}
