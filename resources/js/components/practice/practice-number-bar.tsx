import React from 'react';
import { useTranslation } from 'react-i18next';
import { Part } from '@/types';

interface PartUpdateProps {
    part: Part;
}

export default function PracticeNumberBar({ part }: PartUpdateProps) {
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

                    return numbers.map((num, idx) => (
                        <span
                            key={`${question.id}-${idx}`}
                            className={`px-2 py-1 mr-1 rounded-full border-2 ${
                                question.attempt_answer &&
                                (
                                    (question.attempt_answer.attempt_answer_options?.length ?? 0) > 0 ||
                                    question.attempt_answer.answer_text
                                )
                                    ? 'bg-blue-400 text-white'
                                    : 'text-dark'
                            }`}
                        >

                    {
                        num + 1
                    }
                </span>
                    ))
                        ;
                });
            })}
        </div>
    );
}
