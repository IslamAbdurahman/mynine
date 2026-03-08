import { useForm } from '@inertiajs/react';
import React, { FormEventHandler,  useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { IoCreate } from 'react-icons/io5';
import { Part, QuestionType } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { baseButton } from '@/components/ui/baseButton';
import TextareaEditor from '@/components/textarea-editor';


interface SectionUpdateProps {
    part: Part;
    question_types: QuestionType[];
}

export default function CreateSectionModal(
    { part, question_types }: SectionUpdateProps
) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        part_id: number;
        question_type_id: number | null; // ✅ number or null
        textarea: string;
        from_option: string;
        to_option: string;
    }>({
        part_id: part.id,
        question_type_id: null,
        textarea: '',
        from_option: '',
        to_option: ''
    });


    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('section.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // 🔒 CLOSE MODAL HERE
                toast.success(t('created_successfully'));
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
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700`}>
                    <IoCreate className="w-4 h-4" aria-hidden="true" />
                    {t('create')} {t('section')}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl w-full  overflow-y-auto dark:border-gray-400">

                <DialogTitle>{t('modal.create_title')}</DialogTitle>
                <DialogDescription>{t('modal.create_description')}</DialogDescription>

                <form onSubmit={submit} className="space-y-4">

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
                                id="question_type"
                                value={data.question_type_id ?? ''}
                                onChange={(e) =>
                                    setData('question_type_id', e.target.value ? Number(e.target.value) : null)
                                }
                                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">{t('select')}</option>
                                {question_types.map((type) => (
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
