import React, { useState } from 'react';
import CreateFolderModal from '@/components/folder/create-folder-modal';
import { CheckCircle, MinusCircle, PencilIcon, TrashIcon } from 'lucide-react';
import UpdateFolderModal from '@/components/folder/update-folder-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { Auth, Folder, type FolderPaginate, SearchData } from '@/types';
import { toast } from 'sonner';
import { baseButton } from '@/components/ui/baseButton';

interface FolderTableProps extends FolderPaginate {
    searchData: SearchData;
}

const FolderTable = ({ searchData, ...folder }: FolderTableProps) => {

    const { t } = useTranslation();  // Using the translation hook
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some(role => role.name === 'Teacher');

    const handleUpdateClick = (folderData: Folder) => {
        setSelectedFolder(folderData); // Set the selected folder data
        setOpen(true); // Open the modal
    };

    const handleDeleteClick = (folderData: Folder) => {
        setSelectedFolder(folderData); // Set the selected folder for deletion
        setOpenDelete(true); // Open the delete modal
    };


    const { delete: deleteFolder, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteFolder(route('folder.destroy', id), {
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
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {t('folder')}
                </h2>
                {(isAdmin || isTeacher) && <CreateFolderModal />}
            </div>


            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folder.data.map((item, index) => {
                    const globalIndex = (folder.current_page - 1) * folder.per_page + index + 1;

                    return (
                        <div
                            key={item.id}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    <Link href={`/folder/${item.id}`}>
                                        {item.name}
                                    </Link>
                                </h3>
                                <span className="text-xs text-gray-500">#{globalIndex}</span>
                            </div>

                            {/* Comment */}
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {item.comment || t('no_comment')}
                            </p>

                            {/* Status */}
                            <div className="mt-3 flex items-center gap-2">
                                {item.active == 1 ? (
                                    <CheckCircle className="text-green-500 w-5 h-5" />
                                ) : (
                                    <MinusCircle className="text-gray-400 w-5 h-5" />
                                )}
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.active == 1 ? t('active') : t('inactive')}
                        </span>
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
            {selectedFolder && open && (
                <UpdateFolderModal
                    folder={selectedFolder}
                    open={open}
                    setOpen={setOpen}
                />
            )}

            {selectedFolder && openDelete && (
                <DeleteItemModal
                    item={selectedFolder}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onDelete={handleDelete}
                />
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                <div>
                    {t('showing', {
                        from: folder.from,
                        to: folder.to,
                        total: folder.total
                    })}
                </div>
                <div className="flex gap-1">
                    {folder.links.map((link, index) => (
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
};

export default FolderTable;
