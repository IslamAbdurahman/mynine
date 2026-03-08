import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';
import { AppBottomNav } from '@/components/app-bottom-nav';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[]
}>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="pb-14 md:pb-0 w-100" >

                <div className={'mb-14'}>
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                </div>

                {children}
            </AppContent>

            <AppBottomNav />

        </AppShell>
    );
}
