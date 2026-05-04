import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Edit, TrashIcon } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import CreateQuestionModal from '@/components/question/create-question-modal';
import SectionQuestion from '@/components/question/section-question';
import UpdateSectionModal from '@/components/section/update-section-modal';
import { baseButton } from '@/components/ui/baseButton';
import { cleanTinyMce } from '@/utils/util';
import CreateOptionModal from '@/components/option/create-option-modal';
import QuestionOpton from '@/components/option/question-option';


interface SectionUpdateProps {
    section: Section;
    partIndex: number;
    globalIndex: number;
    sectionIndex: number;
}

export default function PartSection(
    { section, partIndex, globalIndex, sectionIndex }: SectionUpdateProps
) {
    const { t } = useTranslation();

    const [openAccordions, setOpenAccordions] = useState<Record<number, number | null>>({});

    const toggleAccordion = (partId: number, index: number) => {
        setOpenAccordions((prev) => ({
            ...prev,
            [partId]: prev[partId] === index ? null : index // agar ochiq bo‘lsa yopadi, bo‘lmasa ochadi
        }));
    };

    const [openDelete, setOpenDelete] = useState(false);

    const handleDeleteClick = () => {
        setOpenDelete(true); // Open the delete modal
    };

    const [openUpdate, setOpenUpdate] = useState(false);

    const handleUpdateClick = () => {
        setOpenUpdate(true); // Open the delete modal
    };

    const { delete: deleteFolder, reset, errors: deleteError, clearErrors } = useForm();

    const handleDelete = (id: number) => {
        deleteFolder(route('section.destroy', section.id), {
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
        <div key={section.id} className={'p-1'}>

            <div className="flex gap-2">
                {/* Update button */}
                <button
                    onClick={handleUpdateClick}
                    className={`${baseButton} bg-blue-500 text-white hover:text-black hover:bg-gray-100`}
                >
                    <Edit className="w-4 h-4" />
                </button>

                {/* Delete button */}
                <button
                    onClick={handleDeleteClick}
                    className={`${baseButton} bg-red-500 text-white hover:text-black hover:bg-gray-100`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>


            {/* Pass selected folder to the DeleteFolderModal */}
            {openUpdate && (
                <UpdateSectionModal
                    section={section}
                    open={openUpdate}  // Assuming you have a separate state for openDelete
                    setOpen={setOpenUpdate}  // Or you can manage this in its own state
                />
            )}


            {/* Pass selected folder to the DeleteFolderModal */}
            {openDelete && (
                <DeleteItemModal
                    item={section}
                    open={openDelete}  // Assuming you have a separate state for openDelete
                    setOpen={setOpenDelete}  // Or you can manage this in its own state
                    onDelete={handleDelete} // Handle deletion
                />
            )}


            <div
                onClick={() => toggleAccordion(partIndex, sectionIndex)} // ✅ har biriga alohida index
                className="flex items-center justify-between w-full py-4 px-3 font-medium text-gray-700 dark:text-gray-300"
            >
                   <span>
                       <div
                           className="prose dark:prose-invert text-base/8 max-w-full"
                           dangerouslySetInnerHTML={{ __html: cleanTinyMce(section.textarea) }}
                       />
                  </span>

                <svg
                    className={`w-3 h-3 shrink-0 transition-transform duration-300 ${
                        openAccordions[partIndex] === sectionIndex ? '' : 'rotate-180'
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5 5 1 1 5"
                    />
                </svg>
            </div>

            {openAccordions[partIndex] === sectionIndex && ( // ✅ faqat shu section ochiladi
                <div className="px-3 pb-4 text-sm text-gray-600 dark:text-gray-400">
                    {(section.question_type.type !== 'complete_section' && section.question_type.type !== 'drag_and_drop')
                        && (
                            <CreateQuestionModal section={section} />
                        )
                    }

                    {section.question_type.type === 'drag_and_drop' &&
                        (
                            <div className={'text-center bold text-2xl font-bold'}>{t('incorrect_options')}</div>
                        )
                    }


                    {/* Options */}
                    <div className="mt-3 space-y-2">
                        {section.options.map((option, oIndex) => {

                            return (
                                <QuestionOpton option={option}
                                               index={oIndex} />
                            );
                        })}
                    </div>

                    {(section.question_type.type === 'drag_and_drop')
                        && (
                            <CreateOptionModal section={section} />
                        )
                    }


                    <div className="space-y-6">
                        {section.questions.map((question, qIndex) => {

                                globalIndex += Number(question.is_correct_count);

                                return (
                                    <SectionQuestion key={qIndex}
                                                     globalIndex={globalIndex}
                                                     section={section}
                                                     question={question}
                                                     question_type={section.question_type}
                                                     index={qIndex} />
                                );
                            }
                        )}
                    </div>


                </div>
            )}
        </div>
    );
}
