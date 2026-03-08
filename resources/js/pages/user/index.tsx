import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, type UserPaginate, SearchData, Role } from '@/types';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import UserTable from '@/components/user/user-table';
import SearchForm from '@/components/search-form';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';

export default function User() {
    const { user, roles } = usePage<{
        user: UserPaginate,
        roles: Role[]
    }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('user'),
            href: '/dashboard'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: '',
        role: '',
        per_page: user.per_page,
        page: user.current_page,
        total: user.total
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('user.index'), data);
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);

        const roleQuery = urlParams.get('role') ?? '';
        setData('role', roleQuery);

        const searchQuery = urlParams.get('search') ?? '';
        setData('search', searchQuery);

        // Agar nom va qiymatni ko‘rmoqchi bo‘lsangiz
        urlParams.forEach((value, key) => {
            console.log(key, value);
        });    }, []); // roles array ni dependency qilib qo‘yish


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Search and Per-Page Selection */}
                <div className="flex justify-end items-center">
                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                    />
                    <div className={'hidden lg:block'}>
                        <SearchForm handleSubmit={handleSubmit}
                                    roles={roles}
                                    setData={setData}
                                    data={data} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <UserTable
                        {...user}
                        roles={roles}
                        searchData={data} />

                </div>
            </div>
        </AppLayout>
    );
}
