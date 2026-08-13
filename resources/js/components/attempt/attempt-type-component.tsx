import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AttemptPart, AttemptType } from '@/types';
import { CheckCircle, Minus } from 'lucide-react';
import AIEvaluationCard from '@/components/attempt/ai-evaluation-card';

const AttemptTypeComponent = ({ attempt_type }: { attempt_type: AttemptType }) => {
    const { t } = useTranslation();
    const [attemptParts, setAttemptParts] = useState<AttemptPart[]>([]);

    const getAttemptParts = () => {
        fetch(
            route('attempt-part.index', {
                attempt_id: attempt_type.attempt_id,
                type_id: attempt_type.type_id
            })
        )
            .then((res) => res.json())
            .then((res) => {
                setAttemptParts(res.data ?? res);
            })
            .catch((err) => console.error('getAttemptParts error:', err));
    };

    useEffect(() => {
        getAttemptParts();
    }, []);

    const totalScore = useMemo(() => {
        return attemptParts.reduce((partAcc, part) => {
            return partAcc + (part.part?.sections?.reduce((sectionAcc, section) => {
                return sectionAcc + (section.questions?.reduce((qAcc, question) => {
                    return qAcc + (question.attempt_answer?.score ?? 0);
                }, 0));
            }, 0) ?? 0);
        }, 0);
    }, [attemptParts]);

    const normalizeText = (text: string | undefined | null): string => {
        if (!text) return '';
        return text.trim().toLowerCase();
    };

    // ✅ Compute total score safely
    const sum_is_correct = useMemo(() => {
        let total = 0;

        attemptParts.forEach((attemptPart) => {
            attemptPart.part?.sections.forEach((section) => {
                section.questions.forEach((question) => {
                    if (question.options.length === 0) {
                        // Case-insensitive and space-insensitive comparison
                        if (
                            normalizeText(question.answer_text) ===
                            normalizeText(question.attempt_answer?.answer_text)
                        ) {
                            total += 1;
                        }
                    } else {
                        question.attempt_answer?.attempt_answer_options?.forEach((opt) => {
                            if (opt.option.is_correct == 1) {
                                total += 1;
                            }
                        });
                    }
                });
            });
        });

        return total;
    }, [attemptParts]);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="border-collapse w-full text-sm text-left text-gray-800 dark:text-gray-100">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {t('n')}
                        </td>

                        {/* ✅ Conditional extra columns */}
                        {attempt_type.type?.name === 'Writing' && (
                            <>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('question')}
                                </td>
                            </>
                        )}

                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                            {t('answer')}
                        </td>

                        {/* ✅ Conditional extra columns */}
                        {attempt_type.type?.name !== 'Writing' && (
                            <>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('correct')} <span> : </span>
                                    {attempt_type.type?.name === 'Writing' ?
                                        totalScore
                                        :
                                        sum_is_correct
                                    }
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('correct_answer')}
                                </td>
                            </>
                        )}

                        {/* ✅ Conditional extra columns */}
                        {attempt_type.type?.name === 'Writing' && (
                            <>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('review_note_ai')}
                                </td>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('score')} <span> : </span>
                                    {attempt_type.type?.name === 'Writing' ?
                                        totalScore
                                        :
                                        sum_is_correct
                                    }
                                </td>
                            </>
                        )}
                    </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800">
                    {attemptParts.map((attemptPart) => {
                            let order = Number(attemptPart.part?.order);

                            return (
                                attemptPart.part?.sections.map((section) =>
                                    section.questions.map((question, qIndex) => {
                                            const globalIndex = order += Number(question.is_correct_count ?? 1);

                                            return (
                                                <tr
                                                    key={`${question.id}-${qIndex}`}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        {(() => {
                                                            const count = question.is_correct_count ?? 1;
                                                            return count > 1
                                                                ? Array.from({ length: count }, (_, i) => globalIndex - count + 1 + i).join('-')
                                                                : globalIndex;
                                                        })()}
                                                    </td>

                                                    {attempt_type.type?.name === 'Writing' && (
                                                        <>
                                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                {question.textarea}
                                                            </td>
                                                        </>
                                                    )}

                                                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                        {question.attempt_answer?.answer_text && (
                                                            <div
                                                                className={'whitespace-pre-wrap'}>{question.attempt_answer.answer_text}</div>
                                                        )}
                                                        {question.attempt_answer?.attempt_answer_options?.map(
                                                            (opt, idx) => (
                                                                <div key={idx} className="ml-4">
                                                                    - {opt.option?.textarea}
                                                                </div>
                                                            )
                                                        )}
                                                    </td>


                                                    {/* ✅ Conditional extra columns */}
                                                    {attempt_type.type?.name !== 'Writing' && (
                                                        <>
                                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                {question.options.length === 0 ? (
                                                                    normalizeText(question.answer_text) === normalizeText(question.attempt_answer?.answer_text) ? (
                                                                        <CheckCircle className="text-green-600" />
                                                                    ) : (
                                                                        <Minus className="text-red-600" />
                                                                    )
                                                                ) : (
                                                                    question.attempt_answer?.attempt_answer_options?.map((opt, idx) => (
                                                                        <div key={idx}>
                                                                            {opt.option.is_correct === 1 ? (
                                                                                <CheckCircle
                                                                                    className="text-green-600" />
                                                                            ) : (
                                                                                <Minus className="text-red-600" />
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </td>

                                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                {question.options.length == 0 ? (
                                                                    <div>{question.answer_text}</div>
                                                                ) : (
                                                                    question.options
                                                                        .filter(item => item.is_correct === 1)
                                                                        .map((opt, idx) => (
                                                                            <div key={idx}>
                                                                                {opt.textarea}
                                                                            </div>
                                                                        ))
                                                                )}
                                                            </td>
                                                        </>
                                                    )}


                                                    {/* ✅ Conditional extra columns */}
                                                    {attempt_type.type?.name === 'Writing' && (
                                                        <>
                                                            <td className="border border-gray-300 dark:border-gray-600 p-2">
                                                                <AIEvaluationCard
                                                                    rawNote={question?.attempt_answer?.review_note_ai}
                                                                    score={question?.attempt_answer?.score}
                                                                    essayText={question?.attempt_answer?.answer_text}
                                                                />
                                                            </td>
                                                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-bold text-center">
                                                                {question?.attempt_answer?.score ?? '-'}
                                                            </td>
                                                        </>
                                                    )}


                                                </tr>
                                            );
                                        }
                                    )
                                )
                            );

                        }
                    )}

                    {/* ✅ total score row */}
                    <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                        <td
                            className="border border-gray-300 dark:border-gray-600 px-4 py-2"
                            colSpan={attempt_type.type?.name === 'Writing' ? 4 : 2}
                        >
                            {t('total_score')}
                        </td>
                        {attempt_type.type?.name === 'Writing' ?
                            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                {totalScore}
                            </td>
                            :
                            <>
                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {sum_is_correct}
                                </td>

                                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                    {t('correct_answer')}
                                </td>
                            </>
                        }
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
        ;
};

export default AttemptTypeComponent;
