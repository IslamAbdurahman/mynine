import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Part } from '@/types';
import { Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Edit, TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import { baseButton } from '@/components/ui/baseButton';
import { cleanTinyMce } from '@/utils/util';

interface PartUpdateProps {
    part: Part;
    partIndex: number;
}

export default function PartComponent(
    { part, partIndex }: PartUpdateProps
) {
    const { t } = useTranslation();

    const [openDelete, setOpenDelete] = useState(false);

    const handleDeleteClick = () => {
        setOpenDelete(true); // Open the delete modal
    };


    const { delete: deleteFolder, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = () => {
        console.log(deleteError);  // Log to see if errors are populated

        deleteFolder(route('part.destroy', part.id), {
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
        <div key={part.id}>


            <div className="break-words overflow-hidden max-w-full">

                <div className="flex gap-3">
                    {/* Delete button */}
                    <button
                        onClick={handleDeleteClick}
                        className={`${baseButton} bg-red-600 hover:bg-red-800 focus:ring-red-300
                           dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900`}
                    >
                        <TrashIcon className="w-4 h-4" />
                        {t('delete')} {t('part')}
                    </button>

                    {/* Update part link */}
                    <Link
                        href={`/part/${part.id}`}
                        className={`${baseButton} bg-purple-700 hover:bg-purple-800 focus:ring-purple-300
                           dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 text-center`}
                    >
                        <Edit className="w-4 h-4" />
                        {t('edit')} {t('part')}
                    </Link>
                </div>

                <div>
                    <h2 className="font-bold text-lg mb-2">
                        {partIndex + 1}. {part.name}
                    </h2>

                    <div
                        className="prose dark:prose-invert text-base/8 max-w-full"
                        dangerouslySetInnerHTML={{ __html: cleanTinyMce(part.textarea) }}
                    />

                </div>
            </div>


            {/* Pass selected folder to the DeleteFolderModal */}
            {openDelete && (
                <DeleteItemModal
                    item={part}
                    open={openDelete}  // Assuming you have a separate state for openDelete
                    setOpen={setOpenDelete}  // Or you can manage this in its own state
                    onDelete={handleDelete} // Handle deletion
                />
            )}

        </div>
    );
}
