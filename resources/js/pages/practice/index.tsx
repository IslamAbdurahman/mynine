import { Head, usePage } from '@inertiajs/react';
import { Attempt, Part, Question, Section, TestType } from '@/types';
import { useTranslation } from 'react-i18next';
import React, { ReactElement, useEffect, useState } from 'react';
import PracticePart from '@/components/practice/practice-part';
import PracticeSection from '@/components/practice/practice-section';
import PracticeEssay from '@/components/practice/practice-essay';
import PracticeNumberBar from '@/components/practice/practice-number-bar';
import { CheckIcon } from 'lucide-react';
import { CountdownTimer } from '@/components/practice/countdown-timer';
import AppearanceTabs from '@/components/appearance-tabs';
import { FaCirclePlay } from 'react-icons/fa6';
import AudioEqualizer from '@/components/practice/audio-equalizer';
import LanguageBar from '@/components/language';

export default function Practice() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();

    const [resAttempt, setResAttempt] = useState<Attempt | null>(null);
    const [testType, setTestType] = useState<TestType | null>(null);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
    const [flaggedIds, setFlaggedIds] = useState<Set<number>>(new Set());
    const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const toggleFlag = (id: number) => {
        setFlaggedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getStatus = () => {

        // finishedAt comes from selectedPart only if Listening, else from resAttempt.attempt_types
        const finishedAt = resAttempt?.attempt_types.find((t) => t.type_id === testType?.type_id)?.finished_at ?? null;

        // Timer check
        const isTimeUp = finishedAt ? new Date(finishedAt).getTime() <= (Date.now() + serverTimeOffset) : false;
        setIsTimeUp(isTimeUp);

        // Disable all buttons if a Listening part is selected and time is not up
        const isDisabled = !isTimeUp;

        setIsDisabled(isDisabled);

        console.log(isDisabled, isTimeUp);
    };

    const handleTestType = (test_type_id: number, autoStart: boolean = false) => {
        setIsLoading(true);
        fetch(route('practice-test-type', {
            test_type_id,
            attempt_id: attempt.id
        }))
            .then((res) => res.json())
            .then((res) => {
                if (res.server_time) {
                    setServerTimeOffset(new Date(res.server_time).getTime() - Date.now());
                }
                const data = res.data ?? res;
                setTestType(data);

                // If autoStart is true and there are parts, automatically load the first part
                if (autoStart && data.parts && data.parts.length > 0) {
                    handlePart(data.parts[0].id);
                } else {
                    setSelectedPart(null);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                console.error('handleTestType error:', err);
                setIsLoading(false);
            });
    };

    const handlePart = (part_id: number) => {
        setIsLoading(true);
        fetch(route('practice-part', {
            part_id,
            attempt_id: attempt.id
        }))
            .then((res) => res.json())
            .then((res) => {
                if (res.server_time) {
                    setServerTimeOffset(new Date(res.server_time).getTime() - Date.now());
                }
                setSelectedPart(res.data ?? res);
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('handlePart error:', err);
                setIsLoading(false);
            });
    };

    const handleSubmitTestType = () => {
        if (!testType) return;
        if (confirm(t('confirm_finish_test_type') ?? `Finish ${testType.type?.name}?`)) {
            fetch(route('practice-test-type-submit', {
                attempt_id: attempt.id,
                type_id: testType.type_id
            }))
                .then((res) => res.json())
                .then((res) => {
                    if (res.success) {
                        setTestType(null);
                        setSelectedPart(null);
                        // Refresh attempt data
                        fetch(route('practice-attempt', attempt.id))
                            .then((res) => res.json())
                            .then((res) => {
                                if (res.server_time) {
                                    setServerTimeOffset(new Date(res.server_time).getTime() - Date.now());
                                }
                                setResAttempt(res.data ?? res);
                            });
                    }
                })
                .catch((err) => console.error('handleSubmitTestType error:', err));
        }
    };

    useEffect(() => {
        fetch(route('practice-attempt', attempt.id))
            .then((res) => res.json())
            .then((res) => {
                if (res.server_time) {
                    setServerTimeOffset(new Date(res.server_time).getTime() - Date.now());
                }
                setResAttempt(res.data ?? res);
            })
            .catch((err) => console.error('fetch attempt error:', err));
        getStatus();
    }, [attempt.id, selectedPart]);

    if (!resAttempt) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-gray-950">
                <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium animate-pulse uppercase tracking-widest">{t('loading') ?? 'Loading...'}</p>
            </div>
        );
    }

    let order = selectedPart?.order ?? 0;

    return (
        <div className="relative h-screen overflow-hidden bg-[#e5e7eb] dark:bg-gray-900 flex flex-col font-sans text-gray-900 dark:text-gray-100">

            <Head title="IELTS Practice" />

            {/* Header (Always Visible) */}
            <div className="flex-none h-14 bg-black/80 backdrop-blur-md text-white flex justify-between items-center px-6 shadow-md z-50">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold italic tracking-wider text-white">IELTS</span>
                    {testType && (
                        <span className="text-sm font-semibold border-l pl-4 border-gray-600">
                            {testType.type?.name}
                        </span>
                    )}
                </div>

                {testType && (
                    <div className="flex items-center">
                        <div className="flex flex-col items-center text-xl font-bold font-mono tracking-widest text-red-500 bg-black/50 px-3 py-1 rounded">
                            <CountdownTimer
                                finishedAt={resAttempt.attempt_types.find(
                                    (t) => t.type_id === (selectedPart?.test_type?.type_id ?? testType.type_id)
                                )?.finished_at ?? null}
                                serverTimeOffset={serverTimeOffset}
                                onExpire={() => {
                                    console.log('⏰ Time is up! Returning to menu...');
                                    setIsTimeUp(true);
                                    setTestType(null);
                                    setSelectedPart(null);
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-row items-center gap-6">
                    <div className="absolute top-0 right-0 p-3 lg:right-24 flex flex-row items-center gap-4">
                        
                    {testType && testType.type?.name?.toLowerCase() === 'listening' && !isTimeUp && (() => {
                        const finishedAtValue = resAttempt?.attempt_types.find(
                            (t) => t.type_id === selectedPart?.test_type?.type_id
                        )?.finished_at ?? null;
                        if (!finishedAtValue) return null;
                        const finishedAtDate = new Date(finishedAtValue);
                        return finishedAtDate.getTime() > (Date.now() + serverTimeOffset) && testType?.test?.audio_path ? (
                            <AudioEqualizer
                                src={`/${testType?.test?.audio_path}`}
                                autoPlay
                                endTime={finishedAtDate.toISOString()}
                            />
                        ) : null;
                    })()}

                        <span className="text-sm font-medium">{resAttempt.user?.name}</span>
                        <LanguageBar variant="dark" />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
                {isLoading ? (
                    <div className="absolute inset-0 z-40 flex flex-col justify-center items-center bg-[#e5e7eb]/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <div className="w-10 h-10 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-sm font-bold animate-pulse uppercase tracking-[0.2em]">{t('loading') ?? 'Loading...'}</p>
                    </div>
                ) : null}

                {!testType && (
                <div className="flex flex-col items-center justify-center h-full flex-1 w-full bg-[#e5e7eb] dark:bg-gray-900 px-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-8 md:p-10 max-w-3xl w-full border border-gray-300 dark:border-gray-700 shadow-md text-gray-900 dark:text-gray-100">
                        <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">{t('ielts_practice_test')}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-md">{t('confirm_details')}</p>
                        </div>

                        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-3">
                                <span className="font-semibold text-gray-600 dark:text-gray-400 col-span-1">{t('candidate_name')}</span>
                                <span className="sm:col-span-2 font-medium">{resAttempt.user?.name}</span>
                                <span className="font-semibold text-gray-600 dark:text-gray-400 col-span-1">{t('test_title')}</span>
                                <span className="sm:col-span-2 font-medium">{resAttempt.test?.name || t('academic_general')}</span>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4">{t('select_test_type') ?? 'Available Modules'}</h2>
                        <div className="flex flex-col gap-3">
                            {(() => {
                                const activeTypeId = resAttempt.test?.types?.find(item => {
                                    const at = resAttempt?.attempt_types?.find(a => a.type_id === item.type_id);
                                    return at && (!at.finished_at || new Date(at.finished_at).getTime() > (Date.now() + serverTimeOffset));
                                })?.type_id;

                                return resAttempt.test?.types?.map((item) => {
                                    const at = resAttempt?.attempt_types?.find(a => a.type_id === item.type_id);
                                    const finishedAt = at?.finished_at;
                                    const isExpired = finishedAt ? new Date(finishedAt).getTime() <= (Date.now() + serverTimeOffset) : false;
                                    const isLocked = !!(activeTypeId && activeTypeId !== item.type_id && !isExpired);

                                    return (
                                        <button
                                            key={item.id}
                                            disabled={isExpired || isLocked}
                                            onClick={() => handleTestType(item.id, true)}
                                            className={`flex justify-between items-center w-full p-4 border transition-colors text-left group ${isExpired || isLocked
                                                ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60 cursor-not-allowed'
                                                : 'border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-lg font-bold">{item.type?.name}</span>
                                                {isExpired && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-0.5">{t('test_finished')}</span>}
                                                {isLocked && <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">{t('locked_active_test')}</span>}
                                            </div>

                                            {!(isExpired || isLocked) && (
                                                <span className="px-6 py-2 bg-black dark:bg-gray-700 group-hover:bg-gray-800 dark:group-hover:bg-gray-600 text-white font-semibold rounded-[2px] transition-colors uppercase tracking-wide text-sm flex items-center gap-2 pointer-events-none">
                                                    {at ? (t('continue') ?? 'Davom etish') : (t('start') ?? 'Start')} <span>➔</span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>

                        {/* Complete Test Submission Button (Shown when all tests are done) */}
                        {(() => {
                            const allFinished = resAttempt.test?.types?.every(item => {
                                const at = resAttempt?.attempt_types?.find(a => a.type_id === item.type_id);
                                return at?.finished_at ? new Date(at.finished_at).getTime() <= (Date.now() + serverTimeOffset) : false;
                            });

                            if (allFinished) {
                                return (
                                    <div className="mt-8 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <button
                                            className="bg-black dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 font-bold py-3 px-8 rounded transition-colors uppercase tracking-wide text-lg flex items-center gap-2"
                                            onClick={() => {
                                                if (confirm(t('confirm_submit_test'))) {
                                                    window.location.href = route('practice-attempt-submit', attempt.id);
                                                }
                                            }}
                                        >
                                            {t('submit_test')} <CheckIcon className="w-6 h-6 ml-2 text-green-500" />
                                        </button>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </div>
            )}


            {selectedPart && (
                <div className="flex-1 overflow-hidden">
                    <div
                        className={`h-full flex flex-col sm:flex-row bg-white dark:bg-gray-900 ${selectedPart.test_type.type.name === 'Listening'
                            ? 'justify-center items-start'
                            : ''
                            }`}
                    >
                        {/* Left side scroll */}
                        {selectedPart.test_type.type.name !== 'Listening' && (
                            <div className="flex-1 h-full overflow-y-auto w-full sm:w-1/2 p-6 border-r-2 border-gray-300 dark:border-gray-700">
                                <PracticePart
                                    attempt={attempt}
                                    part={selectedPart} />
                            </div>
                        )}

                        {/* Right side scroll */}
                        {selectedPart.test_type.type.name !== 'Writing' && (
                            <div className="flex-1 h-full overflow-y-auto w-full sm:w-1/2 p-6 bg-gray-50 dark:bg-gray-900">
                                <div className="max-w-3xl mx-auto">
                                    {selectedPart?.sections?.reduce((acc: ReactElement[], section: Section, sectionIndex: number) => {
                                        const sectionSum = section.questions.reduce(
                                            (sum: number, q: Question) => sum + Number(q.is_correct_count ?? 1),
                                            0
                                        );

                                        const currentOrder = Number(order);

                                        acc.push(
                                            <PracticeSection
                                                key={section.id}
                                                order={currentOrder}
                                                section={section}
                                                attempt={attempt}
                                                partIndex={sectionIndex}
                                                sectionIndex={sectionIndex}
                                                setSelectedPart={setSelectedPart}
                                                flaggedIds={flaggedIds}
                                                toggleFlag={toggleFlag}
                                            />
                                        );

                                        order = currentOrder + sectionSum;

                                        return acc;
                                    }, [])}
                                </div>
                            </div>
                        )}

                        {selectedPart.test_type.type.name === 'Writing' && (
                            <div className="flex-1 h-full overflow-y-auto w-full sm:w-1/2 p-6 bg-gray-50 dark:bg-gray-900">
                                <PracticeEssay
                                    order={order}
                                    part={selectedPart}
                                    attempt={attempt}
                                />
                            </div>
                        )}

                    </div>
                </div>
            )}


            {testType && !selectedPart && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full flex-1 w-full bg-[#e5e7eb] dark:bg-gray-900 px-4 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-8 md:p-10 max-w-3xl w-full border border-gray-300 dark:border-gray-700 shadow-md text-gray-900 dark:text-gray-100">
                        <div className="border-b-2 border-gray-200 dark:border-gray-700 pb-4 mb-6">
                            <h1 className="text-3xl font-bold tracking-tight">{testType.type?.name}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 text-md">Please ensure your sound is working (if applicable) and select a component.</p>
                        </div>

                        <h2 className="text-xl font-bold mb-4">{t('select_part') ?? 'Select a Part'}</h2>
                        <div className="flex flex-col gap-3">
                            {testType.parts?.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handlePart(item.id)}
                                    className="flex justify-between items-center w-full p-4 border border-gray-400 dark:border-gray-600 hover:border-black dark:hover:border-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group"
                                >
                                    <span className="text-lg font-bold">{item.name}</span>
                                    <span className="px-6 py-2 bg-black dark:bg-gray-700 group-hover:bg-gray-800 dark:group-hover:bg-gray-600 text-white font-semibold rounded-[2px] transition-colors uppercase tracking-wide text-sm flex items-center gap-2">
                                        {t('start')} <span>➔</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            </div>

            {/* Bottom Bar (Always Visible) */}
            <div className="flex-none bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-t-2 border-gray-300 dark:border-gray-800 px-4 py-2 flex flex-col sm:flex-row justify-between items-center h-auto sm:h-20 shrink-0 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] text-gray-900 dark:text-gray-100">

                <div className="flex-1 flex overflow-x-auto pb-2 sm:pb-0 items-center hide-scrollbar">
                    <PracticeNumberBar
                        part={selectedPart as Part}
                        flaggedIds={flaggedIds}
                    />
                </div>

                <div className="flex items-center gap-4">
                    {selectedPart && (
                        <>
                            {/* Previous button */}
                            <button
                                className="bg-black dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors flex items-center gap-1 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!testType || !selectedPart || (testType.parts?.findIndex(p => p.id === selectedPart.id) ?? -1) <= 0}
                                onClick={() => {
                                    if (!testType || !selectedPart) return;
                                    const currentIndex = testType.parts?.findIndex(p => p.id === selectedPart.id) ?? -1;
                                    if (currentIndex > 0 && testType.parts) {
                                        handlePart(testType.parts[currentIndex - 1].id);
                                    }
                                }}
                            >
                                ⬅ {t('prev') ?? 'Prev'}
                            </button>

                            {/* Next button */}
                            <button
                                className="bg-black dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded transition-colors flex items-center gap-1 uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!testType || !selectedPart || (testType.parts?.findIndex(p => p.id === selectedPart.id) ?? -1) >= (testType.parts?.length ?? 0) - 1}
                                onClick={() => {
                                    if (!testType || !selectedPart) return;
                                    const currentIndex = testType.parts?.findIndex(p => p.id === selectedPart.id) ?? -1;
                                    if (currentIndex !== -1 && testType.parts && currentIndex < testType.parts.length - 1) {
                                        handlePart(testType.parts[currentIndex + 1].id);
                                    }
                                }}
                            >
                                {t('next') ?? 'Next'} ➔
                            </button>
                        </>
                    )}

                    {testType && (
                        <button
                            onClick={handleSubmitTestType}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition-colors flex items-center gap-2 uppercase tracking-wide"
                        >
                            {t('finish')} <CheckIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
