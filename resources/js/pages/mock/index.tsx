import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type MockPaginate, SearchData, Test, User } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import MockTable from '@/components/mock/mock-table';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';

export default function Mock() {
    const { mock, tests, users, filters, isAdmin } = usePage<{
        mock: MockPaginate,
        tests: Test[],
        users: User[],
        filters: any,
        isAdmin: boolean
    }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('mock'),
            href: '/dashboard'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: filters?.search || '',
        user_id: filters?.user_id || '',
        test_id: filters?.test_id || '',
        from: filters?.from || '',
        to: filters?.to || '',
        per_page: filters?.per_page || mock.per_page,
        page: mock.current_page,
        total: mock.total
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('mock.index'), data);
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mock" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex justify-end items-center mb-2">
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        users={users}
                        tests={tests}
                        isAdmin={isAdmin}
                    />
                    <div className="hidden lg:block w-full">
                        <PremiumFilters
                            data={data}
                            setData={setData}
                            handleSubmit={handleSubmit}
                            isAdmin={isAdmin}
                            users={users}
                            tests={tests}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <MockTable {...mock}
                               searchData={data}
                               tests={tests}
                    />

                </div>
            </div>
        </AppLayout>
    );
}
