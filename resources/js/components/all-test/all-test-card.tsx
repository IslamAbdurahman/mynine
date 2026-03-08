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
        <div className="space-y-8">
            {Array.isArray(data) && data.length > 0 ? (
                data
                    .filter((folder) => Array.isArray(folder.tests) && folder.tests.length > 0) // 🔥 faqat testlari bor folderlar
                    .map((folder) => (
                        <div key={folder.id}>
                            {/* Folder title */}
                            <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                                {folder.name}
                            </h2>
                            {folder.comment && (
                                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-4">
                                    {folder.comment}
                                </h3>
                            )}

                            {/* Tests inside folder */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {folder.tests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-4 hover:shadow-lg transition"
                                    >
                                        {/* Test title */}
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                {test.name}
                                            </h3>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                                <CreateAttemptModal test={test} />
                                            </h3>
                                            {test.comment && (
                                                <span
                                                    className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                                                    {test.comment}
                                                </span>
                                            )}
                                        </div>

                                        {/* Skills + scores */}
                                        <ul className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                            {test.types.map((skill) => (
                                                <li
                                                    key={skill.id}
                                                    className="flex justify-between"
                                                >
                                                    <span>{skill.type.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="flex justify-end">
                                            <Icon icon="solar:users-group-rounded-linear"
                                                  className="text-primary text-xl" />
                                            <h3 className="text-base font-medium text-gray-700 dark:text-gray-200">
                                                {test.attempts_count}
                                            </h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
            ) : (
                <p className="text-center text-gray-500">{t('no_tests_found')}</p>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                <div>
                    {t('showing', { from, to, total })}
                </div>
                <div className="flex gap-1">
                    {links.map((link, index) => (
                        <Link
                            key={index}
                            href={`${link.url ?? '?'}&search=${searchData.search}&per_page=${searchData.per_page}`}
                            className={`px-3 py-1 rounded-md text-sm transition ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : !link.url
                                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                        : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
