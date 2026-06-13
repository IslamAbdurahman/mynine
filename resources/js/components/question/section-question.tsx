import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Question, QuestionType, Section } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Edit, TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import CreateOptionModal from '@/components/option/create-option-modal';
import QuestionOpton from '@/components/option/question-option';
import UpdateQuestionModal from '@/components/question/update-question-modal';
import { baseButton } from '@/components/ui/baseButton';


interface SectionUpdateProps {
    question: Question;
    section: Section;
    question_type: QuestionType;
    index: number;
    globalIndex: number;
}

export default function SectionQuestion(
    { question, section, question_type, index, globalIndex }: SectionUpdateProps
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
        deleteFolder(route('question.destroy', question.id), {
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
        <div key={question.id}
             className="p-4 border rounded-lg shadow-sm">

            {(question_type.type !== 'complete_section' && question_type.type !== 'drag_and_drop') && (
                <>

                    <div className="flex gap-2">
                        <button
                            onClick={handleUpdateClick}
                            className={`${baseButton} bg-blue-500 hover:bg-blue-600 focus:ring-blue-300`}
                        >
                            <Edit className="w-4 h-4" />
                        </button>

                        <button
                            onClick={handleDeleteClick}
                            className={`${baseButton} bg-red-500 hover:bg-red-600 focus:ring-red-300`}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>


                    {/* Pass selected folder to the DeleteFolderModal */}
                    {openUpdate && (
                        <UpdateQuestionModal
                            question={question}
                            section={section}
                            open={openUpdate}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenUpdate}  // Or you can manage this in its own state
                        />
                    )}


                    {/* Pass selected folder to the DeleteFolderModal */}
                    {openDelete && (
                        <DeleteItemModal
                            item={question}
                            open={openDelete}  // Assuming you have a separate state for openDelete
                            setOpen={setOpenDelete}  // Or you can manage this in its own state
                            onDelete={handleDelete} // Handle deletion
                        />
                    )}
                </>
            )}


            {/* Question */}
            <h2 className="font-medium text-lg">
                {(() => {
                    const count = question.is_correct_count ?? 1;
                    return count > 1
                        ? Array.from({ length: count }, (_, i) => globalIndex - count + 1 + i).join('-')
                        : globalIndex;
                })()}. {question.textarea}

                {question.answer_text && ` Answer : ${question.answer_text}`}
            </h2>


            {(
                    question_type.type === 'multiple_choice'
                    || question_type.type === 'multiple_response'
                )
                && (
                    <div>
                        <CreateOptionModal question={question} />
                    </div>
                )}


            {/* Options */}
            <div className="mt-3 space-y-2">
                {question.options.map((option, oIndex) => {

                    return (
                        <QuestionOpton
                            option={option}
                            index={oIndex}
                            question_type={question_type}
                        />
                    );
                })}
            </div>
        </div>
    );
}
