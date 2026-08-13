import React, { useState, useEffect, useRef } from 'react';
import { Highlighter, FileText, X, Trash2 } from 'lucide-react';

interface HighlightItem {
    id: string;
    text: string;
    note?: string;
}

interface TextHighlighterProps {
    attemptId: number;
    partId: number;
    children: React.ReactNode;
}

export default function TextHighlighter({ attemptId, partId, children }: TextHighlighterProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [highlights, setHighlights] = useState<HighlightItem[]>([]);
    const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
    const [selectedText, setSelectedText] = useState<string>('');
    const [activeNoteModal, setActiveNoteModal] = useState<HighlightItem | null>(null);
    const [noteInput, setNoteInput] = useState<string>('');
    const [activeMarkId, setActiveMarkId] = useState<string | null>(null);

    const storageKey = `ielts_highlights_${attemptId}_${partId}`;

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setHighlights(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse highlights', e);
            }
        }
    }, [storageKey]);

    const saveHighlights = (items: HighlightItem[]) => {
        setHighlights(items);
        localStorage.setItem(storageKey, JSON.stringify(items));
    };

    const handleMouseUp = (e: React.MouseEvent) => {
        // If clicking on an existing mark
        const target = e.target as HTMLElement;
        const existingMark = target.closest('.ielts-highlight-span') as HTMLElement;
        if (existingMark) {
            const hlId = existingMark.getAttribute('data-hl-id');
            const rect = existingMark.getBoundingClientRect();
            setActiveMarkId(hlId);
            setPopupPos({
                x: rect.left + rect.width / 2 - 50,
                y: Math.max(10, rect.top - 40)
            });
            return;
        }

        setActiveMarkId(null);

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            setPopupPos(null);
            setSelectedText('');
            return;
        }

        const text = selection.toString().trim();
        if (text.length < 2) {
            setPopupPos(null);
            setSelectedText('');
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (containerRef.current && containerRef.current.contains(range.commonAncestorContainer)) {
            setSelectedText(text);
            setPopupPos({
                x: Math.max(10, rect.left + rect.width / 2 - 70),
                y: Math.max(10, rect.top - 45)
            });
        }
    };

    const addHighlight = (withNote: boolean = false) => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || !selectedText) return;

        const range = selection.getRangeAt(0);
        const hlId = 'hl-' + Date.now();

        try {
            const mark = document.createElement('mark');
            mark.className = 'ielts-highlight-span cursor-pointer hover:opacity-80';
            mark.setAttribute('data-hl-id', hlId);
            mark.setAttribute('style', [
                'background-color: rgba(253, 224, 71, 0.75)',
                'color: inherit',
                'padding: 1px 0',
                'border-radius: 0',
                'box-decoration-break: clone',
                '-webkit-box-decoration-break: clone',
            ].join(';'));
            range.surroundContents(mark);
        } catch (e) {
            console.warn('Range surround contents fallback:', e);
        }

        const newItem: HighlightItem = {
            id: hlId,
            text: selectedText,
            note: withNote ? '' : undefined
        };
        const updated = [...highlights, newItem];
        saveHighlights(updated);

        setPopupPos(null);
        setSelectedText('');
        selection.removeAllRanges();

        if (withNote) {
            setActiveNoteModal(newItem);
            setNoteInput('');
        }
    };

    const removeHighlight = (id: string) => {
        const updated = highlights.filter((h) => h.id !== id);
        saveHighlights(updated);

        // Remove DOM mark element
        if (containerRef.current) {
            const markEl = containerRef.current.querySelector(`[data-hl-id="${id}"]`);
            if (markEl) {
                const parent = markEl.parentNode;
                while (markEl.firstChild) parent?.insertBefore(markEl.firstChild, markEl);
                parent?.removeChild(markEl);
            }
        }

        if (activeNoteModal?.id === id) {
            setActiveNoteModal(null);
        }
        setPopupPos(null);
        setActiveMarkId(null);
    };

    const saveNote = () => {
        if (!activeNoteModal) return;
        const updated = highlights.map((h) =>
            h.id === activeNoteModal.id ? { ...h, note: noteInput } : h
        );
        saveHighlights(updated);
        setActiveNoteModal(null);
    };

    return (
        <div ref={containerRef} onMouseUp={handleMouseUp} className="relative select-text">
            {children}

            {/* Context Menu Popup Bar */}
            {popupPos && (
                <div
                    style={{ left: `${popupPos.x}px`, top: `${popupPos.y}px` }}
                    className="fixed z-50 flex items-center gap-1 bg-[#1f2937] text-white px-2 py-1.5 rounded-lg shadow-2xl border border-gray-700 animate-in fade-in zoom-in-95 duration-100 select-none"
                >
                    {activeMarkId ? (
                        <button
                            onClick={() => removeHighlight(activeMarkId)}
                            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold hover:bg-red-600 text-red-200 hover:text-white rounded transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => addHighlight(false)}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold hover:bg-yellow-500 hover:text-black rounded transition-colors"
                            >
                                <Highlighter className="w-3.5 h-3.5" />
                                Highlight
                            </button>
                            <button
                                onClick={() => addHighlight(true)}
                                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold hover:bg-blue-500 hover:text-white rounded transition-colors"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                Note
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Highlights Sidebar / Chips indicator */}
            {highlights.length > 0 && (
                <div className="mt-6 p-3 bg-yellow-50/90 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-md">
                    <div className="text-xs font-bold text-yellow-800 dark:text-yellow-400 mb-2 uppercase tracking-wide flex items-center justify-between">
                        <span>Your Highlights & Notes ({highlights.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {highlights.map((hl) => (
                            <div
                                key={hl.id}
                                className="flex items-center gap-1.5 bg-yellow-200 dark:bg-yellow-900/60 text-yellow-900 dark:text-yellow-200 text-xs px-2.5 py-1 rounded-full border border-yellow-300 dark:border-yellow-700"
                            >
                                <span className="max-w-[160px] truncate font-medium">"{hl.text}"</span>
                                {hl.note && (
                                    <span
                                        onClick={() => {
                                            setActiveNoteModal(hl);
                                            setNoteInput(hl.note || '');
                                        }}
                                        className="cursor-pointer text-blue-600 dark:text-blue-400 underline font-semibold ml-1"
                                    >
                                        [Note]
                                    </span>
                                )}
                                <button
                                    onClick={() => removeHighlight(hl.id)}
                                    className="ml-1 hover:text-red-600 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Note Editor Modal */}
            {activeNoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl max-w-md w-full border border-gray-300 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700">
                            Add Note for: <span className="italic font-normal">"{activeNoteModal.text}"</span>
                        </h4>
                        <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Type your study note..."
                            className="w-full h-24 mt-3 p-2.5 text-sm border rounded dark:bg-gray-900 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                onClick={() => setActiveNoteModal(null)}
                                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveNote}
                                className="px-4 py-1.5 text-xs font-semibold bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-90 transition-opacity"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
