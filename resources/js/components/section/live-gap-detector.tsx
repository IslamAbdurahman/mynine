import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertTriangle, Info, HelpCircle, Layers } from 'lucide-react';

interface LiveGapDetectorProps {
    textarea: string;
    startIndex?: number; // Optional starting question number (e.g., 8)
    onInsertGap?: (gapText?: string) => void;
}

export interface DetectedGap {
    index: number;
    questionNumber: number;
    rawText: string;
    cleanText: string;
    alternatives: string[];
}

export default function LiveGapDetector({
    textarea = '',
    startIndex = 1,
    onInsertGap
}: LiveGapDetectorProps) {
    const { t } = useTranslation();

    const { gaps, hasUnclosedBracket, hasEmptyBracket } = useMemo(() => {
        const raw = textarea || '';

        // Strip HTML attributes that might contain curly braces or data attributes
        const cleanedHtml = raw.replace(/\s*data-v-[a-z0-9-]+="[^"]*"/gi, '');

        // Check for unclosed brackets: count of '{' vs '}'
        const openCount = (cleanedHtml.match(/\{/g) || []).length;
        const closeCount = (cleanedHtml.match(/\}/g) || []).length;
        const hasUnclosed = openCount !== closeCount;

        const regex = /\{([^\}]*)\}/g;
        const list: DetectedGap[] = [];
        let match: RegExpExecArray | null;
        let emptyFound = false;

        let idx = 0;
        while ((match = regex.exec(cleanedHtml)) !== null) {
            const rawInside = match[1];
            // Strip any internal HTML tags (e.g. <span>caves</span>)
            const cleanInside = rawInside.replace(/<[^>]*>/g, '').trim();

            if (!cleanInside) {
                emptyFound = true;
                continue;
            }

            // Split by alternative delimiters: /, ;, |
            const alternatives = cleanInside
                .split(/[\/;|]/)
                .map((alt) => alt.trim())
                .filter((alt) => alt.length > 0);

            list.push({
                index: idx,
                questionNumber: startIndex + idx,
                rawText: rawInside,
                cleanText: cleanInside,
                alternatives: alternatives.length > 0 ? alternatives : [cleanInside]
            });
            idx++;
        }

        return {
            gaps: list,
            hasUnclosedBracket: hasUnclosed,
            hasEmptyBracket: emptyFound
        };
    }, [textarea, startIndex]);

    return (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-3 transition-all duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-600 text-white dark:bg-blue-500">
                        <Layers className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                            {t('live_gap_detector_title') || "Jonli savollar detektori (Gaps Detector)"}
                        </h4>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300">
                            {gaps.length > 0
                                ? (t('gaps_detected_count', { count: gaps.length }) || `Matnda ${gaps.length} ta savol (bo'sh joy) aniqlandi`)
                                : (t('no_gaps_detected') || "Matnda hozircha hech qanday bo'sh joy aniqlanmadi")}
                        </p>
                    </div>
                </div>

                {/* Question count badge */}
                {gaps.length > 0 && (
                    <div className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>
                            {gaps.length} {t('questions_count') || "ta savol"}
                        </span>
                    </div>
                )}
            </div>

            {/* Warnings if any */}
            {hasUnclosedBracket && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                        {t('unclosed_bracket_warning') || "Diqqat: Matnda ochilgan, ammo yopilmagan { qavs mavjud! Barcha qavslar yopilganligini tekshiring."}
                    </span>
                </div>
            )}

            {hasEmptyBracket && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                        {t('empty_bracket_warning') || "Bo'sh qavs {} aniqlandi. Qavs ichiga to'g'ri javob so'zini yozing."}
                    </span>
                </div>
            )}

            {/* Gaps List / Badges */}
            {gaps.length > 0 ? (
                <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                        {t('detected_answers_preview') || "Aniqlangan to'g'ri javoblar ro'yxati:"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {gaps.map((gap) => {
                            const isMulti = gap.alternatives.length > 1;
                            return (
                                <div
                                    key={gap.index}
                                    className={`p-2 rounded-lg border flex items-start gap-2 text-xs transition-all ${
                                        isMulti
                                            ? 'bg-purple-50/70 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                                            : 'bg-white/90 border-gray-200 dark:bg-gray-800/90 dark:border-gray-700 text-gray-800 dark:text-gray-100'
                                    } shadow-2xs`}
                                >
                                    <span className="shrink-0 px-1.5 py-0.5 rounded font-mono font-bold bg-blue-600 text-white text-[10px]">
                                        Q{gap.questionNumber}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        {isMulti ? (
                                            <div>
                                                <div className="font-semibold text-[11px] flex flex-wrap items-center gap-1">
                                                    {gap.alternatives.map((alt, ai) => (
                                                        <React.Fragment key={ai}>
                                                            <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/60 font-mono font-bold">
                                                                {alt}
                                                            </span>
                                                            {ai < gap.alternatives.length - 1 && (
                                                                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-normal">
                                                                    {t('or') || 'yoki'}
                                                                </span>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                <span className="block text-[9px] text-purple-600 dark:text-purple-400 mt-0.5">
                                                    {gap.alternatives.length} {t('alternative_answers_count') || "ta muqobil javob"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="font-mono font-bold break-all">
                                                {gap.cleanText}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="p-3 bg-white/70 dark:bg-gray-900/50 rounded-lg border border-dashed border-blue-200 dark:border-blue-900 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-200">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{t('how_to_create_gaps') || "Bo'sh joylarni (savollarni) qanday kiritish kerak?"}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                        {t('gaps_instructions_hint') || "Matn ichida to'g'ri javobni { javob } shaklida yozing. Agar bir nechta to'g'ri variant bo'lsa (masalan: 14000 yoki 14,000), ularni { 14000 / 14,000 } ko'rinishida yozing."}
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-blue-700 dark:text-blue-300">
                        {t('guide.example_label') || "Misol"}: <code>Excavations inside &#123; caves &#125; revealed axes made of &#123; stone / stones &#125;</code>
                    </div>
                </div>
            )}
        </div>
    );
}
