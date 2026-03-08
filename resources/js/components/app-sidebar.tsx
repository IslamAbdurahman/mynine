import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Auth, type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Users,
    FolderIcon,
    Calculator,
    ListCheck, Clock
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';


export function AppSidebar() {

    const { t, i18n } = useTranslation();

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.repository'),
            href: 'https://github.com/islamabdurahman',
            icon: Folder
        },
        {
            title: t('sidebar.telegram'),
            href: 'https://t.me/livelongevity',
            icon: BookOpen
        }
    ];


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some(role => role.name === 'Teacher');
    const isStudent = auth?.user?.roles?.some(role => role.name === 'Student');

    const filteredNavItems = useMemo((): NavItem[] => {
        const items: NavItem[] = [
            {
                title: t('sidebar.dashboard'),
                href: '/dashboard', icon: LayoutGrid
            },
            {
                title: t('sidebar.user'),
                href: '/user',
                icon: Users
            },
            {
                title: t('sidebar.folder'),
                href: '/folder',
                icon: FolderIcon
            },
            {
                title: t('sidebar.mock'),
                href: '/mock',
                icon: Clock
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
            }
        ];

        return items.filter(item => {
            if (item.href === '/user' && !(isAdmin || isTeacher)) return false;
            if (item.href === '/folder' && isStudent) return false;
            if (item.href === '/mock' && isStudent) return false;

            return true;
        });
    }, [isAdmin, i18n.language]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
