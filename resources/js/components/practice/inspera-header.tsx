import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CountdownTimer } from './countdown-timer';
import { Eye, EyeOff, Wifi, Bell, Menu, Edit3, X, CheckCircle, Info, Settings, HelpCircle, FileText } from 'lucide-react';
import AudioEqualizer from './audio-equalizer';

interface InsperaHeaderProps {
    testTypeName?: string;
    candidateName?: string;
    finishedAt: string | null;
    serverTimeOffset: number;
    audioPath?: string | null;
    isTimeUp: boolean;
    onExpire: () => void;
    textSize: 'normal' | 'large' | 'xlarge';
    setTextSize: (size: 'normal' | 'large' | 'xlarge') => void;
    colorScheme: 'standard' | 'yellow-black' | 'blue-white';
    setColorScheme: (scheme: 'standard' | 'yellow-black' | 'blue-white') => void;
}

export default function InsperaHeader({
    testTypeName,
    candidateName,
    finishedAt,
    serverTimeOffset,
    audioPath,
    isTimeUp,
    onExpire,
    textSize,
    setTextSize,
    colorScheme,
    setColorScheme
}: InsperaHeaderProps) {
    const { t } = useTranslation();
    const [isTimerHidden, setIsTimerHidden] = useState<boolean>(() => {
        return localStorage.getItem('ielts_timer_hidden') === 'true';
    });

    const [activeModal, setActiveModal] = useState<'none' | 'wifi' | 'bell' | 'menu'>('none');

    const toggleTimerHidden = () => {
        const next = !isTimerHidden;
        setIsTimerHidden(next);
        localStorage.setItem('ielts_timer_hidden', String(next));
    };

    const cycleTextSize = () => {
        if (textSize === 'normal') setTextSize('large');
        else if (textSize === 'large') setTextSize('xlarge');
        else setTextSize('normal');
    };

    const cycleColorScheme = () => {
        if (colorScheme === 'standard') setColorScheme('yellow-black');
        else if (colorScheme === 'yellow-black') setColorScheme('blue-white');
        else setColorScheme('standard');
    };

    const handleNotesClick = () => {
        window.dispatchEvent(new CustomEvent('toggle-candidate-notes'));
    };

    return (
        <header className="flex-none h-14 bg-white text-gray-900 border-b border-gray-300 flex justify-between items-center px-4 shadow-2xs z-50 select-none whitespace-nowrap overflow-x-auto hide-scrollbar relative">
            {/* Left side: IELTS logo, candidate, part name, instructions */}
            <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#e11d48] text-white font-extrabold text-sm px-2.5 py-1 rounded-[2px] tracking-tight leading-none shrink-0">
                    IELTS
                </div>
                <span className="text-sm font-bold text-gray-800 shrink-0">
                    {candidateName || 'Admin'}
                </span>
                <span className="text-gray-300 font-light text-base">|</span>
                <span className="font-bold text-sm text-gray-900 shrink-0">{testTypeName || 'Reading'}</span>
                <span className="text-gray-500 text-sm hidden lg:inline shrink-0">
                    Read the text and answer questions.
                </span>
            </div>

            {/* Right side: Accessibility controls, timer & system icons */}
            <div className="flex items-center gap-2.5 shrink-0">
                {/* Audio Equalizer if listening */}
                {testTypeName?.toLowerCase() === 'listening' && !isTimeUp && finishedAt && audioPath && (
                    <div className="mr-1 shrink-0">
                        <AudioEqualizer
                            src={`/${audioPath}`}
                            autoPlay
                            endTime={new Date(finishedAt).toISOString()}
                        />
                    </div>
                )}

                {/* Text Size Button */}
                <button
                    onClick={cycleTextSize}
                    className="header-btn text-xs font-bold px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[2px] transition-colors uppercase text-gray-800 shrink-0 cursor-pointer"
                    title="Change Text Size (Standard / Large / Extra-Large)"
                >
                    {textSize === 'normal' ? 'Standard' : textSize === 'large' ? 'Large' : 'X-Large'}
                </button>

                {/* Color Scheme Button */}
                <button
                    onClick={cycleColorScheme}
                    className="header-btn text-xs font-bold px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[2px] transition-colors uppercase text-gray-800 shrink-0 cursor-pointer"
                    title="Change Color Contrast Scheme"
                >
                    {colorScheme === 'standard' ? 'Standard' : colorScheme === 'yellow-black' ? 'Yellow/Black' : 'Blue/White'}
                </button>

                {/* Timer Display */}
                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-[2px] border border-gray-300 font-mono text-sm shrink-0">
                    <span className="text-xs font-bold text-gray-500 uppercase">TIME REMAINING:</span>
                    {isTimerHidden ? (
                        <span className="font-bold text-gray-400">--:--:--</span>
                    ) : (
                        <div className="font-bold text-red-600">
                            <CountdownTimer
                                finishedAt={finishedAt}
                                serverTimeOffset={serverTimeOffset}
                                onExpire={onExpire}
                            />
                        </div>
                    )}
                    <button
                        onClick={toggleTimerHidden}
                        className="header-btn ml-0.5 text-gray-400 hover:text-black transition-colors"
                        title={isTimerHidden ? 'Show timer' : 'Hide timer'}
                    >
                        {isTimerHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                </div>

                <span className="text-gray-300 font-light text-sm">|</span>

                {/* System Icons */}
                <div className="flex items-center gap-2 text-gray-600 shrink-0">
                    <button
                        onClick={() => setActiveModal(activeModal === 'wifi' ? 'none' : 'wifi')}
                        className="header-btn p-1 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="Connection Status"
                    >
                        <Wifi className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => setActiveModal(activeModal === 'bell' ? 'none' : 'bell')}
                        className="header-btn p-1 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="Notifications"
                    >
                        <Bell className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={() => setActiveModal(activeModal === 'menu' ? 'none' : 'menu')}
                        className="header-btn p-1 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="System Options & Settings"
                    >
                        <Menu className="w-4.5 h-4.5" />
                    </button>
                    <button
                        onClick={handleNotesClick}
                        className="header-btn p-1 hover:text-black hover:bg-gray-100 rounded transition-colors"
                        title="Toggle Candidate Notes"
                    >
                        <Edit3 className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Modals & Popups */}
            {activeModal !== 'none' && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 max-w-md w-full p-5 relative animate-in fade-in zoom-in-95 duration-150">
                        <button
                            onClick={() => setActiveModal('none')}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {activeModal === 'wifi' && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                                    <CheckCircle className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-gray-900">Network Connection Status</h3>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="font-semibold text-gray-700">Status:</span>
                                        <span className="text-emerald-600 font-bold">Online (Stable)</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="font-semibold text-gray-700">Latency:</span>
                                        <span>18 ms</span>
                                    </div>
                                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                                        <span className="font-semibold text-gray-700">Auto-Sync:</span>
                                        <span>Active (Realtime response saving)</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeModal === 'bell' && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-blue-600">
                                    <Bell className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-gray-900">Test Notifications</h3>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900 mb-2">
                                    <strong>Official Notice:</strong> Your answers are automatically saved as you navigate through questions.
                                </div>
                                <p className="text-xs text-gray-500 mt-2">No unread alerts for this session.</p>
                            </div>
                        )}

                        {activeModal === 'menu' && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-gray-800">
                                    <Settings className="w-6 h-6" />
                                    <h3 className="text-lg font-bold text-gray-900">Test Options & Settings</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Text Size</label>
                                        <div className="flex gap-2">
                                            {(['normal', 'large', 'xlarge'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setTextSize(s)}
                                                    className={`px-3 py-1 text-xs font-semibold rounded border ${textSize === s ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                                                >
                                                    {s.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 rounded border border-gray-200">
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Color Contrast</label>
                                        <div className="flex gap-2">
                                            {(['standard', 'yellow-black', 'blue-white'] as const).map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColorScheme(c)}
                                                    className={`px-2.5 py-1 text-xs font-semibold rounded border ${colorScheme === c ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300'}`}
                                                >
                                                    {c === 'standard' ? 'Standard' : c === 'yellow-black' ? 'Yellow/Black' : 'Blue/White'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200">
                                        <span className="text-xs font-bold text-gray-700 uppercase">Hide Timer</span>
                                        <button
                                            onClick={toggleTimerHidden}
                                            className="px-3 py-1 text-xs font-semibold bg-white border border-gray-300 rounded text-gray-800"
                                        >
                                            {isTimerHidden ? 'Show Timer' : 'Hide Timer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={() => setActiveModal('none')}
                                className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
