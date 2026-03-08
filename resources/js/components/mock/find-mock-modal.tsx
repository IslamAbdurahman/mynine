import { FormDataConvertible } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { FormEventHandler, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoCreate } from 'react-icons/io5';
import { toast } from 'sonner';

// Internal Components
import InputError from '@/components/input-error';
import { baseButton } from '@/components/ui/baseButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ESLint-safe interface with index signature
interface MockFindForm {
    [key: string]: FormDataConvertible;
    slug: string;
}

export default function FindMockModal() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, get, processing, reset, errors, clearErrors } = useForm<MockFindForm>({
        slug: '',
    });

    /**
     * Handles modal visibility changes.
     * Resets form state when the modal is closed manually.
     */
    const handleOpenChange = useCallback(
        (state: boolean) => {
            setOpen(state);
            if (!state) {
                // Delay reset slightly to prevent layout shift during close animation
                setTimeout(() => {
                    reset();
                    clearErrors();
                }, 200);
            }
        },
        [reset, clearErrors],
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        get(route('home'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false); // Closes modal
                toast.success(t('success.found'));
            },
            onError: (err) => {
                nameInput.current?.focus();
                const errorMessage = err?.error || t('error.search_failed');
                toast.error(errorMessage);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} flex items-center justify-center gap-2 bg-indigo-600 px-5 py-2.5 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-600`}
                >
                    <IoCreate className="h-4 w-4" />
                    <span className="text-xs font-black tracking-widest uppercase">{t('common.exam')}</span>
                </button>
            </DialogTrigger>

            <DialogContent className="flex max-h-[90vh] w-full max-w-[550px] flex-col gap-0 overflow-hidden rounded-[2.5rem] border-none bg-white p-0 shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <header className="flex-none border-b border-slate-100 bg-slate-50/80 px-10 py-8 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {t('mock_table.title')}
                            </DialogTitle>
                        </div>
                    </div>
                </header>

                <form onSubmit={submit} className="flex flex-1 flex-col overflow-hidden">
                    {/* Body */}
                    <div className="flex-1 space-y-6 overflow-y-auto p-10">
                        <div className="space-y-3">
                            <Label htmlFor="slug-input" className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                                {t('common.code')}
                            </Label>
                            <Input
                                id="slug-input"
                                ref={nameInput}
                                placeholder={t('common.code')}
                                className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 px-6 font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                disabled={processing}
                            />
                            <InputError message={errors.slug} />
                        </div>
                    </div>

                    {/* Footer */}
                    <DialogFooter className="flex-none border-t border-slate-100 bg-slate-50/80 px-10 py-6 dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex w-full items-center justify-end gap-3">
                            <DialogClose asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-12 rounded-2xl px-8 font-bold text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    {t('common.cancel')}
                                </Button>
                            </DialogClose>

                            <Button
                                type="submit"
                                disabled={processing || !data.slug.trim()}
                                className="h-12 min-w-[160px] rounded-2xl bg-indigo-600 px-8 font-black text-white shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 dark:bg-indigo-500"
                            >
                                {processing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('common.processing')}
                                    </div>
                                ) : (
                                    t('common.search')
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
