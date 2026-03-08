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
        <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
            <input
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

            <span className="flex-1">
                {String.fromCharCode(65 + index)}) {option.textarea}
            </span>

        </label>
    );
}
