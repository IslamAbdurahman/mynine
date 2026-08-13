import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '@/types';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Edit, TrashIcon, ChevronDown, ChevronUp } from 'lucide-react';
import DeleteItemModal from '@/components/delete-item-modal';
import CreateQuestionModal from '@/components/question/create-question-modal';
import SectionQuestion from '@/components/question/section-question';
import UpdateSectionModal from '@/components/section/update-section-modal';
import { cleanTinyMce } from '@/utils/util';
import CreateOptionModal from '@/components/option/create-option-modal';
import QuestionOpton from '@/components/option/question-option';

interface SectionUpdateProps {
    section: Section;
    partIndex: number;
    globalIndex: number;
    sectionIndex: number;
}

export default function PartSection({ section, partIndex, globalIndex, sectionIndex }: SectionUpdateProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);

    const { delete: deleteSection, reset, clearErrors } = useForm();

    const handleDelete = () => {
        deleteSection(route('section.destroy', section.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpenDelete(false);
                toast.success(t('deleted_successfully'));
            },
            onError: (err) => {
                const errorMessage = err?.error || t('delete_failed');
                toast.error(errorMessage);
            },
        });
    };

    const questionCount = section.questions?.length ?? 0;
    const questionRange = questionCount > 0
        ? `Q${globalIndex + 1}–${globalIndex + questionCount}`
        : t('no_questions') ?? 'No questions';

    const typeName = section.question_type?.name ?? section.question_type?.type ?? 'Section';

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">

            {/* Section Header */}
            <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Section info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-2 py-0.5 text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                            {typeName}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {questionRange} · {questionCount} {t('question') ?? 'questions'}
                        </span>
                    </div>
                    {section.textarea && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {section.textarea.replace(/<[^>]*>/g, '').trim().slice(0, 80)}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setOpenUpdate(true)}
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400 hover:text-blue-700 transition-colors"
                        title={t('edit') ?? 'Edit'}
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setOpenDelete(true)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-400 hover:text-red-600 transition-colors"
                        title={t('delete') ?? 'Delete'}
                    >
                        <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Chevron */}
                <div className="shrink-0 text-gray-400 dark:text-gray-500">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* Section Body */}
            {isOpen && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-3 bg-gray-50/50 dark:bg-gray-950/30">
                    {/* Section instruction text */}
                    {section.textarea && (
                        <div
                            className="prose dark:prose-invert text-sm max-w-full leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: cleanTinyMce(section.textarea) }}
                        />
                    )}

                    {/* Options (drag_and_drop) */}
                    {section.question_type?.type === 'drag_and_drop' && (
                        <>
                            <div className="text-center text-sm font-bold text-gray-600 dark:text-gray-400">
                                {t('incorrect_options')}
                            </div>
                            <div className="space-y-1.5">
                                {section.options?.map((option, oIndex) => (
                                    <QuestionOpton key={oIndex} option={option} index={oIndex} />
                                ))}
                            </div>
                            <CreateOptionModal section={section} />
                        </>
                    )}

                    {/* Questions */}
                    {section.questions?.length > 0 && (
                        <div className="space-y-4">
                            {section.questions.map((question, qIndex) => {
                                globalIndex += Number(question.is_correct_count);
                                return (
                                    <SectionQuestion
                                        key={qIndex}
                                        globalIndex={globalIndex}
                                        section={section}
                                        question={question}
                                        question_type={section.question_type}
                                        index={qIndex}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Add Question button */}
                    {section.question_type?.type !== 'complete_section' &&
                        section.question_type?.type !== 'drag_and_drop' && (
                            <div className="pt-1">
                                <CreateQuestionModal section={section} />
                            </div>
                        )}
                </div>
            )}

            {/* Modals */}
            {openUpdate && (
                <UpdateSectionModal section={section} open={openUpdate} setOpen={setOpenUpdate} />
            )}
            {openDelete && (
                <DeleteItemModal
                    item={section}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
