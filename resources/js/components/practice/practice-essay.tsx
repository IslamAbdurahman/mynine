import React, { } from 'react';
import { useTranslation } from 'react-i18next';
import { Attempt, Part } from '@/types';
import PracticeQuestion from '@/components/practice/practice-question';

interface SectionUpdateProps {
    order: number;
    part: Part;
    attempt: Attempt;
}

export default function PracticeEssay({ order, part, attempt }: SectionUpdateProps) {
    const { t } = useTranslation();

    let section_order = order ?? 0;
    return (
        <div>

            {/* Active Section */}
            {part.sections.map(
                (section, index) =>
                    (
                        <div key={section.id} className="p-2">
                            {section.questions.map((question, qIndex) => (
                                <PracticeQuestion
                                    setSelectedPart={() => {}}
                                    key={qIndex}
                                    order={1}
                                    attempt={attempt}
                                    section={section}
                                    question={question}
                                    index={qIndex}
                                />
                            ))}
                        </div>
                    )
            )}
        </div>
    );
}
