import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Option } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Edit, TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import { baseButton } from '@/components/ui/baseButton';
import UpdateOptionModal from '@/components/option/update-option-modal';


interface SectionUpdateProps {
    option: Option;
    index: number;
}

export default function QuestionOption(
    { option, index }: SectionUpdateProps
) {
    const { t } = useTranslation();

    const [openDelete, setOpenDelete] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);

    const handleDeleteClick = () => {
        setOpenDelete(true); // Open the delete modal
    };
    const handleUpdateClick = () => {
        setOpenUpdate(true); // Open the delete modal
    };

    const { delete: deleteFolder, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = () => {
        deleteFolder(route('option.destroy', option.id), {
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
        <div key={option.id}
             className="flex items-start gap-2">
            <span className="flex-1">
                {String.fromCharCode(65 + index)}) {option.textarea}
            </span>
            {option.is_correct ? (
                <span
                    className="ml-2 text-sm text-green-500">(✔)</span>
            ) : null}


            <button
                onClick={handleUpdateClick}
                className={`${baseButton} bg-blue-600 hover:bg-blue-700 focus:ring-blue-300
                      dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800
                      text-white`}
            >

                <Edit className="w-4 h-4" />
            </button>

            <button
                onClick={handleDeleteClick}
                className={`${baseButton} bg-red-600 hover:bg-red-700 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900`}
            >
                <TrashIcon className="w-4 h-4" />
            </button>


            {/* Pass selected folder to the DeleteFolderModal */}
            {openUpdate && (
                <UpdateOptionModal
                    option={option}
                    open={openUpdate}  // Assuming you have a separate state for openDelete
                    setOpen={setOpenUpdate}  // Or you can manage this in its own state
                />
            )}


            {/* Pass selected folder to the DeleteFolderModal */}
            {openDelete && (
                <DeleteItemModal
                    item={option}
                    open={openDelete}  // Assuming you have a separate state for openDelete
                    setOpen={setOpenDelete}  // Or you can manage this in its own state
                    onDelete={handleDelete} // Handle deletion
                />
            )}

        </div>
    );
}
