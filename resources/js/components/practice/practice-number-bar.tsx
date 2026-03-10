import React from 'react';
import { useTranslation } from 'react-i18next';
import { Part } from '@/types';

interface PartUpdateProps {
    part: Part;
    flaggedIds: Set<number>;
}

export default function PracticeNumberBar({ part, flaggedIds }: PartUpdateProps) {
    const { t } = useTranslation();

    if (!part || !part.sections) return null; // ✅ early return

    // Start numbering safely
    let questionIndex = part.order ? Number(part.order) : 0;

    return (
        <div key={part.id} className="flex flex-wrap">
            {part.sections.map((section) => {
                if (!section.questions) return null; // ✅ skip if no questions

                return section.questions.map((question) => {
                    const count = question.is_correct_count ? Number(question.is_correct_count) : 1;

                    const numbers = count > 1
                        ? Array.from({ length: count }, (_, i) => questionIndex + i)
                        : [questionIndex];

                    // Move index forward
                    questionIndex += count;

                    return numbers.map((num, idx) => {
                        const isAnswered = question.attempt_answer && (
                            (question.attempt_answer.attempt_answer_options?.length ?? 0) > 0 ||
                            (question.attempt_answer.answer_text && question.attempt_answer.answer_text.trim() !== '')
                        );
                        
                        return (
                            <span
                                key={`${question.id}-${idx}`}
                                onClick={() => {
                                    const el = document.getElementById(`question-${question.id}`);
                                    if (el) {
                                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                                className={`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 m-0.5 cursor-pointer font-bold text-sm select-none hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 relative ${
                                    isAnswered
                                        ? 'bg-white dark:bg-gray-800 text-black dark:text-gray-100 border-2 border-transparent border-b-gray-800 dark:border-b-gray-400'
                                        : 'bg-white dark:bg-gray-800 text-black dark:text-gray-100 border border-gray-400 dark:border-gray-600'
                                }`}
                                style={isAnswered ? { borderBottomWidth: '4px' } : {}}
                            >
                                {num + 1}
                                {flaggedIds.has(question.id) && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white dark:border-gray-900" />
                                )}
                            </span>
                        );
                    });
                });
            })}
        </div>
    );
}
