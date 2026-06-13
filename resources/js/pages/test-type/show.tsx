import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { type BreadcrumbItem, Part, QuestionType, SearchData, Section, TestType } from '@/types';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import PremiumFilters from '@/components/premium-filters';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';
import CreateSectionModal from '@/components/section/create-section-modal';
import PartSection from '@/components/section/part-section';
import PartComponent from '@/components/part/part';
import ImportAiModal from '@/components/part/import-ai-modal';

export default function TestTypeShow() {
    const { testType, question_types } = usePage<{
        testType: TestType,
        question_types: QuestionType[]
    }>().props;
    const { t } = useTranslation();  // Using the translation hook


    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: t('part'),
            href: '/dashboard'
        }
    ];

    // Form handling for search and per_page
    const { data, setData } = useForm<SearchData>({
        search: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('test-type.show', testType.id), data);
    };


    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchQuery = urlParams.get('search') || ''; // Get 'search' query from the URL
        setData('search', searchQuery); // Set it to the form state
    }, [location.search]);


    const [activeTab, setActiveTab] = useState(
        Number(new URLSearchParams(window.location.search).get('tab')) || 0
    );


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Part" />
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

                <div>
                    {/* Tab header */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {testType.parts.map((part: Part, partIndex: number) => (
                            <button
                                key={part.id}
                                onClick={() => setActiveTab(part.id)}
                                className={`px-4 py-2 text-sm font-medium transition-all ${
                                    activeTab === part.id
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Part {partIndex + 1}
                            </button>
                        ))}
                        
                        <Link
                            href={route('part.create', { test_type_id: testType.id })}
                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 mb-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-semibold text-xs border border-blue-100 hover:border-blue-600 shadow-sm self-center mr-2 active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {t('add_part') ?? 'Add Part'}
                        </Link>
                    </div>

                    {/* Tab content */}
                    <div className="mt-4">
                        {testType.parts.map((part: Part, partIndex: number) => {


                                let order = Number(part?.order ?? 0);

                                if (activeTab !== part.id) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={partIndex}
                                        className={`grid gap-4 h-[calc(100vh)]
        ${testType.type?.name === 'Listening' ? '' : 'grid-cols-2'}
    `}
                                    >

                                        {/* Chap tomon */}
                                        <div className="overflow-y-auto pl-2">
                                            <PartComponent part={part} partIndex={partIndex} />
                                        </div>

                                        {/* O‘ng tomon */}
                                        <div className="overflow-y-auto pl-2">
                                            <div className="flex gap-3 mb-4">
                                                <CreateSectionModal
                                                    part={part}
                                                    question_types={question_types}
                                                />
                                                <ImportAiModal part={part} />
                                            </div>

                                            <div
                                                className="mt-4 border border-gray-200 rounded-lg divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
                                                {part.sections.map((section: Section, sectionIndex: number) => {
                                                    const sectionCount = section.questions.reduce(
                                                        (acc, q) => acc + (Number(q.is_correct_count) || 0),
                                                        0
                                                    );

                                                    // use the current order BEFORE incrementing
                                                    const globalIndex = order;

                                                    const element = (
                                                        <PartSection
                                                            key={section.id}
                                                            globalIndex={globalIndex}
                                                            section={section}
                                                            partIndex={partIndex}
                                                            sectionIndex={sectionIndex}
                                                        />
                                                    );

                                                    // update AFTER rendering
                                                    order += sectionCount;

                                                    return element;
                                                })}

                                            </div>
                                        </div>
                                    </div>
                                );

                            }
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
