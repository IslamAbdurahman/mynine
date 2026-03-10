import React, { useState } from 'react';
import CreateTestModal from '@/components/test/create-test-modal';
import { CheckCircle, MinusCircle, PencilIcon, TrashIcon } from 'lucide-react';
import UpdateTestModal from '@/components/test/update-test-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Auth, Test, Folder } from '@/types';
import { toast } from 'sonner';
import { baseButton } from '@/components/ui/baseButton';


const TestTable = ({ ...folder }: Folder) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some(role => role.name === 'Teacher');

    const handleUpdateClick = (testData: Test) => {
        setSelectedTest(testData); // Set the selected test data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (testData: Test) => {
        setSelectedTest(testData); // Set the selected test for deletion
        setOpenDelete(true); // Open the delete modal
    };


    const { delete: deleteTest, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteTest(route('test.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
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
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {t('tests')}
                </h2>
                {(isAdmin || isTeacher) && (
                    <CreateTestModal folder_id={folder.id} />
                )}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {folder.tests.map((item, index) => {
                    const globalIndex = index + 1;
                    const isActive = item.active == 1;

                    return (
                        <div
                            key={item.id}
                            className="group flex flex-col justify-between rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-700 dark:bg-gray-900"
                        >
                            {/* Header */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 opacity-70">
                                        #{globalIndex}
                                    </span>
                                    <div className="flex gap-1">
                                        {isActive ? (
                                            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                {t('active')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                {t('inactive')}
                                            </span>
                                        )}
                                        {isAdmin && (
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${item.open == 1 ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {item.open == 1 ? t('open') : t('closed') ?? 'Closed'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="line-clamp-1 text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {item.name}
                                </h3>
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                                <p className="line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                    {item.comment || t('no_comment')}
                                </p>
                            </div>

                            {/* Types Tags */}
                            <div className="mb-6">
                                <div className="flex flex-wrap gap-1.5">
                                    {item.types.map((i, idx) => (
                                        <Link 
                                            key={idx} 
                                            href={`/test-type/${i.id}`}
                                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-[10px] font-semibold text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all"
                                        >
                                            {i.type?.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Audio Player */}
                            {item.audio_path && (
                                <div className="mb-6 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700">
                                    <audio className="w-full h-8" controls>
                                        <source src={`/${item.audio_path}`} type="audio/mpeg" />
                                    </audio>
                                </div>
                            )}

                            {/* Actions */}
                            {(isAdmin || isTeacher) && (
                                <div className="flex items-center gap-2 pt-2 mt-auto border-t border-gray-50 dark:border-gray-800">
                                    <button
                                        onClick={() => handleUpdateClick(item)}
                                        className="flex-1 flex h-9 items-center justify-center gap-2 rounded-xl bg-gray-50 text-gray-600 transition-all hover:bg-green-600 hover:text-white dark:bg-gray-800 font-bold text-xs"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                        {t('edit')}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:bg-red-900/10"
                                        title={t('delete')}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modals */}
            {selectedTest && open && (
                <UpdateTestModal
                    test={selectedTest}
                    open={open}
                    setOpen={setOpen}
                />
            )}

            {selectedTest && openDelete && (
                <DeleteItemModal
                    item={selectedTest}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onDelete={handleDelete}
                />
            )}
        </div>

    );
};

export default TestTable;
