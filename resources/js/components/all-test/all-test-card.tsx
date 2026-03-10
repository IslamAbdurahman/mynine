import { useTranslation } from 'react-i18next';
import { FolderPaginate, SearchData } from '@/types';
import { Link } from '@inertiajs/react';
import React from 'react';
import CreateAttemptModal from '@/components/attempt/create-attempt-modal';
import { Icon } from '@iconify/react';

interface FolderTableProps extends FolderPaginate {
    searchData: SearchData;
}

export default function AllTestCard({
                                        data,
                                        from,
                                        to,
                                        total,
                                        links,
                                        searchData
                                    }: FolderTableProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-12">
            {Array.isArray(data) && data.length > 0 ? (
                data
                    .filter((folder) => Array.isArray(folder.tests) && folder.tests.length > 0)
                    .map((folder) => (
                        <div key={folder.id} className="relative">
                            {/* Folder Header */}
                            <div className="mb-6 flex flex-col gap-1 border-l-4 border-blue-600 pl-4">
                                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                                    {folder.name}
                                </h2>
                                {folder.comment && (
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 italic">
                                        {folder.comment}
                                    </p>
                                )}
                            </div>

                            {/* Tests Grid */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {folder.tests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="group flex flex-col justify-between rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
                                    >
                                        <div className="mb-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {test.name}
                                                </h3>
                                                <CreateAttemptModal test={test} />
                                            </div>

                                            {test.comment && (
                                                <p className="mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                                                    {test.comment}
                                                </p>
                                            )}

                                            {/* Skills List */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {test.types.map((skill) => (
                                                    <span
                                                        key={skill.id}
                                                        className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                                                    >
                                                        {skill.type.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                                <Icon icon="solar:users-group-rounded-linear" className="text-lg" />
                                                <span>{test.attempts_count} {t('total_attempts')}</span>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Icon icon="solar:folder-error-linear" className="text-6xl text-gray-300 mb-4" />
                    <p className="text-xl font-bold text-gray-400">{t('no_tests_found')}</p>
                </div>
            )}

            {/* Pagination */}
            <div className="mt-12 px-6 py-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t('showing', { from, to, total })}
                </div>
                <div className="flex gap-1 overflow-x-auto pb-2 sm:pb-0">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}`}
                            className={`px-3 py-1 rounded-lg text-sm font-bold transition-all duration-200 ${
                                link.active
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : !link.url
                                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed border border-transparent'
                                        : 'bg-white dark:bg-gray-800 dark:text-gray-700 text-gray-600 border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
