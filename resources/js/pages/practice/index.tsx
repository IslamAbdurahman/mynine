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

export default function Practice() {
    const { attempt } = usePage<{ attempt: Attempt }>().props;
    const { t } = useTranslation();

    const [resAttempt, setResAttempt] = useState<Attempt | null>(null);
    const [testType, setTestType] = useState<TestType | null>(null);
    const [selectedPart, setSelectedPart] = useState<Part | null>(null);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);

    const getStatus = () => {

        // finishedAt comes from selectedPart only if Listening, else from resAttempt.attempt_types
        const finishedAt = resAttempt?.attempt_types.find((t) => t.type_id === testType?.type_id)?.finished_at ?? null;

        // Timer check

        const isTimeUp = finishedAt ? new Date(finishedAt).getTime() <= Date.now() : false;
        setIsTimeUp(isTimeUp);

        // Disable all buttons if a Listening part is selected and time is not up
        const isDisabled = !isTimeUp;

        setIsDisabled(isDisabled);

        console.log(isDisabled, isTimeUp);
    };

    const handleTestType = (test_type_id: number) => {
        fetch(route('practice-test-type', {
            test_type_id,
            attempt_id: attempt.id
        }))
            .then((res) => res.json())
            .then((res) => {
                setTestType(res.data ?? res);
                setSelectedPart(null);
            })
            .catch((err) => console.error('handleTestType error:', err));
    };

    const handlePart = (part_id: number) => {
        fetch(route('practice-part', {
            part_id,
            attempt_id: attempt.id
        }))
            .then((res) => res.json())
            .then((res) => {
                setSelectedPart(res.data ?? res);
            })
            .catch((err) => console.error('handlePart error:', err));
    };

    useEffect(() => {
        fetch(route('practice-attempt', attempt.id))
            .then((res) => res.json())
            .then((res) => {
                setResAttempt(res.data ?? res);
            })
            .catch((err) => console.error('fetch attempt error:', err));
        getStatus();
    }, [attempt.id, selectedPart]);

    if (!resAttempt) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>{t('loading') ?? 'Loading...'}</p>
            </div>
        );
    }

    let order = selectedPart?.order ?? 0;

    return (
        <div className="relative min-h-screen pt-16 pb-24">

            <Head title="Practice" />

            {/* Fixed (TOP) */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md p-2">
                <div className="flex flex-col sm:flex-row justify-around items-center">
                    {testType && (
                        <div className="flex flex-col sm:flex-row justify-around items-center">
                            <h2 className="text-xl font-bold mb-1">
                                {resAttempt.user?.name} <span> - </span>
                                <CountdownTimer

                                    finishedAt={resAttempt.attempt_types.find(
                                        (t) => t.type_id === selectedPart?.test_type.type_id
                                    )?.finished_at ?? null
                                    }

                                    onExpire={() => {
                                        console.log('⏰ Time is up! Submitting attempt...');
                                        getStatus();
                                    }}
                                />
                            </h2>
                        </div>
                    )}


                    {
                        (!isTimeUp &&
                            testType?.type?.name?.toLowerCase() === 'listening') &&
                        (() => {
                            const finishedAtValue = resAttempt?.attempt_types.find(
                                (t) => t.type_id === selectedPart?.test_type?.type_id
                            )?.finished_at ?? null;

                            if (!finishedAtValue) return null;

                            const finishedAtDate = new Date(finishedAtValue);

                            return finishedAtDate.getTime() > Date.now() && testType?.test?.audio_path ? (
                                <div className="flex justify-between gap-4">
                                    <AudioEqualizer
                                        src={`/${testType?.test?.audio_path}`}
                                        autoPlay
                                        endTime={finishedAtDate.toISOString()}
                                    />
                                </div>
                            ) : null;
                        })()
                    }

                    <AppearanceTabs className={''} label={false} />

                </div>


            </div>

            {!testType && (
                <div className="flex flex-col items-center justify-center h-[80vh] space-y-8">
                    <h1 className="text-3xl font-bold">{resAttempt.user?.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300">{t('select_test_type') ?? 'Choose a test module to begin your practice.'}</p>

                    <div className="grid grid-cols-2 gap-6 justify-center">
                        {resAttempt.test?.types?.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleTestType(item.id)}
                                className="w-40 h-28 flex flex-col items-center justify-center rounded-xl
               border border-red-500 dark:border-blue-500
               bg-gradient-to-br from-red-500 to-blue-500
               dark:from-blue-600 dark:to-red-600
               text-white font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3)]
               hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]
               hover:scale-105 transition-transform duration-200 ease-in-out"
                            >
                                <span className="text-base md:text-lg font-bold">{item.type?.name}</span>
                                <span className="text-xs md:text-sm flex items-center gap-2 mt-2 font-medium">
                                    <FaCirclePlay className="w-5 h-5 drop-shadow animate-pulse" aria-hidden="true" />
                                    {t('start')}
                                </span>
                            </button>

                        ))}
                    </div>
                </div>
            )}


            {selectedPart && (

                <div>

                    <div
                        className={`grid gap-4 p-6 mb-10
                            grid-cols-1
                            sm:h-[calc(100vh-100px)]
                            ${
                            selectedPart.test_type.type.name === 'Listening'
                                ? ''
                                : 'sm:grid-cols-2'
                        }`}
                    >
                        {/* Left side scroll */}

                        {selectedPart.test_type.type.name !== 'Listening' && (
                            <div className="overflow-y-auto border border-gray-200 rounded-lg p-4">
                                <PracticePart
                                    attempt={attempt}
                                    part={selectedPart} />
                            </div>
                        )}

                        {/* Right side scroll */}
                        {selectedPart.test_type.type.name !== 'Writing' && (

                            <div className="overflow-y-auto border border-gray-200 rounded-lg p-4">
                                <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">


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
                                            />
                                        );

                                        order = currentOrder + sectionSum;

                                        return acc;
                                    }, [])}


                                </div>
                            </div>

                        )}


                        {selectedPart.test_type.type.name === 'Writing' && (
                            <div className="overflow-y-auto border border-gray-200 rounded-lg p-4">
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


            {testType && !selectedPart && (
                <div className="flex flex-col items-center justify-center h-[80vh] space-y-8">
                    <h1 className="text-2xl font-bold">{testType.type?.name}</h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        {t('select_part') ?? 'Select a part to begin this module.'}
                    </p>

                    <div className="grid grid-cols-2 gap-6 justify-center">
                        {testType.parts?.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handlePart(item.id)}
                                className="w-40 h-28 flex flex-col items-center justify-center rounded-xl
               border border-red-500 dark:border-blue-500
               bg-gradient-to-br from-red-500 to-blue-500
               dark:from-blue-600 dark:to-red-600
               text-white font-semibold shadow-[0_4px_12px_rgba(0,0,0,0.3)]
               hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]
               hover:scale-105 transition-transform duration-200 ease-in-out"
                            >
                                {/* Gloss shine */}
                                <span
                                    className="absolute top-0 left-0 w-full h-1/3 bg-white/20 blur-md rounded-t-xl pointer-events-none"></span>

                                <span className="text-lg font-bold tracking-wide drop-shadow">
        {item.name}
    </span>
                                <span className="text-xs md:text-sm flex items-center gap-2 mt-2 font-medium">
                                    <FaCirclePlay className="w-5 h-5 drop-shadow animate-pulse" aria-hidden="true" />
                                    {t('start')}
                                </span>
                            </button>

                        ))}
                    </div>

                </div>
            )}


            {/* Fixed (BOTTOM) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-inner p-2">


                <div className="flex flex-col sm:flex-row justify-around items-center">

                    <div>
                        <PracticeNumberBar
                            part={selectedPart as Part}
                        />
                    </div>

                    <div className={'mt-1'}>
                        {(testType?.parts?.length ?? 0) > 0 && (
                            <div className="flex justify-center pb-2">
                                <div className="inline-flex rounded-md shadow-xs overflow-x-auto">
                                    {testType?.parts.map((item, index) => {

                                        return (
                                            <button
                                                key={item.id ?? index}
                                                onClick={() => handlePart(item.id)}
                                                className={`px-4 py-2 text-sm font-medium border border-gray-200
                        ${selectedPart?.id === item.id
                                                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                    : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'}
                        first:rounded-l-lg last:rounded-r-lg`}
                                            >
                                                {item.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}


                        {/* 🔥 Test type switcher */}

                        <div className="flex justify-center">
                            <div className="inline-flex rounded-md shadow-xs overflow-x-auto">

                                {resAttempt.test?.types?.map((item, index) => {


                                    const isCurrentType = testType?.id === item.id;

                                    // console.log(!!finishedAt);
                                    // console.log(isDisabled,finishedAt,isTimeUp);

                                    return (
                                        <button
                                            key={item.id ?? index}
                                            disabled={isDisabled}
                                            onClick={() => handleTestType(item.id)}
                                            className={`px-4 py-2 text-sm font-medium border border-gray-200
                ${isCurrentType
                                                ? 'bg-blue-600 text-white dark:bg-blue-500'
                                                : 'bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'}
                first:rounded-l-lg last:rounded-r-lg`}
                                        >
                                            {item.type?.name}
                                        </button>
                                    );
                                })}


                            </div>
                        </div>

                    </div>

                    <div className={'mt-1'}>

                        <button
                            className={'inline-block align-middle bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 border border-red-700 rounded float-right'}
                            onClick={() => {
                                if (confirm(t('confirm_submit') ?? 'Are you sure you want to submit your answers?')) {
                                    window.location.href = route('practice-attempt-submit', attempt.id);
                                }
                            }}
                        >
                            <CheckIcon className={'inline'} />

                            {t('submit') ?? 'Submit'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
