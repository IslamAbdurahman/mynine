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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folder.tests.map((item, index) => {
                    const globalIndex = index + 1;
                    return (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {item.name}
                                </h3>
                                <span className="text-xs text-gray-500">#{globalIndex}</span>
                            </div>

                            {/* Comment */}
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {item.comment || t('no_comment')}
                            </p>

                            {/* Types */}
                            <div className="my-3">
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {t('types')}:
                                </h4>
                                <ol className="list-decimal ml-4 space-y-1 text-sm text-blue-600 dark:text-blue-400">
                                    {item.types.map((i, idx) => (
                                        <li key={idx}>
                                            <Link href={`/test-type/${i.id}`}>
                                                {i.type?.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {item.audio_path && (

                                <div>
                                    <audio controls>
                                        <source src={`/${item.audio_path}`} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>

                            )}


                            {/* Status + Open */}
                            <div className="mt-3 flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    {item.active == 1 ? (
                                        <CheckCircle className="text-green-500 w-5 h-5" />
                                    ) : (
                                        <MinusCircle className="text-gray-400 w-5 h-5" />
                                    )}
                                    <span>{t('status')}: {item.active == 1 ? t('active') : t('inactive')}</span>
                                </div>

                                {(isAdmin || isTeacher) && (
                                    <div className="flex items-center gap-2">
                                        {item.open == 1 ? (
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                        ) : (
                                            <MinusCircle className="text-gray-400 w-5 h-5" />
                                        )}
                                        <span>{t('open')}: {item.open == 1 ? t('yes') : t('no')}</span>

                                    </div>)}
                            </div>

                            {/* Actions */}
                            {(isAdmin || isTeacher) && (
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => handleUpdateClick(item)}
                                        className={`${baseButton} bg-green-600 hover:bg-green-700 focus:ring-green-300 flex-1 rounded-md`}
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDeleteClick(item)}
                                        className={`${baseButton} bg-red-600 hover:bg-red-700 focus:ring-red-300 flex-1 rounded-md`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
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
