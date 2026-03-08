import AppLayout from '@/layouts/app-layout';
import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { type BreadcrumbItem, Part, QuestionType, SearchData, Section, TestType } from '@/types';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import SearchForm from '@/components/search-form';
import { useTranslation } from 'react-i18next';
import MobileSearchModal from '@/components/MobileSearchModal';
import CreateSectionModal from '@/components/section/create-section-modal';
import PartSection from '@/components/section/part-section';
import PartComponent from '@/components/part/part';

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
                <div className="flex items-center justify-between">
                    <div className={''}>
                        <Link href={'/folder'} className={'underline'}>
                            {t('folder')} /
                        </Link>
                        <Link href={`/folder/${testType.test.folder.id}`} className={'underline'}>
                            {testType.test.folder.name} /
                        </Link>

                        <Link
                            href={`/test-type/${testType.id}`}
                            className="underline"
                        >
                            {testType.test?.name}
                        </Link>
                        / {testType.type?.name}
                    </div>
                    <Link href={`/part/create?test_type_id=${testType.id}`} className={'butt'}>
                        <button type="button"
                                className={'focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900'}>
                            {t('create')} {t('part')}
                        </button>
                    </Link>

                    <MobileSearchModal
                        data={data}
                        setData={setData}
                        handleSubmit={handleSubmit}
                    />
                    <div className={'hidden lg:block'}>
                        <SearchForm handleSubmit={handleSubmit} setData={setData} data={data} />
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
                                className={`px-4 py-2 text-sm font-medium ${
                                    activeTab === part.id
                                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Part {partIndex + 1}
                            </button>
                        ))}
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
                                            <CreateSectionModal
                                                part={part}
                                                question_types={question_types}
                                            />

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
