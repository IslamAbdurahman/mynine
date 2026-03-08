import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Attempt, Part, Question, Section } from '@/types';
import PracticeOption from '@/components/practice/practice-option';
import { debounce } from 'lodash';
import { buildRange } from '@/utils/rangeHelpers';
import { toast } from 'sonner';

interface SectionUpdateProps {
    order: number;
    attempt: Attempt;
    question: Question;
    section: Section;
    index: number;
    setSelectedPart: (part: Part | null) => void;
}

export default function PracticeQuestion({
                                             order,
                                             attempt,
                                             question,
                                             section,
                                             index,
                                             setSelectedPart
                                         }: SectionUpdateProps) {
    const { t } = useTranslation();

    const [answer_text, setAnswerText] = useState<string | undefined>(
        question.attempt_answer?.answer_text
    );

    const [matchingAnswer, setMatchingAnswer] = useState<string>(
        question.attempt_answer?.answer_text ?? ''
    );

    const renderWithBlanks = (text: string) => {
        const parts = text.split(/\{\}/g);
        return parts.map((part, i) => (
            <React.Fragment key={i}>
                {part}
                {i < parts.length - 1 && (
                    <input
                        type="text"
                        className="inline w-40 rounded-md border border-blue-500 px-3 py-1.5 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        value={answer_text ?? (question.attempt_answer?.answer_text || '')}
                        onChange={(e) => handleChange(question.id, e.target.value)}
                    />
                )}
            </React.Fragment>
        ));
    };

    // 🚀 Debounced save (fetch bilan)
    const debouncedSave = useCallback(
        debounce(async (qId: number, value: string) => {
            try {
                const response = await fetch(route('attempt-answer.store', {
                    part_id: section.part_id,
                    attempt_id: attempt.id
                }), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                    },
                    body: JSON.stringify({
                        question_id: qId,
                        answer_text: value
                    })
                });

                const data = await response.json();

                if (!response.ok) throw new Error(data.error);

                // 🟢 Lokal holatni yangilash
                setSelectedPart((prev: Part | null) => {
                    if (!prev) return null;

                    const updatedSections = prev.sections.map((s) => {
                        if (s.id !== question.section_id) return s;

                        return {
                            ...s,
                            questions: s.questions.map((q) => {
                                if (q.id !== qId) return q;

                                if (value.trim() === '') {
                                    return { ...q, attempt_answer: null };
                                }

                                return {
                                    ...q,
                                    attempt_answer: {
                                        ...(q.attempt_answer ?? { id: Date.now(), question_id: qId }),
                                        answer_text: value,
                                        attempt_answer_options: q.attempt_answer?.attempt_answer_options ?? []
                                    }
                                };
                            })
                        };
                    });

                    return { ...prev, sections: updatedSections };
                });
            } catch (error) { const message =
                error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                        ? error
                        : 'Xatolik yuz berdi';

                toast.error(message);
            }
        }, 700), // ⏱ biroz kechikish — uzun o‘chirish uchun
        []
    );

    const handleChange = (qId: number, value: string) => {
        setAnswerText(value);
        debouncedSave(qId, value);
    };

    const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>(
        question.attempt_answer?.attempt_answer_options?.map((a) => a.option_id) ?? []
    );

    // 🚀 Option toggle (fetch bilan)
    const toggleOption = async (optionId: number) => {
        setSelectedOptionIds((prev) => {
            let updated: number[];

            if (section.question_type.type === 'multiple_response') {
                if (prev.includes(optionId)) {
                    updated = prev.filter((id) => id !== optionId);
                } else {
                    if (prev.length >= (question.is_correct_count ?? Infinity)) return prev;
                    updated = [...prev, optionId];
                }
            } else {
                updated = [optionId];
            }

            // 🔄 Backendga yuborish
            fetch(route('attempt-answer.store', {
                part_id: section.part_id,
                attempt_id: attempt.id
            }), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content
                },
                body: JSON.stringify({
                    question_id: question.id,
                    options: updated
                })
            })
                .then(async (response) => {
                    const data = await response.json(); // ✅ await the JSON
                    if (!data.success) throw new Error(data?.error || 'Yuborishda xatolik');
                    return data; // ✅ pass parsed data to next .then()
                })
                .then(() => {

                    setSelectedPart((prev: Part | null) => {
                        if (!prev) return null;

                        const updatedSections = prev.sections.map((s) => {
                            if (s.id !== question.section_id) return s;

                            return {
                                ...s,
                                questions: s.questions.map((q) => {
                                    if (q.id !== question.id) return q;

                                    if (updated.length === 0) {
                                        return { ...q, attempt_answer: null };
                                    }

                                    return {
                                        ...q,
                                        attempt_answer: {
                                            ...(q.attempt_answer ?? {
                                                id: Date.now(),
                                                question_id: q.id,
                                                answer_text: null,
                                                attempt_answer_options: []
                                            }),
                                            attempt_answer_options: updated
                                        }
                                    };
                                })
                            };
                        });

                        return { ...prev, sections: updatedSections };
                    });
                })
                .catch((error) => {
                    const message =
                        error instanceof Error
                            ? error.message
                            : typeof error === 'string'
                                ? error
                                : 'Xatolik yuz berdi';

                    toast.error(message);
                });

            return updated;
        });
    };

    return (
        <div key={question.id} className="p-4 border rounded-lg shadow-sm">
            <h2 className="font-medium text-lg">
                <span className="font-semibold">
                    {(() => {
                        const count = question.is_correct_count ?? 1;
                        return count > 1
                            ? Array.from({ length: count }, (_, i) => order - count + 1 + i).join('-')
                            : order;
                    })()}
                    .
                </span>
                {renderWithBlanks(question.textarea)}

                {section.question_type.type === 'matching' && (
                    <>
                        <select
                            id="answer_text"
                            value={matchingAnswer}
                            onChange={(e) => {
                                setMatchingAnswer(e.target.value);
                                debouncedSave(question.id, e.target.value);
                            }}
                            className="ms-2 inline rounded-md border border-blue-500 px-3 py-1.5 text-sm shadow-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">{t('select')}</option>
                            {buildRange(section.from_option, section.to_option).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </>
                )}
            </h2>

            {section.question_type.type === 'essay' && (
                <div className="relative">
                    <textarea
                        id="answer_text"
                        value={matchingAnswer}
                        onChange={(e) => {
                            setMatchingAnswer(e.target.value);
                            debouncedSave(question.id, e.target.value);
                        }}
                        className="w-full h-150 ms-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="Type your answer here..."
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                        {matchingAnswer.trim() === ''
                            ? 0
                            : matchingAnswer.trim().split(/\s+/).length}{' '}
                        words
                    </div>
                </div>
            )}

            {section.question_type.type !== 'fill_blank' &&
                section.question_type.type !== 'matching' &&
                section.question_type.type !== 'essay' &&
                section.question_type.type !== 'complete_section' && (
                    <div className="mt-3 space-y-2">
                        {question.options.map((option, oIndex) => (
                            <PracticeOption
                                attempt={attempt}
                                section={section}
                                question={question}
                                option={option}
                                index={oIndex}
                                selectedOptionIds={selectedOptionIds}
                                toggleOption={toggleOption}
                                key={oIndex}
                            />
                        ))}
                    </div>
                )}
        </div>
    );
}
