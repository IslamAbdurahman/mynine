import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle, X, ArrowRight, Loader2 } from 'lucide-react';

interface FinishConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    testTypeName?: string;
    answeredCount?: number;
    totalCount?: number;
    isLoading?: boolean;
    isFullExam?: boolean;
}

export default function FinishConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    testTypeName,
    answeredCount = 0,
    totalCount = 0,
    isLoading = false,
    isFullExam = false,
}: FinishConfirmationModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const unansweredCount = Math.max(0, totalCount - answeredCount);
    const hasUnanswered = totalCount > 0 && unansweredCount > 0;
    const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
            <div
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${hasUnanswered ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>
                            {hasUnanswered ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">
                                {isFullExam
                                    ? (t('confirm_submit_test_title') || 'Imtihonni yakunlash')
                                    : `${testTypeName || 'Bo\'lim'}ni yakunlash`}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('confirm_finish_modal_desc') || 'Muddatidan oldin yakunlashni tasdiqlash'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Question Breakdown Stats (if question counts are available) */}
                    {totalCount > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 space-y-3">
                            <div className="flex justify-between items-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                                <span>{t('test_progress') || 'Test ko\'rsatkichi'}</span>
                                <span className="font-mono text-gray-900 dark:text-gray-100 font-bold">{progressPercent}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${hasUnanswered ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                    <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{t('total_questions') || 'Jami'}</span>
                                    <span className="font-bold text-base text-gray-800 dark:text-gray-100">{totalCount}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                                    <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">{t('answered') || 'Javob berilgan'}</span>
                                    <span className="font-bold text-base text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
                                </div>
                                <div className={`p-2 rounded-lg border ${hasUnanswered ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                                    <span className={`block text-[10px] uppercase tracking-wider font-semibold ${hasUnanswered ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>{t('unanswered') || 'Javobsiz'}</span>
                                    <span className={`font-bold text-base ${hasUnanswered ? 'text-amber-700 dark:text-amber-300' : 'text-gray-700 dark:text-gray-300'}`}>{unansweredCount}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning / Confirmation Banner */}
                    {hasUnanswered ? (
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                                <strong>{t('attention') || 'Diqqat!'}:</strong> Sizda <span className="font-bold text-amber-700 dark:text-amber-300">{unansweredCount} ta</span> javob berilmagan savol bor. Agarda muddatidan oldin yakunlasangiz, belgilatlanmagan savollarga ball berilmaydi.
                            </div>
                        </div>
                    ) : (
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                                {t('all_answered_info') || 'Ajoyib! Barcha savollarga javob berdingiz. Yakunlash uchun pastdagi tugmani bosing.'}
                            </div>
                        </div>
                    )}

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                        * {t('finish_cannot_undo') || 'Tugmani bosishingiz bilan natijalar saqlanadi va ushbu bo\'lim yakunlanadi.'}
                    </p>
                </div>

                {/* Footer buttons */}
                <div className="px-5 py-3.5 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors cursor-pointer"
                    >
                        {t('continue_test') || 'Davom ettirish'}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{t('submitting') || 'Yakunlanmoqda...'}</span>
                            </>
                        ) : (
                            <>
                                <span>{t('yes_finish') || 'Ha, yakunlash'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
