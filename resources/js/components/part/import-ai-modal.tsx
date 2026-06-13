import { useForm } from '@inertiajs/react';
import React, { FormEventHandler, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Part } from '@/types';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { baseButton } from '@/components/ui/baseButton';

interface ImportAiModalProps {
    part: Part;
}

export default function ImportAiModal({ part }: ImportAiModalProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<{
        text: string;
        file: File | null;
    }>({
        text: '',
        file: null
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('part.import-ai', part.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('imported_successfully') || 'Imported successfully!');
            },
            onError: (err) => {
                const errorMessage = err?.error || t('import_failed') || 'Import failed';
                toast.error(errorMessage);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all py-1.5 px-3 rounded-lg text-xs self-center`}
                >
                    <Sparkles className="w-3.5 h-3.5" />
                    {t('ai_import') || 'AI Import'}
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-2xl w-full overflow-y-auto dark:border-gray-400">
                <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    {t('modal.ai_import_title') || 'Import Questions via AI'}
                </DialogTitle>
                <DialogDescription>
                    {t('modal.ai_import_desc') || 'Paste raw test text or upload a DOCX/TXT file. AI will automatically parse sections, question types, questions, options, and correct answers.'}
                </DialogDescription>

                <form onSubmit={submit} className="space-y-4 mt-2">
                    <div className="space-y-1">
                        <Label htmlFor="text">{t('paste_test_text') || 'Paste Test Text'}</Label>
                        <textarea
                            id="text"
                            value={data.text}
                            onChange={(e) => setData('text', e.target.value)}
                            placeholder={t('paste_test_placeholder') || 'Paste questions here...'}
                            className="w-full h-48 p-3 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <InputError message={errors.text} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="file">{t('upload_docx_or_txt') || 'Or Upload DOCX / TXT File'}</Label>
                        <input
                            type="file"
                            id="file"
                            accept=".docx,.txt"
                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-800 dark:file:text-gray-300"
                        />
                        <InputError message={errors.file} />
                    </div>

                    {errors.error && (
                        <div className="text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950 p-2.5 rounded">
                            {errors.error}
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
                            className="bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {processing ? (
                                <>
                                    <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span>
                                    {t('processing') || 'Processing AI...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    {t('import') || 'Import'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
