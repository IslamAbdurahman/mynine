import AppLayout from '@/layouts/app-layout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    type BreadcrumbItem,
    type User
} from '@/types';
import { useTranslation } from 'react-i18next';


export default function UserShow() {
    const { user } = usePage<{
        user: User,
    }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: `${t('user')} ( ${user.name} )`,
            href: '/dashboard'
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex flex-col md:flex-row justify-between">
                    <div className={'mb-4'}>
                        <Link href={`/user`} className={'underline'}>
                            {t('user')} /
                        </Link>
                        {user?.name}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                </div>
            </div>
        </AppLayout>
    );
}
