import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
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
import { Auth, Test } from '@/types';

interface UpdateTestModalProps {
    test: Test;
    open: boolean;
    setOpen: (open: boolean) => void;
}


type TestForm = {
    name: string
    comment: string
    audio_path: File | null
    active: number
    open: number
}

export default function UpdateTestModal({ test, open, setOpen }: UpdateTestModalProps) {
    const { t } = useTranslation();
    const nameInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm<TestForm>({
        name: test.name,
        comment: test.comment,
        audio_path: null,
        active: test.active,
        open: test.open
    });


    const { auth } = usePage().props as unknown as { auth?: Auth };

    const isAdmin = auth?.user?.roles?.some(role => role.name === 'Admin');


    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('test.update', test.id), {
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
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                            id="name"
                            ref={nameInput}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="comment">{t('comment')}</Label>
                        <Input
                            id="comment"
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                        />
                        <InputError message={errors.comment} />
                    </div>

                    <div>
                        <Label htmlFor="audio_path">{t('audio_path')}</Label>
                        <Input
                            type="file"
                            id="audio_path"
                            accept="audio/*"
                            onChange={(e) => setData('audio_path', (e.target.files?.[0] as File) ?? null)}
                        />
                        <InputError message={errors.audio_path} />
                    </div>

                    <div>
                        <Label htmlFor="status" className="mb-3 block">
                            {t('status')}
                        </Label>
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="status"
                                className="sr-only peer"
                                checked={data.active === 1}
                                onChange={(e) => setData('active', e.target.checked ? 1 : 0)}
                            />
                            <div
                                className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        </label>
                        <InputError message={errors.active} />
                    </div>

                    {isAdmin && (

                        <div>
                            <Label htmlFor="open" className="mb-3 block">
                                {t('open')}
                            </Label>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="open"
                                    className="sr-only peer"
                                    checked={data.open === 1}
                                    onChange={(e) => setData('open', e.target.checked ? 1 : 0)}
                                />
                                <div
                                    className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            </label>
                            <InputError message={errors.open} />
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
