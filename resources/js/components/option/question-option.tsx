import React, { useState } from 'react';
import { Option, QuestionType } from '@/types';
import { CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import UpdateOptionModal from '@/components/option/update-option-modal';
import DeleteItemModal from '@/components/delete-item-modal';
import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface QuestionOptionProps {
    option: Option;
    index: number;
    question_type?: QuestionType;
}

export default function QuestionOption({ option, index, question_type }: QuestionOptionProps) {
    const { t } = useTranslation();
    const letter = String.fromCharCode(65 + index);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const { delete: deleteOption } = useForm();

    const handleDelete = () => {
        deleteOption(route('option.destroy', option.id), {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDelete(false);
                toast.success(t('deleted_successfully'));
            },
            onError: (err: any) => {
                const errorMessage = err?.error || t('delete_failed');
                toast.error(errorMessage);
            },
        });
    };

    return (
        <div className="group flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-5 h-5 rounded font-bold font-mono text-[11px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center shrink-0">
                    {letter}
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate text-xs">
                    {option.textarea}
                </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {Boolean(option.is_correct) && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('is_correct')}
                    </span>
                )}

                <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => setOpenEdit(true)}
                        className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        title={t('edit') || "Tahrirlash"}
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpenDelete(true)}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        title={t('delete') || "O'chirish"}
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {openEdit && (
                <UpdateOptionModal
                    option={option}
                    question_type={question_type}
                    open={openEdit}
                    setOpen={setOpenEdit}
                />
            )}

            {openDelete && (
                <DeleteItemModal
                    item={option}
                    open={openDelete}
                    setOpen={setOpenDelete}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
