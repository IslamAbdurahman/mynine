import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, VolumeX, Headphones, CheckCircle2, Play, Square } from 'lucide-react';

interface SoundCheckModalProps {
    isOpen: boolean;
    onStart: () => void;
    testName?: string;
}

export default function SoundCheckModal({
    isOpen,
    onStart,
    testName = 'Listening',
}: SoundCheckModalProps) {
    const { t } = useTranslation();
    const [isPlayingSample, setIsPlayingSample] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const timerRef = useRef<number | null>(null);

    const stopTestTone = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        if (audioContextRef.current) {
            try {
                if (audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close();
                }
            } catch (e) {
                console.error('AudioContext close error:', e);
            }
            audioContextRef.current = null;
        }
        setIsPlayingSample(false);
    }, []);

    // Cleanup audio when component unmounts or modal closes
    useEffect(() => {
        return () => {
            stopTestTone();
        };
    }, [stopTestTone, isOpen]);

    if (!isOpen) return null;

    const playTestTone = () => {
        if (isPlayingSample) {
            stopTestTone();
            return;
        }

        try {
            stopTestTone();

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;

            // Master Gain Node for loud, crisp volume control (0.75)
            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
            masterGain.connect(ctx.destination);

            const now = ctx.currentTime;

            // Pleasant, clear 4-note IELTS announcement chime (F Major: F4 -> A4 -> C5 -> F5)
            const notes = [
                { freq: 349.23, start: 0.0,  duration: 0.45 }, // F4
                { freq: 440.00, start: 0.22, duration: 0.45 }, // A4
                { freq: 523.25, start: 0.44, duration: 0.50 }, // C5
                { freq: 698.46, start: 0.66, duration: 1.20 }, // F5 (sustained finish)
            ];

            notes.forEach(({ freq, start, duration }) => {
                const noteTime = now + start;

                // Primary Tone (Sine for pure warm sound)
                const oscPrimary = ctx.createOscillator();
                const gainPrimary = ctx.createGain();
                oscPrimary.type = 'sine';
                oscPrimary.frequency.setValueAtTime(freq, noteTime);

                // Attack & Decay Envelope
                gainPrimary.gain.setValueAtTime(0.0001, noteTime);
                gainPrimary.gain.linearRampToValueAtTime(0.4, noteTime + 0.03); // Fast attack
                gainPrimary.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration); // Smooth decay

                oscPrimary.connect(gainPrimary);
                gainPrimary.connect(masterGain);

                oscPrimary.start(noteTime);
                oscPrimary.stop(noteTime + duration);

                // Harmonic Tone (Triangle for clarity and warmth)
                const oscHarmonic = ctx.createOscillator();
                const gainHarmonic = ctx.createGain();
                oscHarmonic.type = 'triangle';
                oscHarmonic.frequency.setValueAtTime(freq * 2, noteTime); // Octave overtone

                gainHarmonic.gain.setValueAtTime(0.0001, noteTime);
                gainHarmonic.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
                gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration * 0.7);

                oscHarmonic.connect(gainHarmonic);
                gainHarmonic.connect(masterGain);

                oscHarmonic.start(noteTime);
                oscHarmonic.stop(noteTime + duration * 0.7);
            });

            setIsPlayingSample(true);

            // Auto-stop state and close AudioContext safely after tone finishes (2.0s)
            timerRef.current = window.setTimeout(() => {
                stopTestTone();
            }, 2000);
        } catch (e) {
            console.error('Audio test tone error:', e);
            setIsPlayingSample(false);
        }
    };

    const handleConfirm = () => {
        stopTestTone();
        onStart();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
                    <div className="mx-auto size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
                        <Headphones className="size-8 text-white animate-bounce" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                        {t('sound_check_title', 'Ovozni Tekshirish (Sound Check)')}
                    </h2>
                    <p className="text-blue-100 text-xs mt-1">
                        {testName} — Computer-Delivered IELTS Simulation
                    </p>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                    <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                        {t('sound_check_instructions', 'Listening boʻlimi boshlanganda audio avtomatik ijro etiladi va uni toʻxtatib boʻlmaydi. Iltimos, quloqchinlaringizni tekshiring va sinov ovozini eshitib koʻring.')}
                    </div>

                    {/* Sound Test Box */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-lg ${isPlayingSample ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                                {isPlayingSample ? <Volume2 className="size-5 animate-pulse" /> : <VolumeX className="size-5" />}
                            </div>
                            <div>
                                <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                    {t('audio_sample_test', 'Sinov ovozi')}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                    {isPlayingSample ? t('playing_sample', 'Ovoz yangramoqda...') : t('click_to_test', 'Tekshirish uchun bosing')}
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={playTestTone}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            {isPlayingSample ? <Square className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
                            <span>{isPlayingSample ? t('stop', 'Toʻxtatish') : t('play_tone', 'Eshitish')}</span>
                        </button>
                    </div>

                    {/* Warning Notice */}
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-2">
                        <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
                        <span>
                            {t('sound_check_warning', 'Test boshlangach, audio fayl bir marta toʻliq oʻynaladi. Brauzer ovozini 70-80% darajaga sozlab oling.')}
                        </span>
                    </div>

                    {/* Start Button */}
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <CheckCircle2 className="size-5" />
                        <span>{t('start_listening_now', 'Ovoz yaxshi, Testni boshlash')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
