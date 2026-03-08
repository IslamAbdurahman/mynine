import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle
} from '@/components/ui/dialog';
import { Question, Section } from '@/types';
import { buildRange } from '@/utils/rangeHelpers';

interface UpdateQuestionModalProps {
    question: Question
    section: Section
    open: boolean;
    setOpen: (open: boolean) => void;
}

export default function UpdateQuestionModal({ question,section, open, setOpen }: UpdateQuestionModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        textarea: question.textarea,
        answer_text: question.answer_text,
    });

    useEffect(() => {
        setData({
            textarea: question.textarea,
            answer_text: question.answer_text,
        });
    }, [question, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('question.update', question.id), {
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

            <DialogContent className="dark:border-gray-400">
                <DialogDescription>
                    <DialogTitle>{t('modal.update_title')}</DialogTitle>
                    <DialogDescription>{t('modal.update_description')}</DialogDescription>
                </DialogDescription>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <Label htmlFor="textarea">{t('textarea')}</Label>
                        <Input
                            id="textarea"
                            ref={nameInput}
                            value={data.textarea}
                            onChange={(e) => setData('textarea', e.target.value)}
                        />
                        <InputError message={errors.textarea} />
                    </div>

                    {section.question_type.type === 'fill_blank' && (
                        <div>
                            <Label htmlFor="answer_text">{t('answer_text')}</Label>
                            <Input
                                id="answer_text"
                                value={data.answer_text}
                                onChange={(e) => setData('answer_text', e.target.value)}
                            />
                            <InputError message={errors.answer_text} />
                        </div>
                    )}

                    {section.question_type.type === 'matching' && (
                        <div className="sm:col-span-3">
                            <Label htmlFor="answer_text">{t('answer_text')}</Label>
                            <select
                                id="answer_text"
                                value={data.answer_text ?? ''}
                                onChange={(e) => setData('answer_text', e.target.value)}
                                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">{t('select')}</option>
                                {buildRange(section.from_option, section.to_option).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <InputError message={errors.answer_text} />
                        </div>
                    )}

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
