import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm } from '@inertiajs/react';
import { type BreadcrumbItem, SearchData, Attempt, Auth } from '@/types';
import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';
import AttemptTypeComponent from '@/components/attempt/attempt-type-component';
import EvaluateSpeaking from '@/components/attempt/evaluate-speaking';

export default function AttemptShow() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();  // Using the translation hook

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('attempt'),
            href: '/attempt'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('attempt.show', attempt.id), data);
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state
    }, [location.search]);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some(role => role.name === 'Teacher');

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
                    />
                    <div className="hidden lg:block w-full">
                        <PremiumFilters handleSubmit={handleSubmit} setData={setData} data={data} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">

                    <div className="border border-gray-300 dark:border-gray-600 p-4 rounded-lg shadow-md space-y-6">

                        {/* attempt details */}
                        <div className="p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800 relative">
                            <h2 className="text-lg font-semibold mb-4">{t('attempt_details')}</h2>
                            <div className="space-y-2">
                                <p><strong>{t('id')}:</strong> {attempt.id}</p>
                                <p>
                                    <strong>{t('user')}:</strong> {attempt.user.name} ({attempt.user.phone ?? attempt.user.email})
                                </p>
                                <p><strong>{t('mock')}:</strong> {attempt?.mock?.name}</p>
                                <p><strong>{t('test')}:</strong> {attempt?.test?.folder.name} {attempt?.test?.name}</p>
                                <p><strong>{t('started_at')}:</strong> {attempt.started_at}</p>
                                <p><strong>{t('finished_at')}:</strong> {attempt.finished_at}</p>
                            </div>

                            {(isTeacher || isAdmin) && (
                                <div className="absolute top-0 right-0">
                                    <EvaluateSpeaking attempt={attempt} />
                                </div>
                            )}

                        </div>

                        {/* attempt types cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {attempt.attempt_types.map((type) => (
                                <div
                                    key={type.id}
                                    className="p-4 border rounded-xl shadow-sm bg-white dark:bg-gray-800 flex flex-col items-start"
                                >
                                    <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                                        {type.type.name} : {type.type.name === 'Writing'
                                        ? Number(type.is_correct_count ?? 0) / 2
                                        : type.type.name === 'Speaking'
                                            ? type.score
                                            : type.is_correct_count}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">

                                        {type.comment}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4">

                        {
                            attempt.attempt_types.map((attemptType) =>
                                (
                                    <div
                                        key={attemptType.id}
                                        className={`mt-6 ${['Writing', 'Speaking'].includes(attemptType.type.name) ? 'col-span-2' : ''}`}
                                    >
                                        <h3 className="text-md font-semibold mb-2">{attemptType.type.name}</h3>
                                        <AttemptTypeComponent
                                            attempt_type={attemptType}
                                        />
                                    </div>

                                )
                            )
                        }

                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
