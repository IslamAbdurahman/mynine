import React from 'react';
import { Option, QuestionType } from '@/types';
import { CheckCircle2 } from 'lucide-react';

interface QuestionOptionProps {
    option: Option;
    index: number;
    question_type?: QuestionType;
}

export default function QuestionOption({ option, index }: QuestionOptionProps) {
    const letter = String.fromCharCode(65 + index);

    return (
        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-sm">
            <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-gray-500 dark:text-gray-400 text-xs shrink-0">
                    {letter})
                </span>
                <span className="text-gray-800 dark:text-gray-200 font-medium truncate">
                    {option.textarea}
                </span>
            </div>

            {Boolean(option.is_correct) && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    To'g'ri
                </span>
            )}
        </div>
    );
}
