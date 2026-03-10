import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type AttemptPaginate, SearchData, User, Mock, Test } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import AttemptTable from '@/components/attempt/attempt-table';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';

export default function Attempt() {
    const { attempt, users, mocks, tests, filters, isAdmin } = usePage<{ 
        attempt: AttemptPaginate,
        users: User[],
        mocks: Mock[],
        tests: Test[],
        filters: any,
        isAdmin: boolean
    }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('attempt'),
            href: '/dashboard'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: filters?.search || '',
        user_id: filters?.user_id || '',
        mock_id: filters?.mock_id || '',
        test_id: filters?.test_id || '',
        from: filters?.from || '',
        to: filters?.to || '',
        per_page: filters?.per_page || attempt.per_page,
        page: attempt.current_page,
        total: attempt.total
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('attempt.index'), data);
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attempt" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex justify-end items-center mb-2">
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        users={users}
                        mocks={mocks}
                        tests={tests}
                        isAdmin={isAdmin}
                    />
                    <div className="hidden lg:block w-full">
                        <PremiumFilters 
                            handleSubmit={handleSubmit} 
                            setData={setData} 
                            data={data} 
                            users={users}
                            mocks={mocks}
                            tests={tests}
                            isAdmin={isAdmin}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <AttemptTable {...attempt} searchData={data} />

                </div>
            </div>
        </AppLayout>
    );
}
