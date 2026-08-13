import React from 'react';
import { Part } from '@/types';

interface PracticeNumberBarProps {
    part: Part;
    flaggedIds: Set<number>;
    activeQuestionId?: number | null;
    setActiveQuestionId?: (id: number) => void;
}

export default function PracticeNumberBar({
    part,
    flaggedIds,
    activeQuestionId,
    setActiveQuestionId
}: PracticeNumberBarProps) {
    if (!part || !part.sections) return null;

    let questionIndex = part.order ? Number(part.order) : 0;

    return (
        <div key={part.id} className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-0.5">
            {part.sections.map((section) => {
                if (!section.questions) return null;

                return section.questions.map((question) => {
                    const count = question.is_correct_count ? Number(question.is_correct_count) : 1;
                    const startNum = questionIndex + 1;
                    const endNum = questionIndex + count;
                    questionIndex += count;

                    // Display text: single number "14" or range "18–19"
                    const displayText = count > 1 ? `${startNum}–${endNum}` : `${startNum}`;

                    const isAnswered = question.attempt_answer && (
                        (question.attempt_answer.attempt_answer_options?.length ?? 0) > 0 ||
                        (question.attempt_answer.answer_text && question.attempt_answer.answer_text.trim() !== '')
                    );

                    const isFlagged = flaggedIds.has(question.id);
                    const isActive = activeQuestionId === question.id;

                    return (
                        <button
                            key={question.id}
                            onClick={() => {
                                if (setActiveQuestionId) setActiveQuestionId(question.id);
                                const el = document.getElementById(`question-${question.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                            }}
                            className={`px-1.5 py-0.5 text-xs font-sans select-none cursor-pointer rounded-[2px] transition-all relative shrink-0 ${
                                isActive
                                    ? 'border border-[#2563eb] text-[#2563eb] font-bold bg-blue-50/50'
                                    : isAnswered
                                        ? 'font-bold underline text-black hover:text-blue-600'
                                        : 'text-gray-700 font-normal hover:text-blue-600'
                            }`}
                        >
                            {displayText}
                            {isFlagged && (
                                <span className="absolute -top-1 -right-1 text-orange-500 text-[9px] font-extrabold">★</span>
                            )}
                        </button>
                    );
                });
            })}
        </div>
    );
}
