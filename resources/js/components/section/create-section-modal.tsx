import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useRef, useState } from 'react';
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
import { Plus } from 'lucide-react';
import { Part, QuestionType } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import TextareaEditor from '@/components/textarea-editor';
import QuestionTypeGuide from '@/components/question/question-type-guide';
import LiveGapDetector from '@/components/section/live-gap-detector';

interface SectionUpdateProps {
    part: Part;
    question_types: QuestionType[];
}

export default function CreateSectionModal({ part, question_types }: SectionUpdateProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        part_id: number;
        question_type_id: number | null;
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

    const selectedTypeObj = question_types.find(qt => qt.id === data.question_type_id);
    const isMatchingType = selectedTypeObj?.type === 'matching' || data.question_type_id === 6;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('section.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('created_successfully'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                const errorMessage = err?.error || t('create_failed');
                toast.error(errorMessage);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0">
                    <Plus className="w-4 h-4 shrink-0" />
                    {t('create')} {t('section')}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-4xl w-full overflow-y-auto dark:border-gray-700">
                <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {t('modal.create_title') || "Yangi bo'lim qo'shish"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                    {t('modal.create_description') || "Bo'lim yo'riqnomasi va savol turini belgilang."}
                </DialogDescription>

                <form onSubmit={submit} className="space-y-5 mt-2">

                    {/* Question Type Selection */}
                    <div className="space-y-1.5">
                        <Label htmlFor="question_type" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {t('question_type')} *
                        </Label>
                        <select
                            id="question_type"
                            value={data.question_type_id ?? ''}
                            onChange={(e) =>
                                setData('question_type_id', e.target.value ? Number(e.target.value) : null)
                            }
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-medium shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">{t('select') || '-- Savol turini tanlang --'}</option>
                            {question_types.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.question_type_id} />
                    </div>

                    {/* Dynamic Question Type Guide */}
                    {selectedTypeObj && (
                        <QuestionTypeGuide type={selectedTypeObj.type} />
                    )}

                    {/* Conditional fields for Matching (diapazon: A - F) */}
                    {isMatchingType && (
                        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                                Matching (Moslashtirish) Variantlar Diapazoni *
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="from_option" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Boshlanish harfi / soni (From)
                                    </Label>
                                    <Input
                                        id="from_option"
                                        placeholder="Masalan: A"
                                        value={data.from_option}
                                        required={true}
                                        onChange={(e) => setData('from_option', e.target.value.toUpperCase())}
                                        className="mt-1 font-mono font-bold uppercase"
                                    />
                                    <InputError message={errors.from_option} />
                                </div>
                                <div>
                                    <Label htmlFor="to_option" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Tugash harfi / soni (To)
                                    </Label>
                                    <Input
                                        id="to_option"
                                        placeholder="Masalan: F"
                                        value={data.to_option}
                                        required={true}
                                        onChange={(e) => setData('to_option', e.target.value.toUpperCase())}
                                        className="mt-1 font-mono font-bold uppercase"
                                    />
                                    <InputError message={errors.to_option} />
                                </div>
                            </div>
                            <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                                Har bir savol kiritishda foydalanuvchi tanlashi uchun harflar ro'yxati (masalan A, B, C, D, E, F) hosil bo'ladi.
                            </p>
                        </div>
                    )}

                    {/* Textarea Editor */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Bo'lim Yo'riqnomasi / Matni (Instructions) *
                            </Label>
                            {(selectedTypeObj?.type === 'complete_section' || selectedTypeObj?.type === 'drag_and_drop') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData("textarea", (data.textarea || '') + " { to'g'ri_javob } ");
                                    }}
                                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                >
                                    + &#123; &#125; Savol qavsi qo'shish
                                </button>
                            )}
                        </div>
                        <TextareaEditor
                            value={data.textarea}
                            onChange={(content) => setData("textarea", content)}
                            error={errors.textarea}
                        />
                    </div>

                    {/* Live Gap Detector for complete_section / drag_and_drop */}
                    {(selectedTypeObj?.type === 'complete_section' || selectedTypeObj?.type === 'drag_and_drop') && (
                        <LiveGapDetector textarea={data.textarea} />
                    )}

                    {/* Modal Footer */}
                    <DialogFooter className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-300 dark:border-gray-700"
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
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                        >
                            {t('save')}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}
