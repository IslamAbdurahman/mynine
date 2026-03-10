import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type FolderPaginate, SearchData, Folder } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import AllTestCard from '@/components/all-test/all-test-card';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';

export default function AllTest() {
    const { folder, folders, filters, isAdmin } = usePage<{ 
        folder: FolderPaginate,
        folders: Folder[],
        filters: any,
        isAdmin: boolean
    }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('all_tests'),
            href: '/dashboard'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: filters?.search || '',
        folder_id: filters?.folder_id || '',
        from: filters?.from || '',
        to: filters?.to || '',
        per_page: filters?.per_page || folder.per_page,
        page: folder.current_page,
        total: folder.total
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('all-test.index'), data);
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('all_tests')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex justify-end items-center mb-2">
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                        folders={folders}
                        isAdmin={isAdmin}
                    />
                    <div className="hidden lg:block w-full">
                        <PremiumFilters 
                            handleSubmit={handleSubmit} 
                            setData={setData} 
                            data={data} 
                            folders={folders}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <AllTestCard {...folder} searchData={data} />

                </div>
            </div>
        </AppLayout>
    );
}
