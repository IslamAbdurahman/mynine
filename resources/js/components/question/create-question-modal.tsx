import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useEffect, useRef, useState } from 'react';
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
import { Section } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { buildRange } from '@/utils/rangeHelpers';
import { baseButton } from '@/components/ui/baseButton';
import { Plus } from 'lucide-react'; // ✅ assuming you have shadcn/ui Checkbox


interface SectionUpdateProps {
    section: Section;
}

export default function CreateQuestionModal(
    { section }: SectionUpdateProps
) {

    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [showSmartPaste, setShowSmartPaste] = useState(false);
    const [smartPasteText, setSmartPasteText] = useState('');

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        section_id: number;
        textarea: string;
        answer_text: string;
        options: { textarea: string; is_correct: boolean }[];
    }>({
        section_id: section.id,
        textarea: '',
        answer_text: '',
        options: []
    });

    // Add new option
    const addOption = () => {
        setData('options', [...data.options, { textarea: '', is_correct: false }]);
    };

    // Remove option
    const removeOption = (index: number) => {
        const updated = data.options.filter((_, i) => i !== index);
        setData('options', updated);
    };

    // Handle option update
    const updateOption = (index: number, field: 'textarea' | 'is_correct', value: any) => {
        const updated = [...data.options];
        (updated[index] as any)[field] = value;
        setData('options', updated);
    };

    const handleSmartPaste = () => {
        if (!smartPasteText.trim()) return;
        const lines = smartPasteText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
        const parsedOptions = lines.map(line => {
            let cleanedText = line.replace(/^[A-Z0-9][-.)\s]+/i, '').trim();
            const isCorrect = line.includes('*') || line.toLowerCase().includes('(correct)');
            cleanedText = cleanedText.replace(/\*$/, '').replace(/\(correct\)$/i, '').trim();
            return { textarea: cleanedText, is_correct: isCorrect };
        });
        setData('options', [...data.options, ...parsedOptions]);
        setSmartPasteText('');
        setShowSmartPaste(false);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('question.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false); // close modal
                toast.success(t('created_successfully'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                const errorMessage = err?.error || t('create_failed');
                toast.error(errorMessage);
            }
        });
    };

    useEffect(() => {
        if (!open) return; // only when modal is open

        if (section.question_type.type === 'true_false') {
            setData('options', [
                { textarea: 'True', is_correct: false },
                { textarea: 'False', is_correct: false },
                { textarea: 'Not Given', is_correct: false }
            ]);
        } else if (section.question_type.type === 'yes_no') {
            setData('options', [
                { textarea: 'Yes', is_correct: false },
                { textarea: 'No', is_correct: false },
                { textarea: 'Not Given', is_correct: false }
            ]);
        }
    }, [open, section.question_type.type]);


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700`}
                >
                    <IoCreate className="w-4 h-4" />
                    {t('create')} {t('question')}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-5xl w-full overflow-y-auto dark:border-gray-400">
                <DialogTitle>{t('modal.create_title')}</DialogTitle>
                <DialogDescription>{t('modal.create_description')}</DialogDescription>

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

                    {(
                        section.question_type.type === 'true_false' ||
                        section.question_type.type === 'yes_no' ||
                        section.question_type.type === 'multiple_choice' ||
                        section.question_type.type === 'multiple_response'
                    ) && (

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>{t('options')}</Label>
                                {(section.question_type.type === 'multiple_choice' ||
                                    section.question_type.type === 'multiple_response') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowSmartPaste(!showSmartPaste)}
                                        className="text-xs py-1 px-2 border border-gray-300 dark:border-gray-600 rounded"
                                    >
                                        {showSmartPaste ? t('hide_smart_paste') || 'Hide Smart Paste' : t('smart_paste') || 'Smart Paste'}
                                    </Button>
                                )}
                            </div>

                            {showSmartPaste && (
                                <div className="p-3 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-950 space-y-2">
                                    <Label className="text-xs text-gray-500 block mb-1">
                                        {t('smart_paste_desc') || 'Paste options here (one per line). Mark correct option with asterisk (*) at the end.'}
                                    </Label>
                                    <textarea
                                        placeholder={"A) Option A\nB) Option B*\nC) Option C\nD) Option D"}
                                        value={smartPasteText}
                                        onChange={(e) => setSmartPasteText(e.target.value)}
                                        className="w-full h-24 p-2 text-xs border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleSmartPaste}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 rounded"
                                    >
                                        {t('apply_paste') || 'Apply Paste'}
                                    </Button>
                                </div>
                            )}

                            {data.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={t('option_text')}
                                        value={option.textarea}
                                        onChange={(e) => updateOption(index, 'textarea', e.target.value)}
                                        disabled={section.question_type.type === 'true_false' || section.question_type.type === 'yes_no'}
                                    />

                                    <div className="flex items-center gap-1">
                                        <Checkbox
                                            checked={option.is_correct}
                                            onCheckedChange={(checked) =>
                                                updateOption(index, 'is_correct', checked === true)
                                            }
                                        />
                                        <span>{t('correct')}</span>
                                    </div>

                                    {(section.question_type.type === 'multiple_choice' ||
                                        section.question_type.type === 'multiple_response') && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeOption(index)}
                                        >
                                            {t('remove')}
                                        </Button>
                                    )}
                                </div>
                            ))}


                            {(section.question_type.type === 'multiple_choice' ||
                                section.question_type.type === 'multiple_response') && (
                                <div>
                                    <Button
                                        type="button"
                                        onClick={addOption}
                                        className="bg-blue-600 text-white hover:bg-blue-700
                        dark:bg-blue-500 dark:hover:bg-blue-600
                        disabled:opacity-50"
                                    >
                                        <Plus /> {t('add_option')}
                                    </Button>
                                </div>
                            )}


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
