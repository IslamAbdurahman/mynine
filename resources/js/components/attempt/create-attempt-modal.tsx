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
import { Mock, Test } from '@/types';
import { baseButton } from '@/components/ui/baseButton';
import { FaCirclePlay } from 'react-icons/fa6';

interface AttemptUpdateProps {
    test: Test;
    mock?: Mock;
}

export default function CreateAttemptModal({ test, mock }: AttemptUpdateProps) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const { data, post, processing, reset, clearErrors } = useForm<{
        test_id: number,
        mock_id?: number
    }>({
        test_id: test.id,
        mock_id: mock?.id
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('attempt.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                setOpen(false);
                toast.success(t('created_successfully'));
            },
            onError: (err) => {
                const errorMessage = err?.error || t('create_failed');
                toast.error(errorMessage);
            }
        });
    };

    const handleCheckHeadset = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => {
                toast.success('✅ Headset working!');
            }).catch((err) => {
                console.error(err);
                toast.error('Unable to play test sound. Please check your headset.');
            });
        }
    };

    const handleStopSound = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            toast.info('🔇 Test sound stopped');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className={`${baseButton} bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700`}
                >
                    <FaCirclePlay className="w-4 h-4" aria-hidden="true" />
                    {t('start')}
                </button>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto dark:border-gray-400">
                <DialogTitle>Start : {test.name}</DialogTitle>
                <DialogDescription className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p>You are about to begin <strong>IELTS Academic CD Practice Test</strong>.</p>
                    <p>Test time will start as soon as you press <strong>Start</strong>.</p>
                    <p>Do not refresh or close the page during the test.</p>
                    <p>Good luck! 🍀</p>
                </DialogDescription>

                {/* Check headset buttons */}
                <div className="mt-4 flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCheckHeadset}>
                        🎧 Check Headset
                    </Button>
                    <Button type="button" variant="destructive" onClick={handleStopSound}>
                        🔇 Stop
                    </Button>
                    {/* Hidden audio tag */}
                    <audio ref={audioRef} src="/audio/test-sound.mp3" preload="auto" />
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    reset();
                                    clearErrors();
                                }}
                                className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                            >
                                {t('cancel')}
                            </Button>
                        </DialogClose>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                            {t('start')}
                        </Button>
                    </DialogFooter>

                </form>
            </DialogContent>
        </Dialog>
    );
}
