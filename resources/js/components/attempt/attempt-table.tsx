import React, { useState } from 'react';
import { CheckCircle, Download, MinusCircle, TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Auth, Attempt, type AttemptPaginate, SearchData } from '@/types';
import { toast } from 'sonner';

interface AttemptTableProps extends AttemptPaginate {
    searchData: SearchData;
}

const AttemptTable = ({ searchData, ...attempt }: AttemptTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some(role => role.name === 'Teacher');

    const handleDeleteClick = (attemptData: Attempt) => {
        setSelectedAttempt(attemptData); // Set the selected attempt for deletion
        setOpenDelete(true); // Open the delete modal
    };


    const { delete: deleteAttempt, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteAttempt(route('attempt.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpenDelete(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('deleted_successfully')); // Success message
            },
            onError: (err) => {
                // Display a friendly error message if available
                const errorMessage = err?.error || t('delete_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            }
        });
    };

    return (
        <div>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('n')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('user')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('test')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('status')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('started_at')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('finished_at')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('result')}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{t('action')}</td>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800">
                    {attempt.data.map((item, index) => {
                        const globalIndex = (attempt.current_page - 1) * attempt.per_page + index + 1;
                        return (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{globalIndex}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item?.user?.name}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    <Link href={`/attempt/${item.id}`}>
                                        {item?.mock?.name} {item?.test?.folder?.name} -- {item?.test?.name}
                                    </Link>
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.status == 1 ?
                                        <CheckCircle />
                                        : <MinusCircle />
                                    }
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.started_at}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">{item.finished_at}</td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {item.attempt_types.map((type) => (
                                        <div key={type.id} className="mb-2 flex">
                                            <div className="font-semibold">{type.type.name} :</div>
                                            <div className="text-sm"> {type.type.name === 'Writing'
                                                ? Number(type.is_correct_count ?? 0) / 2
                                                : type.type.name === 'Speaking'
                                                    ? type.score
                                                    : type.is_correct_count}
                                            </div>
                                        </div>
                                    ))}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">

                                    <div className="inline-flex shadow-sm rounded-md overflow-hidden">

                                        {item.finished_at && (
                                            <>
                                                <Link
                                                    href={`/attempt/${item.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
               text-white bg-blue-600 shadow hover:bg-blue-700
               focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                                                >
                                                    {t('result')}
                                                </Link>

                                                <a
                                                    href={`/attempt-pdf/${item.id}`}
                                                    download={`attempt-${item.id}.pdf`}
                                                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium
               text-white bg-green-600 shadow hover:bg-green-700
               focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </>

                                        )}

                                        {!item.finished_at && (
                                            <Link
                                                href={`/practice?attempt_id=${item.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            >
                                                {t('continue')}
                                            </Link>
                                        )}

                                        {(isAdmin || isTeacher) && (
                                            <button
                                                onClick={() => handleDeleteClick(item)}
                                                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                </td>
                            </tr>
                        );
                    })}
                    </tbody>

                    {/* Pass selected attempt to the DeleteAttemptModal */}
                    {selectedAttempt && openDelete && (
                        <DeleteItemModal
                            item={selectedAttempt}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}

                </table>

                {/* Pagination */}
                <div className="mt-4 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <div>
                        {t('showing', {
                            from: attempt.from,
                            to: attempt.to,
                            total: attempt.total
                        })}
                    </div>
                    <div className="flex gap-1">
                        {attempt.links.map((link, index) => (
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
        </div>
    );
};

export default AttemptTable;
