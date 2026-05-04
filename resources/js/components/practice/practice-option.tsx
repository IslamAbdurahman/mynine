import React from 'react';
import { Attempt, Option, Question, Section } from '@/types';

interface PracticeOptionProps {
    attempt: Attempt;
    section: Section;
    question: Question;
    option: Option;
    index: number;
    selectedOptionIds: number[];
    toggleOption: (optionId: number) => void;
}

export default function PracticeOption({
                                           section,
                                           question,
                                           option,
                                           index,
                                           selectedOptionIds,
                                           toggleOption
                                       }: PracticeOptionProps) {

    const isChecked = selectedOptionIds.includes(option.id);

    return (
        <label className={`flex items-start gap-3 cursor-pointer p-3 border rounded-md transition-all duration-200 ${isChecked ? 'bg-primary/5 dark:bg-primary/10 border-primary/50 dark:border-primary/40 shadow-sm' : 'bg-white dark:bg-gray-800/50 border-border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
            <input
                className="mt-1 w-4 h-4 cursor-pointer accent-black focus:ring-black border-gray-400 dark:border-gray-500"
                type={section.question_type.input_type}
                name={`question-${question.id}${section.question_type.type === 'multiple_response' ? '[]' : ''}`}
                value={option.id}
                checked={isChecked}
                disabled={
                    section.question_type.type === 'multiple_response' &&
                    !isChecked &&
                    selectedOptionIds.length >= (question.is_correct_count ?? 1)
                }
                onChange={() => toggleOption(option.id)}
            />

            <span className="flex-1 text-[16px] leading-[1.6] text-gray-900 dark:text-gray-100 font-sans">
                <span className="font-semibold mr-1">{String.fromCharCode(65 + index)})</span> {option.textarea}
            </span>

        </label>
    );
}
