import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { QuestionType, Section } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TextareaEditor from '@/components/textarea-editor';

interface UpdateSectionModalProps {
    section: Section;
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function UpdateSectionModal({ section, open, setOpen }: UpdateSectionModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        textarea: section.textarea,
        question_type_id: section.question_type_id,
        from_option: section.from_option,
        to_option: section.to_option
    });

    useEffect(() => {
        fetch(route('question-type.index'))
            .then((res) => res.json())
            .then((res) => {
                setQuestionTypes(res.data ?? res);
            })
            .catch((err) => console.error(err));

        setData({
            textarea: section.textarea,
            question_type_id: section.question_type_id,
            from_option: section.from_option,
            to_option: section.to_option
        });
    }, [section.id]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('section.update', section.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('updated_successfully'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                // Display a friendly error message if available
                const errorMessage = err?.error || t('create_failed'); // Use fallback error message
                toast.error(errorMessage); // Display error message
            }
        });

    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>

            <DialogContent className="sm:max-w-5xl w-full overflow-y-auto dark:border-gray-700">
                <DialogHeader className="space-y-1 pb-2 border-b border-gray-100 dark:border-gray-800">
                    <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {t('modal.update_title') || "Bo'limni tahrirlash"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                        {t('modal.update_description') || "Bo'lim ma'lumotlarini va savol turini yangilang."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4 mt-2">

                    <div>
                        <TextareaEditor
                            value={data.textarea}
                            onChange={(content) => setData("textarea", content)}
                            error={errors.textarea}
                        />
                    </div>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-9">

                        {/* Question Type */}
                        <div className="sm:col-span-3">
                            <Label htmlFor="question_type">{t('question_type')}</Label>
                            <select
                                value={data.question_type_id ?? ''}
                                onChange={(e) => setData('question_type_id', Number(e.target.value) || 0)}
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">{t('select')}</option>
                                {questionTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>

                            <InputError message={errors.question_type_id} />
                        </div>

                        {/* Conditional fields */}
                        {data.question_type_id === 6 && (
                            <>
                                <div className="sm:col-span-3">
                                    <Label htmlFor="from_option">{t('from_option')}</Label>
                                    <Input
                                        id="from_option"
                                        value={data.from_option}
                                        required={true}
                                        onChange={(e) => setData('from_option', e.target.value)}
                                    />
                                    <InputError message={errors.from_option} />
                                </div>

                                <div className="sm:col-span-3">
                                    <Label htmlFor="to_option">{t('to_option')}</Label>
                                    <Input
                                        id="to_option"
                                        value={data.to_option}
                                        required={true}
                                        onChange={(e) => setData('to_option', e.target.value)}
                                    />
                                    <InputError message={errors.to_option} />
                                </div>
                            </>
                        )}


                    </div>


                    <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                    setOpen(false);
                                }}
                            >
                                {t('cancel')}
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
                        >
                            {t('save')}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>

    );
}
