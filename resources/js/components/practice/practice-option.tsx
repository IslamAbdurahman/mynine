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
    const textLower = (option.textarea || '').toLowerCase().trim();
    const isStandardTFN = ['true', 'false', 'not given', 'yes', 'no'].includes(textLower);

    return (
        <label className={`flex items-center gap-3 cursor-pointer px-3 py-1.5 transition-colors rounded-[2px] select-none ${
            isChecked
                ? 'bg-[#e5e7eb] text-black font-semibold'
                : 'bg-transparent text-gray-900 hover:bg-gray-100/70'
        }`}>
            <input
                className="w-4 h-4 cursor-pointer accent-black focus:ring-0 border-gray-400"
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

            <span className="flex-1 text-sm font-sans uppercase tracking-tight leading-relaxed">
                {!isStandardTFN && (
                    <span className="font-bold mr-1.5">{String.fromCharCode(65 + index)})</span>
                )}
                {option.textarea}
            </span>
        </label>
    );
}
