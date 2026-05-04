import React, { } from 'react';
import { useTranslation } from 'react-i18next';
import { Attempt, Part } from '@/types';
import PracticeQuestion from '@/components/practice/practice-question';

interface SectionUpdateProps {
    order: number;
    part: Part;
    attempt: Attempt;
    setSelectedPart: React.Dispatch<React.SetStateAction<Part | null>>;
    isFlagged: boolean;
    toggleFlag: (id: number) => void;
}

export default function PracticeEssay({
                                           order,
                                           part,
                                           attempt,
                                           setSelectedPart,
                                           isFlagged,
                                           toggleFlag
                                       }: SectionUpdateProps) {
    const { t } = useTranslation();

    const section_order = order ?? 0;
    return (
        <div>

            {/* Active Section */}
            {part.sections.map(
                (section, index) =>
                    (
                        <div key={section.id} className="p-2">
                            {section.questions.map((question, qIndex) => (
                                <PracticeQuestion
                                    setSelectedPart={setSelectedPart}
                                    key={qIndex}
                                    order={order}
                                    attempt={attempt}
                                    section={section}
                                    question={question}
                                    index={qIndex}
                                    isFlagged={isFlagged}
                                    toggleFlag={() => toggleFlag(question.id)}
                                />
                            ))}
                        </div>
                    )
            )}
        </div>
    );
}
